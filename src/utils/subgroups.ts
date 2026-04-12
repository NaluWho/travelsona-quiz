export type SubgroupMember = {
  id: string
  name: string
  socialScore: number
}

export type SubgroupPairScore = {
  aId: string
  bId: string
  score: number
}

export type SuggestedCluster = {
  memberIds: string[]
  memberNames: string[]
  avgInternal: number
  avgExternal: number
  cohesion: number
}

export type BridgeMember = {
  id: string
  name: string
  clusterAffinities: Array<{ clusterLabel: string; affinity: number }>
  bridgeStrength: number
}

export type SubgroupSuggestion = {
  clusters: SuggestedCluster[]
  bridges: BridgeMember[]
  confidence: number
  baselineAverage: number
  withinAverage: number
  crossAverage: number
  improvement: number
  separation: number
  isMeaningful: boolean
}

const CROSS_WEIGHT = 0.75

function toPairKey(aId: string, bId: string): string {
  return aId < bId ? `${aId}::${bId}` : `${bId}::${aId}`
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeScore(score: number): number {
  return (score - 50) / 50
}

function buildScoreLookup(pairs: SubgroupPairScore[]): Map<string, number> {
  const lookup = new Map<string, number>()

  for (const pair of pairs) {
    lookup.set(toPairKey(pair.aId, pair.bId), pair.score)
  }

  return lookup
}

function getPairScore(lookup: Map<string, number>, aId: string, bId: string): number {
  if (aId === bId) {
    return 100
  }

  return lookup.get(toPairKey(aId, bId)) ?? 50
}

function isValidPartition(): boolean {
  return true
}

function scorePartition(
  assignments: number[],
  members: SubgroupMember[],
  lookup: Map<string, number>,
): {
  objective: number
  withinAverage: number
  crossAverage: number
  separation: number
  clusters: SuggestedCluster[]
} {
  let withinObjective = 0
  let crossObjective = 0

  const withinScores: number[] = []
  const crossScores: number[] = []

  for (let i = 0; i < members.length; i += 1) {
    for (let j = i + 1; j < members.length; j += 1) {
      const score = getPairScore(lookup, members[i].id, members[j].id)
      const normalized = normalizeScore(score)

      if (assignments[i] === assignments[j]) {
        withinObjective += normalized
        withinScores.push(score)
      } else {
        crossObjective += normalized
        crossScores.push(score)
      }
    }
  }

  const objective = withinObjective - (CROSS_WEIGHT * crossObjective)
  const withinAverage = average(withinScores)
  const crossAverage = average(crossScores)
  const separation = withinAverage - crossAverage

  const clusterIds = Array.from(new Set(assignments)).sort((a, b) => a - b)
  const clusters: SuggestedCluster[] = clusterIds.map((clusterId) => {
    const memberIndexes = assignments
      .map((assignedCluster, index) => ({ assignedCluster, index }))
      .filter((entry) => entry.assignedCluster === clusterId)
      .map((entry) => entry.index)

    const memberIds = memberIndexes.map((index) => members[index].id)
    const memberNames = memberIndexes.map((index) => members[index].name)

    const internalScores: number[] = []
    const externalScores: number[] = []

    for (let i = 0; i < memberIndexes.length; i += 1) {
      for (let j = i + 1; j < memberIndexes.length; j += 1) {
        internalScores.push(getPairScore(lookup, members[memberIndexes[i]].id, members[memberIndexes[j]].id))
      }
    }

    for (const memberIndex of memberIndexes) {
      for (let other = 0; other < members.length; other += 1) {
        if (!memberIndexes.includes(other)) {
          externalScores.push(getPairScore(lookup, members[memberIndex].id, members[other].id))
        }
      }
    }

    const avgInternal = average(internalScores)
    const avgExternal = average(externalScores)

    return {
      memberIds,
      memberNames,
      avgInternal: Math.round(avgInternal),
      avgExternal: Math.round(avgExternal),
      cohesion: Math.round(avgInternal - avgExternal),
    }
  })

  return {
    objective,
    withinAverage,
    crossAverage,
    separation,
    clusters,
  }
}

function* generateAssignments(memberCount: number, clusterCount: number): Generator<number[]> {
  const assignments = new Array<number>(memberCount).fill(0)

  function* backtrack(index: number, maxUsedLabel: number): Generator<number[]> {
    if (index === memberCount) {
      if (maxUsedLabel + 1 === clusterCount) {
        yield [...assignments]
      }
      return
    }

    const remaining = memberCount - index
    const clustersStillNeeded = clusterCount - (maxUsedLabel + 1)
    if (remaining < clustersStillNeeded) {
      return
    }

    const maxLabel = Math.min(maxUsedLabel + 1, clusterCount - 1)
    for (let label = 0; label <= maxLabel; label += 1) {
      assignments[index] = label
      const nextMax = Math.max(maxUsedLabel, label)
      yield* backtrack(index + 1, nextMax)
    }
  }

  assignments[0] = 0
  yield* backtrack(1, 0)
}

function confidenceScore(withinAverage: number, separation: number, clusters: SuggestedCluster[]): number {
  const cohesionSignal = clamp(((withinAverage - 40) / 60) * 100, 0, 100)
  const separationSignal = clamp(((separation - 2) / 20) * 100, 0, 100)
  const sizesSignal = Math.max(...clusters.map((c) => c.memberIds.length)) > 1 ? 100 : 30

  return Math.round((cohesionSignal * 0.6) + (separationSignal * 0.2) + (sizesSignal * 0.2))
}

export function suggestSubgroups(members: SubgroupMember[], pairs: SubgroupPairScore[]): SubgroupSuggestion | null {
  if (members.length < 4) {
    return null
  }

  const lookup = buildScoreLookup(pairs)

  const allScores: number[] = []
  for (let i = 0; i < members.length; i += 1) {
    for (let j = i + 1; j < members.length; j += 1) {
      allScores.push(getPairScore(lookup, members[i].id, members[j].id))
    }
  }

  const baselineAverage = average(allScores)
  const maxClusters = Math.min(3, Math.floor(members.length / 2))

  let best: {
    objective: number
    withinAverage: number
    crossAverage: number
    separation: number
    clusters: SuggestedCluster[]
  } | null = null

  for (let clusterCount = 2; clusterCount <= maxClusters; clusterCount += 1) {
    for (const assignments of generateAssignments(members.length, clusterCount)) {
      if (!isValidPartition()) {
        continue
      }

      const scored = scorePartition(assignments, members, lookup)
      if (!best || scored.objective > best.objective) {
        best = scored
      }
    }
  }

  if (!best) {
    return null
  }

  const improvement = best.withinAverage - baselineAverage
  const confidence = confidenceScore(best.withinAverage, best.separation, best.clusters)
  const isMeaningful = best.separation >= 1 && improvement >= 0 && confidence >= 30

  // Identify bridges and remove them from clusters
  const bridges: BridgeMember[] = []
  const bridgeIds = new Set<string>()

  for (let i = 0; i < members.length; i += 1) {
    let memberCluster: SuggestedCluster | null = null
    let memberClusterIndex = -1
    for (let c = 0; c < best.clusters.length; c += 1) {
      if (best.clusters[c].memberIds.includes(members[i].id)) {
        memberCluster = best.clusters[c]
        memberClusterIndex = c
        break
      }
    }

    if (!memberCluster) continue

    const clusterAffinities: Array<{ clusterLabel: string; affinity: number }> = []
    const internalScores: number[] = []
    const externalScores: number[] = []

    // Calculate affinity to each cluster
    for (let c = 0; c < best.clusters.length; c += 1) {
      const cluster = best.clusters[c]
      const clusterLabel = String.fromCharCode(65 + c) // A, B, C, etc.
      const scores: number[] = []

      for (const otherId of cluster.memberIds) {
        if (otherId !== members[i].id) {
          scores.push(getPairScore(lookup, members[i].id, otherId))
        }
      }

      const affinity = average(scores)
      clusterAffinities.push({ clusterLabel, affinity: Math.round(affinity) })

      if (c === memberClusterIndex) {
        internalScores.push(...scores)
      } else {
        externalScores.push(...scores)
      }
    }

    const avgInternal = average(internalScores)
    const avgExternal = average(externalScores)
    const bridgeStrength = Math.abs(avgInternal - avgExternal)

    if (bridgeStrength <= 8) {
      bridges.push({
        id: members[i].id,
        name: members[i].name,
        clusterAffinities,
        bridgeStrength: Math.round(bridgeStrength),
      })
      bridgeIds.add(members[i].id)
    }
  }

  // Rebuild clusters without bridge members
  const refinedClusters: SuggestedCluster[] = []
  for (const cluster of best.clusters) {
    const refinedMemberIds = cluster.memberIds.filter((id) => !bridgeIds.has(id))
    if (refinedMemberIds.length === 0) {
      continue
    }

    const refinedMemberNames = refinedMemberIds.map((id) => members.find((m) => m.id === id)?.name || id)

    const internalScores: number[] = []
    const externalScores: number[] = []

    for (let i = 0; i < refinedMemberIds.length; i += 1) {
      for (let j = i + 1; j < refinedMemberIds.length; j += 1) {
        internalScores.push(getPairScore(lookup, refinedMemberIds[i], refinedMemberIds[j]))
      }
    }

    const allOthers = new Set(
      members
        .map((m) => m.id)
        .filter((id) => !refinedMemberIds.includes(id) && !bridgeIds.has(id)),
    )

    for (const memberId of refinedMemberIds) {
      for (const otherId of allOthers) {
        externalScores.push(getPairScore(lookup, memberId, otherId))
      }
    }

    const avgInternal = average(internalScores)
    const avgExternal = average(externalScores)
    const cohesion = Math.round(avgInternal - avgExternal)

    refinedClusters.push({
      memberIds: refinedMemberIds,
      memberNames: refinedMemberNames,
      avgInternal: Math.round(avgInternal),
      avgExternal: Math.round(avgExternal),
      cohesion,
    })
  }

  return {
    clusters: refinedClusters,
    bridges: bridges.sort((a, b) => a.bridgeStrength - b.bridgeStrength),
    confidence,
    baselineAverage: Math.round(baselineAverage),
    withinAverage: Math.round(best.withinAverage),
    crossAverage: Math.round(best.crossAverage),
    improvement: Math.round(improvement),
    separation: Math.round(best.separation),
    isMeaningful,
  }
}
