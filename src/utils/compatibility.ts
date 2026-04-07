import type { InterestKey, TraitKey, TraitScores } from '../types/quiz'

const SAME_DIRECTION_TRAITS: TraitKey[] = [
  'structure',
  'budget',
  'pace',
  'energy',
  'adventure',
  'immersion',
  'social',
]

const PERSONALITY_WEIGHT = 0.85
const INTEREST_WEIGHT = 0.15
const MAX_INTEREST_OVERLAP = 5

function clampPercentage(value: number): number {
  return Math.max(4, Math.min(100, value))
}

function calculatePersonalityScore(a: TraitScores, b: TraitScores): number {
  const sameDirectionPenalty = SAME_DIRECTION_TRAITS.reduce(
    (sum, trait) => sum + Math.abs(a[trait] - b[trait]),
    0,
  )

  const initiativePenalty = Math.abs(a.initiative + b.initiative)
  return clampPercentage(100 - sameDirectionPenalty - initiativePenalty)
}

function getOverlap(a: InterestKey[], b: InterestKey[]): InterestKey[] {
  const bSet = new Set(b)
  return a.filter((interest, index) => a.indexOf(interest) === index && bSet.has(interest))
}

export type CompatibilityResult = {
  overall: number
  personality: number
  interests: number
  overlap: InterestKey[]
}

export function calculateCompatibility(
  a: TraitScores,
  b: TraitScores,
  aInterests: InterestKey[],
  bInterests: InterestKey[],
): CompatibilityResult {
  const personality = calculatePersonalityScore(a, b)
  const overlap = getOverlap(aInterests, bInterests)
  const interests = Math.round((overlap.length / MAX_INTEREST_OVERLAP) * 100)
  const overall = clampPercentage(Math.round((personality * PERSONALITY_WEIGHT) + (interests * INTEREST_WEIGHT)))

  return {
    overall,
    personality,
    interests,
    overlap,
  }
}
