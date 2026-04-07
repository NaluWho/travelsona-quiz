import { interestMap } from '../data/interests'
import { traitDefinitions, traitMap } from '../data/traits'
import type { InterestKey, TraitScores } from '../types/quiz'
import { buildSummaryTitle, getTraitArchetype } from '../utils/scoring'

type ResultSummaryProps = {
  scores: TraitScores
  interests: InterestKey[]
}

export function ResultSummary({ scores, interests }: ResultSummaryProps) {
  const title = buildSummaryTitle(scores)

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Your Travelsona</p>
      <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-stone-900">{title}</h2>
      <p className="mt-3 text-sm text-stone-600">
        Stronger values (toward -6 or +6) represent stronger preference. Near-zero values indicate flexibility.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {traitDefinitions.map((trait) => {
          const score = scores[trait.key]
          const archetype = getTraitArchetype(trait.key, score)
          const side = score >= 0 ? traitMap[trait.key].highTitle : traitMap[trait.key].lowTitle

          return (
            <article key={trait.key} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{trait.label}</p>
              <p className="mt-1 text-lg font-bold text-stone-900">{archetype}</p>
              <p className="text-sm text-stone-600">{trait.description}</p>
              <p className="mt-2 text-sm font-semibold text-teal-800">Score: {score > 0 ? `+${score}` : score}</p>
              <p className="text-xs text-stone-500">Leaning: {side}</p>
            </article>
          )
        })}
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Travel Interests</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-800"
            >
              {interestMap[interest].label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
