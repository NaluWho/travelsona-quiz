import { useMemo, useState } from 'react'
import { interestMap } from '../data/interests'
import { motivationMap } from '../data/motivations'
import { TraitRadarChart } from './TraitRadarChart'
import { traitDefinitions } from '../data/traits'
import type { QuizResult, TraitScores } from '../types/quiz'
import { calculateCompatibility } from '../utils/compatibility'
import { decodeResult, extractCode } from '../utils/encoding'
import { getNarrative } from '../data/compatibilityNarrative'

type CompatibilityCheckerProps = {
  myResult: QuizResult
}

export function CompatibilityChecker({ myResult }: CompatibilityCheckerProps) {
  const [input, setInput] = useState('')
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [otherResult, setOtherResult] = useState<QuizResult | null>(null)

  const myScores: TraitScores = myResult.scores

  const compatibility = useMemo(() => {
    if (!otherResult) {
      return null
    }

    return calculateCompatibility(
      myScores,
      otherResult.scores,
      myResult.interests,
      otherResult.interests,
      myResult.motivations,
      otherResult.motivations,
      myResult.primaryMotivation,
      otherResult.primaryMotivation,
    )
  }, [
    myResult.interests,
    myResult.motivations,
    myResult.primaryMotivation,
    myScores,
    otherResult,
  ])

  function handleCompare() {
    const code = extractCode(input)
    const decoded = decodeResult(code)

    if (!decoded) {
      setError('Could not parse that share code. Paste either a full URL or just the code.')
      setOtherResult(null)
      return
    }

    setError(null)
    setOtherResult(decoded)
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-stone-900">Compatibility Check</h3>
      <p className="mt-2 text-sm text-stone-600">
        Paste your friend&apos;s result URL or share code. Overall score uses 60% personality, 15% interests, and 25% motivations.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste a code or URL"
          className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        <button
          type="button"
          onClick={handleCompare}
          className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Compare
        </button>
      </div>

      {error && <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>}

      {compatibility !== null && otherResult && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-teal-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Match Score</p>
            <p className="text-4xl font-black text-teal-900">{compatibility.overall}%</p>
            <p className="mt-2 text-xs text-teal-800">
              Personality: {compatibility.personality}% • Interests: {compatibility.interests}% • Motivations: {compatibility.motivations}%
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Shared Interests</p>
            <p className="mt-1 text-sm text-stone-600">{compatibility.overlap.length} overlapping interests</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {compatibility.overlap.length > 0 ? (
                compatibility.overlap.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-800"
                  >
                    {interestMap[interest].label}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-500">No overlap yet.</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Travel Motivation Match</p>
            <p className="mt-1 text-sm text-stone-600">
              {compatibility.sharedMotivations.length} shared motivations • Top-signal points: {compatibility.topSignalPoints}/180
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {compatibility.sharedMotivations.length > 0 ? (
                compatibility.sharedMotivations.map((motivation) => (
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
              Your #1: {myResult.primaryMotivation ? motivationMap[myResult.primaryMotivation].label : 'Not set'} | Friend #1: {otherResult.primaryMotivation ? motivationMap[otherResult.primaryMotivation].label : 'Not set'}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Profile Overlay</p>
            <TraitRadarChart scores={myScores} compareScores={otherResult.scores} />
          </div>

          <div className="space-y-3">
            {traitDefinitions.map((trait) => {
              const mine = myScores[trait.key]
              const theirs = otherResult.scores[trait.key]
              const diff = Math.abs(mine - theirs)
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
                      <p className="font-semibold text-stone-900">{trait.label}</p>
                      <p className="text-xs text-stone-500 mt-1">
                        You: {mine > 0 ? `+${mine}` : mine} | Friend: {theirs > 0 ? `+${theirs}` : theirs} | Difference: {diff}
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
