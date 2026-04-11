import { travelInterests } from '../data/interests'
import { travelMotivations } from '../data/motivations'
import { quizQuestions } from '../data/questions'
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

export function encodeQuizState(
  answers: Record<number, number>,
  interests: InterestKey[],
  disinterests: InterestKey[],
  motivations: MotivationKey[],
  primaryMotivation: MotivationKey | null
): string {
  const orderedScores = quizQuestions.map((question) => answers[question.id] ?? 0)
  const orderedInterests = travelInterests
    .map((interest) => interest.key)
    .filter((interest) => interests.includes(interest))
  const orderedDisinterests = travelInterests
    .map((interest) => interest.key)
    .filter((interest) => disinterests.includes(interest))
  const orderedMotivations = travelMotivations
    .map((motivation) => motivation.key)
    .filter((motivation) => motivations.includes(motivation))
  const encodedPrimary = primaryMotivation && orderedMotivations.includes(primaryMotivation) ? primaryMotivation : ''

  return toBase64Url(`qz1:${orderedScores.join(',')}|${orderedInterests.join(',')}|${orderedDisinterests.join(',')}|${orderedMotivations.join(',')}|${encodedPrimary}`)
}

export function decodeQuizState(encoded: string): {
  answers: Record<number, number>
  interests: InterestKey[]
  disinterests: InterestKey[]
  motivations: MotivationKey[]
  primaryMotivation: MotivationKey | null
} | null {
  try {
    const decoded = fromBase64Url(encoded)

    if (!decoded.startsWith('qz1:')) {
      return null
    }

    const [rawScores, rawInterests = '', rawDisinterests = '', rawMotivations = '', rawPrimary = ''] = decoded
      .slice('qz1:'.length)
      .split('|')
    const rawNumbers = rawScores.split(',').map(Number)
    if (rawNumbers.length !== quizQuestions.length || rawNumbers.some(Number.isNaN)) {
      return null
    }

    const answers: Record<number, number> = {}
    quizQuestions.forEach((question, index) => {
      answers[question.id] = rawNumbers[index]
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

    return { answers, interests: uniqueInterests, disinterests: uniqueDisinterests, motivations: uniqueMotivations, primaryMotivation }
  } catch {
    return null
  }
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

function answerPairForTraitScore(score: number): [number, number] {
  switch (normalizeTraitScore(score)) {
    case 6:
      return [3, 3]
    case 4:
      return [3, 1]
    case 2:
      return [1, 1]
    case 0:
      return [1, -1]
    case -2:
      return [-1, -1]
    case -4:
      return [-3, -1]
    case -6:
      return [-3, -3]
    default:
      return [1, -1]
  }
}

export function answersFromTraitScores(scores: TraitScores): Record<number, number> {
  const answers: Record<number, number> = {}

  traitDefinitions.forEach((trait) => {
    const traitQuestions = quizQuestions.filter((question) => question.trait === trait.key)
    if (traitQuestions.length < 2) {
      return
    }

    const [firstScore, secondScore] = answerPairForTraitScore(scores[trait.key])
    answers[traitQuestions[0].id] = firstScore
    answers[traitQuestions[1].id] = secondScore
  })

  return answers
}

export function quizStateFromResult(result: QuizResult): {
  answers: Record<number, number>
  interests: InterestKey[]
  disinterests: InterestKey[]
  motivations: MotivationKey[]
  primaryMotivation: MotivationKey | null
} {
  return {
    answers: answersFromTraitScores(result.scores),
    interests: result.interests,
    disinterests: result.disinterests,
    motivations: result.motivations,
    primaryMotivation: result.primaryMotivation,
  }
}

  const TRAIT_SCORE_MAP: Record<number, number> = {
    '-6': 0,
    '-4': 1,
    '-2': 2,
    '0': 3,
    '2': 4,
    '4': 5,
    '6': 6,
  }

  const REVERSE_TRAIT_SCORE_MAP: Record<number, number> = {
    0: -6,
    1: -4,
    2: -2,
    3: 0,
    4: 2,
    5: 4,
    6: 6,
  }

  const MOTIVATION_ORDER: MotivationKey[] = ['restoration', 'education', 'socialMedia', 'escapism', 'community', 'challenge']

  export function encodeShareCode(result: QuizResult): string {
      const bytes: number[] = [0, 0, 0, 0, 0, 0, 0]

      // Pack trait scores into a 24-bit integer (8 traits × 3 bits each).
      // This guarantees each emitted byte is in the valid 0..255 range for btoa.
      const scoreValues = traitDefinitions.map((trait) => {
        const mapped = TRAIT_SCORE_MAP[result.scores[trait.key]]
        return typeof mapped === 'number' ? mapped : TRAIT_SCORE_MAP[0]
      })

      let packedScores = 0
      for (let i = 0; i < scoreValues.length; i += 1) {
        packedScores |= (scoreValues[i] & 0x7) << (i * 3)
      }

      bytes[0] = packedScores & 0xff
      bytes[1] = (packedScores >> 8) & 0xff
      bytes[2] = (packedScores >> 16) & 0xff

    // Byte 3: interests as 8 bits
    let interestByte = 0
    travelInterests.forEach((interest, index) => {
      if (result.interests.includes(interest.key)) {
        interestByte |= 1 << index
      }
    })
    bytes[3] = interestByte

    // Byte 4: disinterests as 8 bits
    let disinterestByte = 0
    travelInterests.forEach((interest, index) => {
      if (result.disinterests.includes(interest.key)) {
        disinterestByte |= 1 << index
      }
    })
    bytes[4] = disinterestByte

    // Byte 5-6: motivations (6 bits) + primary motivation (3 bits)
    let motivationByte = 0
    MOTIVATION_ORDER.forEach((motivation, index) => {
      if (result.motivations.includes(motivation)) {
        motivationByte |= 1 << index
      }
    })
    bytes[5] = motivationByte

    // Primary motivation: 0-5 for each, or 6 for null
    const primaryIndex = result.primaryMotivation
      ? MOTIVATION_ORDER.indexOf(result.primaryMotivation)
      : -1
    const primaryValue = primaryIndex >= 0 ? primaryIndex : 6
    bytes[6] = primaryValue & 0x7

    // Convert to binary string and encode
    const binaryString = String.fromCharCode(...bytes)
    return toBase64Url(binaryString)
  }

  export function decodeShareCode(code: string): QuizResult | null {
    try {
      const binaryString = fromBase64Url(code)
      const bytes = Array.from(binaryString).map((c) => c.charCodeAt(0))

      if (bytes.length < 7) {
        return null
      }

      // Unpack trait scores from first 3 bytes
      const scores = {} as TraitScores
      for (let i = 0; i < 8; i += 1) {
        const byteIndex = Math.floor((i * 3) / 8)
        const bitOffset = (i * 3) % 8
        let value = (bytes[byteIndex] >> bitOffset) & 0x7

        if (bitOffset + 3 > 8) {
          value |= ((bytes[byteIndex + 1] ?? 0) & ((1 << (bitOffset + 3 - 8)) - 1)) << (8 - bitOffset)
        }

        scores[traitDefinitions[i].key] = REVERSE_TRAIT_SCORE_MAP[value] ?? 0
      }

      // Unpack interests from byte 3
      const interests: InterestKey[] = []
      const interestByte = bytes[3] ?? 0
      travelInterests.forEach((interest, index) => {
        if ((interestByte & (1 << index)) !== 0) {
          interests.push(interest.key)
        }
      })

      // Unpack disinterests from byte 4
      const disinterests: InterestKey[] = []
      const disinterestByte = bytes[4] ?? 0
      travelInterests.forEach((interest, index) => {
        if ((disinterestByte & (1 << index)) !== 0) {
          disinterests.push(interest.key)
        }
      })

      // Unpack motivations from byte 5
      const motivations: MotivationKey[] = []
      const motivationByte = bytes[5] ?? 0
      MOTIVATION_ORDER.forEach((motivation, index) => {
        if ((motivationByte & (1 << index)) !== 0) {
          motivations.push(motivation)
        }
      })

      // Unpack primary motivation from byte 6
      const primaryValue = bytes[6] & 0x7
      const primaryMotivation = primaryValue < 6 ? MOTIVATION_ORDER[primaryValue] : null

      return { scores, interests, disinterests, motivations, primaryMotivation }
    } catch {
      return null
    }
  }
