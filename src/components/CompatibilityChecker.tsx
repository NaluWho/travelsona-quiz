import { useMemo, useState } from 'react'
import { TraitRadarChart } from './TraitRadarChart'
import { traitDefinitions } from '../data/traits'
import type { TraitScores } from '../types/quiz'
import { calculateCompatibility } from '../utils/compatibility'
import { decodeScores, extractCode } from '../utils/encoding'
import { getNarrative } from '../data/compatibilityNarrative'

type CompatibilityCheckerProps = {
  myScores: TraitScores
}

export function CompatibilityChecker({ myScores }: CompatibilityCheckerProps) {
  const [input, setInput] = useState('')
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [otherScores, setOtherScores] = useState<TraitScores | null>(null)

  const compatibility = useMemo(() => {
    if (!otherScores) {
      return null
    }

    return calculateCompatibility(myScores, otherScores)
  }, [myScores, otherScores])

  function handleCompare() {
    const code = extractCode(input)
    const decoded = decodeScores(code)

    if (!decoded) {
      setError('Could not parse that share code. Paste either a full URL or just the code.')
      setOtherScores(null)
      return
    }

    setError(null)
    setOtherScores(decoded)
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-stone-900">Compatibility Check</h3>
      <p className="mt-2 text-sm text-stone-600">
        Paste your friend&apos;s result URL or share code. Score starts at 100, then penalties are applied per trait.
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

      {compatibility !== null && otherScores && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-teal-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Match Score</p>
            <p className="text-4xl font-black text-teal-900">{compatibility}%</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Profile Overlay</p>
            <TraitRadarChart scores={myScores} compareScores={otherScores} />
          </div>

          <div className="space-y-3">
            {traitDefinitions.map((trait) => {
              const mine = myScores[trait.key]
              const theirs = otherScores[trait.key]
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
