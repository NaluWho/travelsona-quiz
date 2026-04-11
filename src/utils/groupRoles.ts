import type { TraitScores } from '../types/quiz'

export type RoleKey = 'planner' | 'scout' | 'connector' | 'anchor' | 'flex'

export type RoleCandidate = {
  id: string
  name: string
  scores: TraitScores
}

export type GroupRoleCard = {
  key: RoleKey
  label: string
  coLabel: string
  mission: string
  primaryNames: string[]
  secondaryNames: string[]
  fitStrength: number | null
  primaryAffinity: number | null
  secondaryAffinity: number | null
  source: 'threshold' | 'direction' | 'none'
}

const ROLE_LABELS: Record<RoleKey, { label: string; coLabel: string; mission: string }> = {
  planner: {
    label: 'Planner',
    coLabel: 'Co-Planners',
    mission: 'Own the itinerary, lock key bookings, and keep the trip moving with confidence. (Traits: Structure + Initiative)',
  },
  scout: {
    label: 'Scout',
    coLabel: 'Co-Scouts',
    mission: 'Hunt for standout experiences, hidden gems, and high-energy moments. (Traits: Adventure + Pace)',
  },
  connector: {
    label: 'Connector',
    coLabel: 'Co-Connectors',
    mission: 'Keep group chemistry strong, read the room, and make sure everyone feels included. (Traits: Social + Energy)',
  },
  anchor: {
    label: 'Anchor',
    coLabel: 'Co-Anchors',
    mission: 'Protect budget and pacing so the group can last the whole trip without burnout. (Traits: Budget + Pace)',
  },
  flex: {
    label: 'Flex',
    coLabel: 'Co-Flex',
    mission: 'Bridge different travel styles and smooth conflicts when plans shift. (Traits: Most balanced overall profile)',
  },
}

const TRAIT_KEYS: Array<keyof TraitScores> = [
  'structure',
  'budget',
  'pace',
  'energy',
  'adventure',
  'immersion',
  'social',
  'initiative',
]

function affinity(role: Exclude<RoleKey, 'flex'>, scores: TraitScores): number {
  if (role === 'planner') {
    return scores.structure + scores.initiative
  }

  if (role === 'scout') {
    return scores.adventure + scores.pace
  }

  if (role === 'connector') {
    return scores.social + scores.energy
  }

  return -scores.budget + -scores.pace
}

function thresholdPass(role: Exclude<RoleKey, 'flex'>, scores: TraitScores): boolean {
  if (role === 'planner') {
    return scores.structure >= 2 && scores.initiative >= 1
  }

  if (role === 'scout') {
    return scores.adventure >= 2 && scores.pace >= 1
  }

  if (role === 'connector') {
    return scores.social >= 2 && scores.energy >= 1
  }

  return scores.budget <= -1 && scores.pace <= 0
}

function directionPass(role: Exclude<RoleKey, 'flex'>, scores: TraitScores): boolean {
  if (role === 'planner') {
    return scores.structure > 0 && scores.initiative > 0
  }

  if (role === 'scout') {
    return scores.adventure > 0 && scores.pace > 0
  }

  if (role === 'connector') {
    return scores.social > 0 && scores.energy > 0
  }

  return scores.budget < 0 && scores.pace < 0
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function buildRoleCard(role: Exclude<RoleKey, 'flex'>, candidates: RoleCandidate[]): GroupRoleCard {
  const byThreshold = candidates.filter((candidate) => thresholdPass(role, candidate.scores))
  const byDirection = candidates.filter((candidate) => directionPass(role, candidate.scores))
  const pool = byThreshold.length > 0 ? byThreshold : byDirection
  const source: GroupRoleCard['source'] = byThreshold.length > 0 ? 'threshold' : byDirection.length > 0 ? 'direction' : 'none'

  if (pool.length === 0) {
    return {
      key: role,
      label: ROLE_LABELS[role].label,
      coLabel: ROLE_LABELS[role].coLabel,
      mission: ROLE_LABELS[role].mission,
      primaryNames: [],
      secondaryNames: [],
      fitStrength: null,
      primaryAffinity: null,
      secondaryAffinity: null,
      source,
    }
  }

  const ranked = [...pool]
    .map((candidate) => ({
      ...candidate,
      affinity: affinity(role, candidate.scores),
    }))
    .sort((a, b) => b.affinity - a.affinity)

  const topAffinity = ranked[0].affinity
  const primaryNames = ranked.filter((entry) => entry.affinity === topAffinity).map((entry) => entry.name)
  const remaining = ranked.filter((entry) => entry.affinity < topAffinity)

  let secondaryAffinity: number | null = null
  let secondaryNames: string[] = []
  if (remaining.length > 0) {
    secondaryAffinity = remaining[0].affinity
    secondaryNames = remaining.filter((entry) => entry.affinity === secondaryAffinity).map((entry) => entry.name)
  }

  return {
    key: role,
    label: ROLE_LABELS[role].label,
    coLabel: ROLE_LABELS[role].coLabel,
    mission: ROLE_LABELS[role].mission,
    primaryNames,
    secondaryNames,
    fitStrength: clampPercent((topAffinity / 12) * 100),
    primaryAffinity: topAffinity,
    secondaryAffinity,
    source,
  }
}

function buildFlexCard(candidates: RoleCandidate[]): GroupRoleCard {
  if (candidates.length === 0) {
    return {
      key: 'flex',
      label: ROLE_LABELS.flex.label,
      coLabel: ROLE_LABELS.flex.coLabel,
      mission: ROLE_LABELS.flex.mission,
      primaryNames: [],
      secondaryNames: [],
      fitStrength: null,
      primaryAffinity: null,
      secondaryAffinity: null,
      source: 'none',
    }
  }

  const centroid = TRAIT_KEYS.reduce((acc, key) => {
    acc[key] = candidates.reduce((sum, candidate) => sum + candidate.scores[key], 0) / candidates.length
    return acc
  }, {} as TraitScores)

  const ranked = candidates
    .map((candidate) => {
      const distance = TRAIT_KEYS.reduce((sum, key) => sum + Math.abs(candidate.scores[key] - centroid[key]), 0)
      // Higher is better for consistency with other roles.
      const affinityScore = -distance
      return {
        ...candidate,
        affinity: affinityScore,
      }
    })
    .sort((a, b) => b.affinity - a.affinity)

  const topAffinity = ranked[0].affinity
  const topDistance = -topAffinity
  const primaryNames = ranked.filter((entry) => entry.affinity === topAffinity).map((entry) => entry.name)
  const remaining = ranked.filter((entry) => entry.affinity < topAffinity)

  let secondaryAffinity: number | null = null
  let secondaryNames: string[] = []
  if (remaining.length > 0) {
    secondaryAffinity = remaining[0].affinity
    secondaryNames = remaining.filter((entry) => entry.affinity === secondaryAffinity).map((entry) => entry.name)
  }

  return {
    key: 'flex',
    label: ROLE_LABELS.flex.label,
    coLabel: ROLE_LABELS.flex.coLabel,
    mission: ROLE_LABELS.flex.mission,
    primaryNames,
    secondaryNames,
    fitStrength: clampPercent((1 - topDistance / 96) * 100),
    primaryAffinity: topAffinity,
    secondaryAffinity,
    source: 'threshold',
  }
}

export function buildGroupRoleCards(candidates: RoleCandidate[]): GroupRoleCard[] {
  return [
    buildRoleCard('planner', candidates),
    buildRoleCard('scout', candidates),
    buildRoleCard('connector', candidates),
    buildRoleCard('anchor', candidates),
    buildFlexCard(candidates),
  ]
}

export function getRoleCoverage(cards: GroupRoleCard[]): number {
  const filledCount = cards.filter((card) => card.primaryNames.length > 0).length
  return Math.round((filledCount / cards.length) * 100)
}
