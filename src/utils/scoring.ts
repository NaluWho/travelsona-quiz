import { traitDefinitions, traitMap } from '../data/traits'
import type { QuizQuestion, TraitKey, TraitScores } from '../types/quiz'

const VALID_SCORES = new Set([-6, -4, -2, 0, 2, 4, 6])

export function emptyScores(): TraitScores {
  return traitDefinitions.reduce((acc, trait) => {
    acc[trait.key] = 0
    return acc
  }, {} as TraitScores)
}

export function scoreQuiz(
  answers: Record<number, number>,
  questions: QuizQuestion[],
): TraitScores {
  const scores = emptyScores()

  for (const question of questions) {
    const answerScore = answers[question.id]
    if (typeof answerScore === 'number') {
      scores[question.trait] += answerScore
    }
  }

  for (const trait of traitDefinitions) {
    scores[trait.key] = normalizeTraitScore(scores[trait.key])
  }

  return scores
}

export function normalizeTraitScore(raw: number): number {
  const clamped = Math.max(-6, Math.min(6, raw))
  if (VALID_SCORES.has(clamped)) {
    return clamped
  }

  // Nearest valid score in case future edits introduce different increments.
  const nearest = [-6, -4, -2, 0, 2, 4, 6].reduce((best, current) => {
    return Math.abs(current - clamped) < Math.abs(best - clamped) ? current : best
  }, 0)

  return nearest
}

export function getTraitArchetype(trait: TraitKey, score: number): string {
  if (score > 0) {
    return traitMap[trait].highTitle
  }

  if (score < 0) {
    return traitMap[trait].lowTitle
  }

  return `Balanced ${traitMap[trait].label}`
}

export function buildSummaryTitle(scores: TraitScores): string {
  const ranked = (Object.keys(scores) as TraitKey[])
    .map((trait) => ({ trait, score: scores[trait], abs: Math.abs(scores[trait]) }))
    .sort((a, b) => b.abs - a.abs)
    .filter((entry) => entry.abs > 0)
    .slice(0, 3)

  if (ranked.length === 0) {
    return 'Balanced Traveler'
  }

  return ranked
    .map((entry) => getTraitArchetype(entry.trait, entry.score).replace(/^The\s+/, ''))
    .join(' ')
}
