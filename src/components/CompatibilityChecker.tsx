import { useEffect, useMemo, useState } from 'react'
import { interestMap, travelInterests } from '../data/interests'
import { motivationMap } from '../data/motivations'
import { TraitRadarChart } from './TraitRadarChart'
import { traitDefinitions } from '../data/traits'
import type { QuizResult, TraitScores } from '../types/quiz'
import { calculateCompatibility } from '../utils/compatibility'
import { decodeResult, extractCode } from '../utils/encoding'
import { getNarrative } from '../data/compatibilityNarrative'
import { decodeShareCode } from '../utils/encoding'
import { buildGroupRoleCards, getRoleCoverage } from '../utils/groupRoles'
import { suggestSubgroups } from '../utils/subgroups'

type CompatibilityCheckerProps = {
  myResult: QuizResult
  initialFriendCode?: string | null
}

type GroupMember = {
  id: string
  name: string
  result: QuizResult
  code: string
}

type PairScoreCard = {
  id: string
  aId: string
  bId: string
  aName: string
  bName: string
  score: number
}

const RADAR_COLORS = [
  { fill: '#0d9488', stroke: '#0f766e', dot: '#115e59' },
  { fill: '#fda4af', stroke: '#e11d48', dot: '#e11d48' },
  { fill: '#c4b5fd', stroke: '#7c3aed', dot: '#6d28d9' },
  { fill: '#93c5fd', stroke: '#2563eb', dot: '#1d4ed8' },
  { fill: '#fdba74', stroke: '#ea580c', dot: '#c2410c' },
  { fill: '#86efac', stroke: '#16a34a', dot: '#15803d' },
  { fill: '#f9a8d4', stroke: '#db2777', dot: '#be185d' },
  { fill: '#67e8f9', stroke: '#0891b2', dot: '#0e7490' },
  { fill: '#fcd34d', stroke: '#ca8a04', dot: '#a16207' },
  { fill: '#d8b4fe', stroke: '#9333ea', dot: '#7e22ce' },
]

export function CompatibilityChecker({ myResult, initialFriendCode }: CompatibilityCheckerProps) {
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [activeView, setActiveView] = useState<'group' | string>('group')
  const [visibleRadarMemberIds, setVisibleRadarMemberIds] = useState<string[]>(['you'])
  const [radarColorByMemberId, setRadarColorByMemberId] = useState<Record<string, number>>({ you: 0 })
  const [friendCodeProcessed, setFriendCodeProcessed] = useState(false)

  const myScores: TraitScores = myResult.scores

  // Auto-populate with friend code if provided
  useEffect(() => {
    if (initialFriendCode && !friendCodeProcessed && groupMembers.length === 0) {
      const decoded = decodeShareCode(initialFriendCode)
      if (decoded) {
        const member: GroupMember = {
          id: `friend-${Date.now()}`,
          name: 'Friend',
          result: decoded,
          code: initialFriendCode,
        }
        setGroupMembers([member])
        setActiveView(member.id)
        setVisibleRadarMemberIds(['you', member.id])
        setFriendCodeProcessed(true)
        setError(null)
      }
    }
  }, [initialFriendCode, friendCodeProcessed, groupMembers.length])

  const activeMember = useMemo(
    () => groupMembers.find((member) => member.id === activeView) ?? null,
    [activeView, groupMembers],
  )

  const selectedCompatibility = useMemo(() => {
    if (!activeMember) {
      return null
    }

    return calculateCompatibility(
      myScores,
      activeMember.result.scores,
      myResult.interests,
      activeMember.result.interests,
      myResult.disinterests,
      activeMember.result.disinterests,
      myResult.motivations,
      activeMember.result.motivations,
      myResult.primaryMotivation,
      activeMember.result.primaryMotivation,
    )
  }, [
    activeMember,
    myResult.interests,
    myResult.disinterests,
    myResult.motivations,
    myResult.primaryMotivation,
    myScores,
  ])

  const groupPeople = useMemo(
    () => [
      { id: 'you', name: 'You', result: myResult },
      ...groupMembers.map((member) => ({ id: member.id, name: member.name, result: member.result })),
    ],
    [groupMembers, myResult],
  )

  const groupPairwise = useMemo(() => {
    const pairs: PairScoreCard[] = []

    for (let i = 0; i < groupPeople.length; i += 1) {
      for (let j = i + 1; j < groupPeople.length; j += 1) {
        const a = groupPeople[i]
        const b = groupPeople[j]
        const result = calculateCompatibility(
          a.result.scores,
          b.result.scores,
          a.result.interests,
          b.result.interests,
          a.result.disinterests,
          b.result.disinterests,
          a.result.motivations,
          b.result.motivations,
          a.result.primaryMotivation,
          b.result.primaryMotivation,
        )

        pairs.push({
          id: `${a.id}-${b.id}`,
          aId: a.id,
          bId: b.id,
          aName: a.name,
          bName: b.name,
          score: result.overall,
        })
      }
    }

    pairs.sort((a, b) => b.score - a.score)

    const average = pairs.length === 0
      ? null
      : Math.round(pairs.reduce((sum, pair) => sum + pair.score, 0) / pairs.length)

    return { pairs, average }
  }, [groupPeople])

  const subgroupSuggestion = useMemo(() => {
    return suggestSubgroups(
      groupPeople.map((person) => ({
        id: person.id,
        name: person.name,
      })),
      groupPairwise.pairs.map((pair) => ({
        aId: pair.aId,
        bId: pair.bId,
        score: pair.score,
      })),
    )
  }, [groupPeople, groupPairwise.pairs])

  const groupPairwiseDesktopOrder = useMemo(() => {
    const columns = 2
    const rows = Math.ceil(groupPairwise.pairs.length / columns)
    const reordered: PairScoreCard[] = []

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const index = col * rows + row
        const pair = groupPairwise.pairs[index]
        if (pair) {
          reordered.push(pair)
        }
      }
    }

    return reordered
  }, [groupPairwise.pairs])

  const groupRoles = useMemo(() => {
    const allMembers = [
      { id: 'you', name: 'You', scores: myResult.scores },
      ...groupMembers.map((m) => ({ id: m.id, name: m.name, scores: m.result.scores })),
    ]

    const roleCards = buildGroupRoleCards(allMembers)
    const coverage = getRoleCoverage(roleCards)
    const missingCount = roleCards.filter((card) => card.primaryNames.length === 0).length
    const recommendation = missingCount === 0
      ? 'All roles covered.'
      : `${missingCount} role${missingCount > 1 ? 's' : ''} unassigned.`

    return { roleCards, coverage, recommendation }
  }, [myResult, groupMembers])

  const groupInterestSignals = useMemo(() => {
    const people = [
      { interests: myResult.interests, disinterests: myResult.disinterests },
      ...groupMembers.map((member) => ({ interests: member.result.interests, disinterests: member.result.disinterests })),
    ]

    const scoreByInterest = travelInterests.reduce((acc, interest) => {
      acc[interest.key] = 0
      return acc
    }, {} as Record<keyof typeof interestMap, number>)

    people.forEach((person) => {
      person.interests.forEach((interest) => {
        scoreByInterest[interest] += 1
      })

      person.disinterests.forEach((interest) => {
        scoreByInterest[interest] -= 1
      })
    })

    const threshold = Math.floor(people.length / 2)

    const ranked = travelInterests
      .map((interest) => ({
        key: interest.key,
        label: interest.label,
        score: scoreByInterest[interest.key],
      }))
      .sort((a, b) => b.score - a.score)

    const groupInterests = ranked.filter((interest) => interest.score > threshold)
    const mustAvoid = ranked.filter((interest) => interest.score < 0).sort((a, b) => a.score - b.score)

    const topScore = groupInterests.length > 0 ? groupInterests[0].score : null
    const mustDo =
      topScore === null
        ? []
        : groupInterests.filter((interest) => interest.score === topScore)
    const potentialInterests =
      topScore === null
        ? groupInterests
        : groupInterests.filter((interest) => interest.score < topScore)

    return {
      threshold,
      groupSize: people.length,
      potentialInterests,
      mustDo,
      mustAvoid,
    }
  }, [myResult, groupMembers])

  function getFirstAvailableColor(usedColors: Set<number>): number {
    for (let i = 0; i < RADAR_COLORS.length; i += 1) {
      if (!usedColors.has(i)) {
        return i
      }
    }
    return 0
  }

  useEffect(() => {
    setRadarColorByMemberId((current) => {
      const next: Record<string, number> = {}
      const usedColors = new Set<number>()

      // Keep existing color assignments for members who remain visible.
      for (const memberId of visibleRadarMemberIds) {
        const existingColor = current[memberId]
        if (typeof existingColor === 'number' && !usedColors.has(existingColor)) {
          next[memberId] = existingColor
          usedColors.add(existingColor)
        }
      }

      // Assign first free color to newly visible members.
      for (const memberId of visibleRadarMemberIds) {
        if (typeof next[memberId] !== 'number') {
          const colorIndex = getFirstAvailableColor(usedColors)
          next[memberId] = colorIndex
          usedColors.add(colorIndex)
        }
      }

      return next
    })
  }, [visibleRadarMemberIds])

  const groupRadarMembers = useMemo(() => {
    const ordered = [
      { id: 'you', name: 'You', result: myResult },
      ...groupMembers.map((member) => ({ id: member.id, name: member.name, result: member.result })),
    ]

    const selectedIds = new Set(visibleRadarMemberIds)
    return ordered.filter((member) => selectedIds.has(member.id)).slice(0, 6)
  }, [groupMembers, myResult, visibleRadarMemberIds])

  const groupRadarOverlays = useMemo(() => {
    return groupRadarMembers.map((member) => {
      const colorIndex = radarColorByMemberId[member.id] ?? 0
      const color = RADAR_COLORS[colorIndex % RADAR_COLORS.length]
      return {
        dataKey: `series_${member.id}`,
        label: member.name,
        scores: member.result.scores,
        fill: color.fill,
        stroke: color.stroke,
        dot: color.dot,
      }
    })
  }, [groupRadarMembers, radarColorByMemberId])

  function handleCompare() {
    const code = extractCode(input)
    const decoded = decodeResult(code)
    const decodedShare = !decoded ? decodeShareCode(code) : null
    const finalDecoded = decoded ?? decodedShare

    if (!finalDecoded) {
      setError('Could not parse that share code. Paste either a full URL or just the code.')
      return
    }

    const trimmedName = nameInput.trim()
    const nextName = trimmedName || `Friend ${groupMembers.length + 1}`
    const duplicateName = groupMembers.some((member) => member.name.toLowerCase() === nextName.toLowerCase())

    const member: GroupMember = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: nextName,
      result: finalDecoded,
      code,
    }

    setError(null)
    setWarning(duplicateName ? 'Name already exists in the group. Added anyway.' : null)
    setGroupMembers((current) => [...current, member])
    setActiveView(member.id)
    setVisibleRadarMemberIds((current) => {
      if (current.includes(member.id)) {
        return current
      }
      if (current.length < 6) {
        return [...current, member.id]
      }
      return current
    })
    setInput('')
    setNameInput('')
    setExpandedTrait(null)
  }

  function removeMember(memberId: string) {
    setGroupMembers((current) => current.filter((member) => member.id !== memberId))
    setVisibleRadarMemberIds((current) => current.filter((id) => id !== memberId))
    if (activeView === memberId) {
      setActiveView('group')
    }
  }

  function toggleVisibleRadarMember(memberId: string) {
    setVisibleRadarMemberIds((current) => {
      if (current.includes(memberId)) {
        if (current.length === 1 && current[0] === 'you') {
          return current
        }
        const next = current.filter((id) => id !== memberId)
        return next.length === 0 ? ['you'] : next
      }
      if (current.length >= 6) {
        return current
      }
      return [...current, memberId]
    })
  }

  function getFrictionLabel(diff: number): 'Low' | 'Medium' | 'High' {
    if (diff <= 2) {
      return 'Low'
    }

    if (diff <= 4) {
      return 'Medium'
    }

    return 'High'
  }

  function getFrictionBadgeClass(level: 'Low' | 'Medium' | 'High'): string {
    if (level === 'Low') {
      return 'border-emerald-200 bg-emerald-100 text-emerald-800'
    }

    if (level === 'Medium') {
      return 'border-amber-200 bg-amber-100 text-amber-800'
    }

    return 'border-rose-200 bg-rose-100 text-rose-800'
  }

  function getFitTag(fitStrength: number): { label: 'High' | 'Medium' | 'Low'; className: string } {
    if (fitStrength >= 67) {
      return { label: 'High', className: 'border-emerald-300 bg-emerald-50 text-emerald-800' }
    }

    if (fitStrength >= 34) {
      return { label: 'Medium', className: 'border-amber-300 bg-amber-50 text-amber-800' }
    }

    return { label: 'Low', className: 'border-stone-300 bg-stone-100 text-stone-700' }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-stone-900">Compatibility Check</h3>
      <p className="mt-2 text-sm text-stone-600">
        Add friend codes with optional names, then switch between one-on-one details or group view. Group score is the average of all unique pairs including you.
      </p>

      <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_220px_auto]">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste a code or URL"
          className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        <input
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
          placeholder="Optional name"
          className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        <button
          type="button"
          onClick={handleCompare}
          className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Add to Group
        </button>
      </div>

      {error && <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>}
      {warning && <p className="mt-2 text-sm font-medium text-amber-700">{warning}</p>}

      {groupMembers.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('group')}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
              activeView === 'group'
                ? 'border-teal-600 bg-teal-100 text-teal-900'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            Group
          </button>
          {groupMembers.map((member) => (
            <div key={member.id} className="inline-flex items-center overflow-hidden rounded-full border border-stone-300">
              <button
                type="button"
                onClick={() => {
                  setActiveView(member.id)
                  setExpandedTrait(null)
                }}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                  activeView === member.id
                    ? 'bg-teal-100 text-teal-900'
                    : 'bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                {member.name}
              </button>
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                className="border-l border-stone-300 bg-white px-2 py-1 text-xs font-bold text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                aria-label={`Remove ${member.name}`}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {groupMembers.length > 0 && activeView === 'group' && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-teal-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Group Match Score</p>
            <p className="text-4xl font-black text-teal-900">{groupPairwise.average ?? 'N/A'}%</p>
            <p className="mt-2 text-xs text-teal-800">Average across {groupPairwise.pairs.length} unique pairings.</p>
          </div>

          {/* Group Dynamics / Roles */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Group Roles</p>
            <p className="mt-1 text-xs text-stone-600">
              Based off your group's trait scores, each role is assigned to the strongest fit (or co-assigned on ties).
            </p>

            <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {groupRoles.roleCards.map((card) => (
                <div key={card.key} className="h-full rounded-lg border border-stone-200 bg-white p-3 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-teal-800">
                      {card.primaryNames.length > 1 ? card.coLabel : card.label}
                    </p>
                    {card.primaryNames.length > 1 && (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-800">
                        Co-Role
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[1.3125rem] font-extrabold leading-tight text-stone-900">
                    {card.primaryNames.length > 0 ? card.primaryNames.join(', ') : 'No One'}
                  </p>

                  {card.secondaryNames.length > 0 && (
                    <p className="mt-1 text-xs text-stone-600">
                      Secondary: {card.secondaryNames.join(', ')}
                    </p>
                  )}

                  <p className="mt-2 text-xs leading-relaxed text-stone-600">{card.mission}</p>

                  {typeof card.fitStrength === 'number' && (
                    <p className="mt-auto pt-3 text-xs text-stone-500">
                      Fit Confidence:{' '}
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${getFitTag(card.fitStrength).className}`}>
                        {getFitTag(card.fitStrength).label}
                      </span>
                    </p>
                  )}

                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Trip Planning Suggestions</p>
            <p className="mt-1 text-xs text-stone-600">
              Based off your group's interests you might consider prioritizing and avoiding certain activities.
            </p>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Must Do</p>
                {groupInterestSignals.mustDo.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {groupInterestSignals.mustDo.map((interest) => (
                      <span
                        key={`must-do-${interest.key}`}
                        className="inline-flex items-center rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-800"
                      >
                        {interest.label} ({interest.score})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-emerald-800">No single must-do interest yet. Consider using the top group interests below.</p>
                )}
              </div>

              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">Must Avoid</p>
                {groupInterestSignals.mustAvoid.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {groupInterestSignals.mustAvoid.map((interest) => (
                      <span
                        key={`must-avoid-${interest.key}`}
                        className="inline-flex items-center rounded-full border border-rose-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-800"
                      >
                        {interest.label} ({interest.score})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-rose-800">No hard avoid signals right now.</p>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-stone-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Potential Interests</p>
              {groupInterestSignals.potentialInterests.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {groupInterestSignals.potentialInterests.map((interest) => (
                    <span
                      key={`potential-interest-${interest.key}`}
                      className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-800"
                    >
                      {interest.label} ({interest.score})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-stone-600">No potential interests beyond your must-do picks yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Pair Scores</p>
            <div className="mt-3 grid gap-2 md:hidden">
              {groupPairwise.pairs.map((pair) => (
                <div key={pair.id} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">{pair.aName}</span> + <span className="font-semibold text-stone-900">{pair.bName}</span>
                  <span className="float-right font-bold text-teal-800">{pair.score}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 hidden gap-2 md:grid md:grid-cols-2">
              {groupPairwiseDesktopOrder.map((pair) => (
                <div key={`${pair.id}-desktop`} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">{pair.aName}</span> + <span className="font-semibold text-stone-900">{pair.bName}</span>
                  <span className="float-right font-bold text-teal-800">{pair.score}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Group Profile Overlay</p>
            <p className="mt-1 text-xs text-stone-600">Show up to 6 people at a time for readability.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[{ id: 'you', name: 'You' }, ...groupMembers.map((member) => ({ id: member.id, name: member.name }))].map((member) => {
                const visibleSet = new Set(visibleRadarMemberIds)
                const visible = visibleSet.has(member.id)
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleVisibleRadarMember(member.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                      visible
                        ? 'border-teal-600 bg-teal-100 text-teal-900'
                        : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {member.name}
                  </button>
                )
              })}
            </div>
            <div className="mt-4">
              <TraitRadarChart scores={myScores} overlays={groupRadarOverlays} />
            </div>
          </div>

          <details className="rounded-xl border border-amber-200 bg-amber-50/40">
            <summary className="cursor-pointer list-none px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-amber-800">Experimental Results</p>
                <span className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700">Toggle</span>
              </div>
            </summary>
            <div className="px-4 pb-4">
              <p className="text-xs font-semibold tracking-[0.04em] text-stone-700">Potential subgroups</p>
              <p className="mt-1 text-xs text-stone-600">
                A graph partition over pair compatibility scores to identify subgroups that may travel well together.
              </p>

            {subgroupSuggestion && subgroupSuggestion.isMeaningful ? (
              <>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Confidence</p>
                    <p className="text-sm font-bold text-stone-900">{subgroupSuggestion.confidence}%</p>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Within Cluster</p>
                    <p className="text-sm font-bold text-emerald-700">{subgroupSuggestion.withinAverage}%</p>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Across Clusters</p>
                    <p className="text-sm font-bold text-rose-700">{subgroupSuggestion.crossAverage}%</p>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Lift vs Group Avg</p>
                    <p className="text-sm font-bold text-teal-800">+{subgroupSuggestion.improvement}%</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {subgroupSuggestion.clusters.map((cluster, index) => (
                    <article key={cluster.memberIds.join('-')} className="rounded-lg border border-teal-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal-700">Subgroup {String.fromCharCode(65 + index)}</p>
                      <p className="mt-1 text-sm font-bold text-stone-900">{cluster.memberNames.join(', ')}</p>
                      <p className="mt-2 text-xs text-stone-600">
                        Internal average: {cluster.avgInternal}% | External average: {cluster.avgExternal}% | Cohesion: {cluster.cohesion > 0 ? `+${cluster.cohesion}` : cluster.cohesion}
                      </p>
                    </article>
                  ))}
                </div>

                {subgroupSuggestion.bridges.length > 0 && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">Sub-Group Bridges</p>
                    <p className="mt-1 text-xs text-amber-800">These people connect groups—nearly as compatible across group lines as within their assigned group.</p>
                    <div className="mt-2 space-y-2">
                      {subgroupSuggestion.bridges.map((bridge) => (
                        <div key={bridge.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2">
                          <p className="text-xs font-semibold text-amber-900">{bridge.name}</p>
                          <div className="flex flex-wrap gap-2 justify-end">
                            {bridge.clusterAffinities.map((affinity) => (
                              <span key={`${bridge.id}-${affinity.clusterLabel}`} className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-amber-700">
                                Subgroup {affinity.clusterLabel}: {affinity.affinity}%
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-stone-600">
                No high-confidence subgroup split yet. Add more members or look for stronger pair score separation.
              </p>
            )}
            </div>
          </details>
        </div>
      )}

      {selectedCompatibility !== null && activeMember && activeView !== 'group' && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Viewing</p>
            <p className="mt-1 text-lg font-bold text-stone-900">{activeMember.name}</p>
          </div>

          <div className="rounded-xl bg-teal-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Match Score</p>
            <p className="text-4xl font-black text-teal-900">{selectedCompatibility.overall}%</p>
            <p className="mt-2 text-xs text-teal-800">
              Personality: {selectedCompatibility.personality}% • Interests: {selectedCompatibility.interests}% • Motivations: {selectedCompatibility.motivations}%
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Shared Interests</p>
            <p className="mt-1 text-sm text-stone-600">{selectedCompatibility.overlap.length} overlapping interests (Friction: {100 - selectedCompatibility.frictionScore}%)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCompatibility.overlap.length > 0 ? (
                selectedCompatibility.overlap.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-800"
                  >
                    {interestMap[interest].label}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-500">No overlapping interests.</span>
              )}
            </div>

            <div className="mt-3 rounded-lg border border-stone-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Disinterests</p>
              <p className="mt-2 text-xs text-stone-600">
                <span className="block">
                  You avoid: {myResult.disinterests.length > 0 ? myResult.disinterests.map((d) => interestMap[d].label).join(', ') : 'Nothing'}
                </span>
                <span className="block">
                  They avoid: {activeMember.result.disinterests.length > 0 ? activeMember.result.disinterests.map((d) => interestMap[d].label).join(', ') : 'Nothing'}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Travel Motivation Match</p>
            <p className="mt-1 text-sm text-stone-600">
              {selectedCompatibility.sharedMotivations.length} shared motivations • Top Motivation Similarity: {selectedCompatibility.topSignalPoints}%
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCompatibility.sharedMotivations.length > 0 ? (
                selectedCompatibility.sharedMotivations.map((motivation) => (
                  <span
                    key={motivation}
                    className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-800"
                  >
                    {motivationMap[motivation].label}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-500">No shared motivations yet.</span>
              )}
            </div>

            <p className="mt-3 text-xs text-stone-600">
              Your #1: {myResult.primaryMotivation ? motivationMap[myResult.primaryMotivation].label : 'Not set'} | Friend #1: {activeMember.result.primaryMotivation ? motivationMap[activeMember.result.primaryMotivation].label : 'Not set'}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Profile Overlay</p>
            <TraitRadarChart scores={myScores} compareScores={activeMember.result.scores} compareLabel={activeMember.name} />
          </div>

          <div className="space-y-3">
            {traitDefinitions.map((trait) => {
              const mine = myScores[trait.key]
              const theirs = activeMember.result.scores[trait.key]
              const diff = trait.key === 'initiative' ? Math.abs(mine + theirs) : Math.abs(mine - theirs)
              const frictionLevel = getFrictionLabel(diff)
              const isExpanded = expandedTrait === trait.key
              const narrative = getNarrative(trait.key, diff)

              return (
                <article
                  key={trait.key}
                  className="rounded-lg border border-stone-200 bg-stone-50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedTrait(isExpanded ? null : trait.key)}
                    className="w-full px-4 py-3 text-left hover:bg-stone-100 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-stone-900 flex items-center gap-2">
                        {trait.label}
                        {trait.key === 'initiative' && (
                          <span
                            title="For Initiative, friction is based on how far your combined scores are from 0 (|your score + your friend's score|)."
                            aria-label="Initiative friction explanation"
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-stone-400 text-[10px] font-bold leading-none text-stone-600"
                          >
                            ?
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        You: {mine > 0 ? `+${mine}` : mine} | Friend: {theirs > 0 ? `+${theirs}` : theirs} | Friction:{' '}
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${getFrictionBadgeClass(frictionLevel)}`}
                        >
                          {frictionLevel}
                        </span>
                      </p>
                    </div>
                    <span className="text-lg text-stone-400">{isExpanded ? '−' : '+'}</span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-stone-200 px-4 py-3 bg-white text-sm text-stone-700">
                      <p className="leading-relaxed">{narrative}</p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
