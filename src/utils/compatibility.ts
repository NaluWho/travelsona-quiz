import type { InterestKey, MotivationKey, TraitKey, TraitScores } from '../types/quiz'

const SAME_DIRECTION_TRAITS: TraitKey[] = [
  'structure',
  'budget',
  'pace',
  'energy',
  'adventure',
  'immersion',
  'social',
]

const PERSONALITY_WEIGHT = 0.6
const INTEREST_WEIGHT = 0.15
const MOTIVATION_WEIGHT = 0.25
const MAX_MOTIVATION_SIGNAL_POINTS = 100

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

function calculateInterestScore(a: InterestKey[], b: InterestKey[]): { score: number; overlap: InterestKey[] } {
  const overlap = getOverlap(a, b)
  const totalSelections = a.length + b.length
  const score = totalSelections === 0 ? 0 : Math.round(((overlap.length * 2) / totalSelections) * 100)
  return { score, overlap }
}

function getMotivationOverlap(a: MotivationKey[], b: MotivationKey[]): MotivationKey[] {
  const bSet = new Set(b)
  return a.filter((motivation, index) => a.indexOf(motivation) === index && bSet.has(motivation))
}

function calculateMotivationScore(
  aMotivations: MotivationKey[],
  bMotivations: MotivationKey[],
  aPrimary: MotivationKey | null,
  bPrimary: MotivationKey | null,
): { motivationScore: number; sharedMotivations: MotivationKey[]; topSignalPoints: number } {
  const sharedMotivations = getMotivationOverlap(aMotivations, bMotivations)
  const totalSelections = aMotivations.length + bMotivations.length
  const sharedPercent = totalSelections === 0 ? 0 : Math.round(((sharedMotivations.length * 2) / totalSelections) * 100)

  let topSignalPoints = 0
  if (aPrimary && bPrimary && aPrimary === bPrimary) {
    topSignalPoints += 50
  }
  if (aPrimary && bMotivations.includes(aPrimary)) {
    topSignalPoints += 25
  }
  if (bPrimary && aMotivations.includes(bPrimary)) {
    topSignalPoints += 25
  }

  const topSignalPercent = Math.round((topSignalPoints / MAX_MOTIVATION_SIGNAL_POINTS) * 100)
  const motivationScore = Math.round((sharedPercent * 0.6) + (topSignalPercent * 0.4))

  return { motivationScore, sharedMotivations, topSignalPoints }
}

export type CompatibilityResult = {
  overall: number
  personality: number
  interests: number
  overlap: InterestKey[]
  motivations: number
  sharedMotivations: MotivationKey[]
  topSignalPoints: number
}

export function calculateCompatibility(
  a: TraitScores,
  b: TraitScores,
  aInterests: InterestKey[],
  bInterests: InterestKey[],
  aMotivations: MotivationKey[],
  bMotivations: MotivationKey[],
  aPrimaryMotivation: MotivationKey | null,
  bPrimaryMotivation: MotivationKey | null,
): CompatibilityResult {
  const personality = calculatePersonalityScore(a, b)
  const { score: interests, overlap } = calculateInterestScore(aInterests, bInterests)
  const { motivationScore, sharedMotivations, topSignalPoints } = calculateMotivationScore(
    aMotivations,
    bMotivations,
    aPrimaryMotivation,
    bPrimaryMotivation,
  )
  const overall = clampPercentage(Math.round((personality * PERSONALITY_WEIGHT) + (interests * INTEREST_WEIGHT) + (motivationScore * MOTIVATION_WEIGHT)))

  return {
    overall,
    personality,
    interests,
    overlap,
    motivations: motivationScore,
    sharedMotivations,
    topSignalPoints,
  }
}
