import { travelInterests } from '../data/interests'
import { travelMotivations } from '../data/motivations'
import { traitDefinitions } from '../data/traits'
import type { InterestKey, MotivationKey, QuizResult, TraitScores } from '../types/quiz'
import { normalizeTraitScore } from './scoring'

const LEGACY_VERSION_PREFIX = 'v1:'
const INTERESTS_VERSION_PREFIX = 'v2:'
const MOTIVATIONS_VERSION_PREFIX = 'v3:'
const VERSION_PREFIX = 'v4:'
const INTEREST_KEYS = new Set<InterestKey>(travelInterests.map((interest) => interest.key))
const MOTIVATION_KEYS = new Set<MotivationKey>(travelMotivations.map((motivation) => motivation.key))

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const remainder = padded.length % 4
  const withPadding = remainder === 0 ? padded : `${padded}${'='.repeat(4 - remainder)}`
  return atob(withPadding)
}

export function encodeResult(result: QuizResult): string {
  const orderedScores = traitDefinitions.map((trait) => normalizeTraitScore(result.scores[trait.key]))
  const orderedInterests = travelInterests
    .map((interest) => interest.key)
    .filter((interest) => result.interests.includes(interest))
  const orderedDisinterests = travelInterests
    .map((interest) => interest.key)
    .filter((interest) => result.disinterests.includes(interest))
  const orderedMotivations = travelMotivations
    .map((motivation) => motivation.key)
    .filter((motivation) => result.motivations.includes(motivation))
  const encodedPrimary = result.primaryMotivation && orderedMotivations.includes(result.primaryMotivation)
    ? result.primaryMotivation
    : ''

  return toBase64Url(`${VERSION_PREFIX}${orderedScores.join(',')}|${orderedInterests.join(',')}|${orderedDisinterests.join(',')}|${orderedMotivations.join(',')}|${encodedPrimary}`)
}

function decodeLegacyScores(decoded: string): QuizResult | null {
  if (!decoded.startsWith(LEGACY_VERSION_PREFIX)) {
    return null
  }

  const rawNumbers = decoded.slice(LEGACY_VERSION_PREFIX.length).split(',').map(Number)
  if (rawNumbers.length !== traitDefinitions.length || rawNumbers.some(Number.isNaN)) {
    return null
  }

  const scores = {} as TraitScores
  traitDefinitions.forEach((trait, index) => {
    scores[trait.key] = normalizeTraitScore(rawNumbers[index])
  })

  return { scores, interests: [], disinterests: [], motivations: [], primaryMotivation: null }
}

function decodeInterestsVersion(decoded: string): QuizResult | null {
  if (!decoded.startsWith(INTERESTS_VERSION_PREFIX)) {
    return null
  }

  const [rawScores, rawInterests = ''] = decoded.slice(INTERESTS_VERSION_PREFIX.length).split('|')
  const rawNumbers = rawScores.split(',').map(Number)
  if (rawNumbers.length !== traitDefinitions.length || rawNumbers.some(Number.isNaN)) {
    return null
  }

  const scores = {} as TraitScores
  traitDefinitions.forEach((trait, index) => {
    scores[trait.key] = normalizeTraitScore(rawNumbers[index])
  })

  const interests = rawInterests
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry): entry is InterestKey => Boolean(entry) && INTEREST_KEYS.has(entry as InterestKey))

  const uniqueInterests = interests.filter((entry, index) => interests.indexOf(entry) === index)

  return { scores, interests: uniqueInterests, disinterests: [], motivations: [], primaryMotivation: null }
}

export function decodeResult(encoded: string): QuizResult | null {
  try {
    const decoded = fromBase64Url(encoded)

    if (decoded.startsWith(LEGACY_VERSION_PREFIX)) {
      return decodeLegacyScores(decoded)
    }

    if (decoded.startsWith(INTERESTS_VERSION_PREFIX)) {
      return decodeInterestsVersion(decoded)
    }

    if (decoded.startsWith(MOTIVATIONS_VERSION_PREFIX)) {
      const [rawScores, rawInterests = '', rawMotivations = '', rawPrimary = ''] = decoded.slice(MOTIVATIONS_VERSION_PREFIX.length).split('|')
      const rawNumbers = rawScores.split(',').map(Number)
      if (rawNumbers.length !== traitDefinitions.length || rawNumbers.some(Number.isNaN)) {
        return null
      }

      const scores = {} as TraitScores
      traitDefinitions.forEach((trait, index) => {
        scores[trait.key] = normalizeTraitScore(rawNumbers[index])
      })

      const interests = rawInterests
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry): entry is InterestKey => Boolean(entry) && INTEREST_KEYS.has(entry as InterestKey))

      const uniqueInterests = interests.filter((entry, index) => interests.indexOf(entry) === index)
      const motivations = rawMotivations
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry): entry is MotivationKey => Boolean(entry) && MOTIVATION_KEYS.has(entry as MotivationKey))

      const uniqueMotivations = motivations.filter((entry, index) => motivations.indexOf(entry) === index)
      const parsedPrimary = rawPrimary.trim()
      const primaryMotivation =
        parsedPrimary && MOTIVATION_KEYS.has(parsedPrimary as MotivationKey) && uniqueMotivations.includes(parsedPrimary as MotivationKey)
          ? (parsedPrimary as MotivationKey)
          : null

      return { scores, interests: uniqueInterests, disinterests: [], motivations: uniqueMotivations, primaryMotivation }
    }

    if (!decoded.startsWith(VERSION_PREFIX)) {
      return null
    }

    const [rawScores, rawInterests = '', rawDisinterests = '', rawMotivations = '', rawPrimary = ''] = decoded.slice(VERSION_PREFIX.length).split('|')
    const rawNumbers = rawScores.split(',').map(Number)
    if (rawNumbers.length !== traitDefinitions.length || rawNumbers.some(Number.isNaN)) {
      return null
    }

    const scores = {} as TraitScores
    traitDefinitions.forEach((trait, index) => {
      scores[trait.key] = normalizeTraitScore(rawNumbers[index])
    })

    const interests = rawInterests
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry): entry is InterestKey => Boolean(entry) && INTEREST_KEYS.has(entry as InterestKey))

    const uniqueInterests = interests.filter((entry, index) => interests.indexOf(entry) === index)

    const disinterests = rawDisinterests
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry): entry is InterestKey => Boolean(entry) && INTEREST_KEYS.has(entry as InterestKey))

    const uniqueDisinterests = disinterests.filter((entry, index) => disinterests.indexOf(entry) === index)

    const motivations = rawMotivations
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry): entry is MotivationKey => Boolean(entry) && MOTIVATION_KEYS.has(entry as MotivationKey))

    const uniqueMotivations = motivations.filter((entry, index) => motivations.indexOf(entry) === index)
    const parsedPrimary = rawPrimary.trim()
    const primaryMotivation =
      parsedPrimary && MOTIVATION_KEYS.has(parsedPrimary as MotivationKey) && uniqueMotivations.includes(parsedPrimary as MotivationKey)
        ? (parsedPrimary as MotivationKey)
        : null

    return { scores, interests: uniqueInterests, disinterests: uniqueDisinterests, motivations: uniqueMotivations, primaryMotivation }
  } catch {
    return null
  }
}

export function encodeScores(scores: TraitScores): string {
  return encodeResult({ scores, interests: [], disinterests: [], motivations: [], primaryMotivation: null })
}

export function decodeScores(encoded: string): TraitScores | null {
  return decodeResult(encoded)?.scores ?? null
}

export function extractCode(value: string): string {
  try {
    const maybeUrl = new URL(value)
    return maybeUrl.searchParams.get('r') ?? value.trim()
  } catch {
    return value.trim()
  }
}
