import type { TraitKey, TraitScores } from '../types/quiz'

const SAME_DIRECTION_TRAITS: TraitKey[] = [
  'structure',
  'budget',
  'pace',
  'energy',
  'adventure',
  'immersion',
  'social',
]

export function calculateCompatibility(a: TraitScores, b: TraitScores): number {
  const sameDirectionPenalty = SAME_DIRECTION_TRAITS.reduce(
    (sum, trait) => sum + Math.abs(a[trait] - b[trait]),
    0,
  )

  const initiativePenalty = Math.abs(a.initiative + b.initiative)
  const score = 100 - sameDirectionPenalty - initiativePenalty

  return Math.max(4, Math.min(100, score))
}
