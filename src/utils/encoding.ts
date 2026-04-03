import { traitDefinitions } from '../data/traits'
import type { TraitScores } from '../types/quiz'
import { normalizeTraitScore } from './scoring'

const VERSION_PREFIX = 'v1:'

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const remainder = padded.length % 4
  const withPadding = remainder === 0 ? padded : `${padded}${'='.repeat(4 - remainder)}`
  return atob(withPadding)
}

export function encodeScores(scores: TraitScores): string {
  const ordered = traitDefinitions.map((trait) => normalizeTraitScore(scores[trait.key]))
  return toBase64Url(`${VERSION_PREFIX}${ordered.join(',')}`)
}

export function decodeScores(encoded: string): TraitScores | null {
  try {
    const decoded = fromBase64Url(encoded)
    if (!decoded.startsWith(VERSION_PREFIX)) {
      return null
    }

    const rawNumbers = decoded.slice(VERSION_PREFIX.length).split(',').map(Number)
    if (rawNumbers.length !== traitDefinitions.length || rawNumbers.some(Number.isNaN)) {
      return null
    }

    const scores = {} as TraitScores
    traitDefinitions.forEach((trait, index) => {
      scores[trait.key] = normalizeTraitScore(rawNumbers[index])
    })

    return scores
  } catch {
    return null
  }
}

export function extractCode(value: string): string {
  try {
    const maybeUrl = new URL(value)
    return maybeUrl.searchParams.get('r') ?? value.trim()
  } catch {
    return value.trim()
  }
}
