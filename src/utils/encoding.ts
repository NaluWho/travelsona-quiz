import { travelInterests } from '../data/interests'
import { traitDefinitions } from '../data/traits'
import type { InterestKey, QuizResult, TraitScores } from '../types/quiz'
import { normalizeTraitScore } from './scoring'

const LEGACY_VERSION_PREFIX = 'v1:'
const VERSION_PREFIX = 'v2:'
const INTEREST_KEYS = new Set<InterestKey>(travelInterests.map((interest) => interest.key))

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

  return toBase64Url(`${VERSION_PREFIX}${orderedScores.join(',')}|${orderedInterests.join(',')}`)
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

  return { scores, interests: [] }
}

export function decodeResult(encoded: string): QuizResult | null {
  try {
    const decoded = fromBase64Url(encoded)

    if (decoded.startsWith(LEGACY_VERSION_PREFIX)) {
      return decodeLegacyScores(decoded)
    }

    if (!decoded.startsWith(VERSION_PREFIX)) {
      return null
    }

    const [rawScores, rawInterests = ''] = decoded.slice(VERSION_PREFIX.length).split('|')
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

    return { scores, interests: uniqueInterests }
  } catch {
    return null
  }
}

export function encodeScores(scores: TraitScores): string {
  return encodeResult({ scores, interests: [] })
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
