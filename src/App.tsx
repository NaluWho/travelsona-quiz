import { useMemo, useState } from 'react'
import { CompatibilityChecker } from './components/CompatibilityChecker'
import { QuizView } from './components/QuizView'
import { ResultSummary } from './components/ResultSummary'
import { TraitRadarChart } from './components/TraitRadarChart'
import { quizQuestions } from './data/questions'
import type { InterestKey, MotivationKey, QuizResult } from './types/quiz'
import {
  decodeQuizState,
  decodeResult,
  encodeQuizState,
  encodeResult,
  encodeShareCode,
  quizStateFromResult,
} from './utils/encoding'

type QuizState = {
  answers: Record<number, number>
  interests: InterestKey[]
  disinterests: InterestKey[]
  motivations: MotivationKey[]
  primaryMotivation: MotivationKey | null
}

const EMPTY_QUIZ_STATE: QuizState = {
  answers: {},
  interests: [],
  disinterests: [],
  motivations: [],
  primaryMotivation: null,
}

function App() {
  const initialState = useMemo(() => {
    const url = new URL(window.location.href)
    const resultCode = url.searchParams.get('r')
    const mode = url.searchParams.get('mode')

    if (resultCode) {
      const decodedResult = decodeResult(resultCode)
      if (decodedResult) {
        if (mode === 'quiz') {
          return { result: null, quiz: quizStateFromResult(decodedResult) }
        }

        return { result: decodedResult, quiz: EMPTY_QUIZ_STATE }
      }
    }

    const quizCode = url.searchParams.get('q')
    if (quizCode) {
      const decodedQuiz = decodeQuizState(quizCode)
      if (decodedQuiz) {
        return { result: null, quiz: decodedQuiz }
      }
    }

    return { result: null, quiz: EMPTY_QUIZ_STATE }
  }, [])

  const [answers, setAnswers] = useState<Record<number, number>>(initialState.quiz.answers)
  const [interests, setInterests] = useState<InterestKey[]>(initialState.quiz.interests)
  const [disinterests, setDisinterests] = useState<InterestKey[]>(initialState.quiz.disinterests)
  const [motivations, setMotivations] = useState<MotivationKey[]>(initialState.quiz.motivations)
  const [primaryMotivation, setPrimaryMotivation] = useState<MotivationKey | null>(initialState.quiz.primaryMotivation)
  const [result, setResult] = useState<QuizResult | null>(initialState.result)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const encodedResult = useMemo(() => (result ? encodeResult(result) : ''), [result])
  const compactCode = useMemo(() => {
    if (!result) {
      return ''
    }

    try {
      return encodeShareCode(result)
    } catch {
      return ''
    }
  }, [result])

  const resultUrl = useMemo(() => {
    if (!encodedResult) {
      return ''
    }

    const url = new URL(window.location.href)
    url.searchParams.set('r', encodedResult)
    url.searchParams.delete('q')
    url.searchParams.delete('mode')
    return url.toString()
  }, [encodedResult])

  const baseQuizUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('r')
    url.searchParams.delete('q')
    url.searchParams.delete('mode')
    return url.toString()
  }, [])

  function setAnswer(questionId: number, score: number) {
    setAnswers((current) => ({ ...current, [questionId]: score }))
  }

  function handleFinished(nextResult: QuizResult) {
    setResult(nextResult)

    const code = encodeResult(nextResult)
    const url = new URL(window.location.href)
    url.searchParams.set('r', code)
    url.searchParams.delete('q')
    url.searchParams.delete('mode')
    window.history.replaceState({}, '', url)
  }

  function copyText(value: string, field: string) {
    navigator.clipboard.writeText(value).catch(() => {
      window.prompt('Copy this value:', value)
    })
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  function retakeQuiz() {
    const hasFullAnswers = Object.keys(answers).length === quizQuestions.length
    const nextQuizState = hasFullAnswers
      ? { answers, interests, disinterests, motivations, primaryMotivation }
      : result
        ? quizStateFromResult(result)
        : EMPTY_QUIZ_STATE

    setAnswers(nextQuizState.answers)
    setInterests(nextQuizState.interests)
    setDisinterests(nextQuizState.disinterests)
    setMotivations(nextQuizState.motivations)
    setPrimaryMotivation(nextQuizState.primaryMotivation)
    setResult(null)

    const quizCode = encodeQuizState(
      nextQuizState.answers,
      nextQuizState.interests,
      nextQuizState.disinterests,
      nextQuizState.motivations,
      nextQuizState.primaryMotivation,
    )

    const url = new URL(window.location.href)
    url.searchParams.delete('r')
    url.searchParams.delete('mode')
    url.searchParams.set('q', quizCode)
    window.history.replaceState({}, '', url)
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-4 md:p-6">
      <header className="mb-6 rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-100 via-amber-50 to-orange-100 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">Travelsona</p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-stone-900 md:text-5xl">Travel Compatibility Quiz</h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-700 md:text-base">
          Uncover your travel personality across eight traits and discover how compatible you are with friends.
        </p>
      </header>

      {!result && (
        <QuizView
          answers={answers}
          selectedInterests={interests}
          selectedDisinterests={disinterests}
          selectedMotivations={motivations}
          primaryMotivation={primaryMotivation}
          onAnswer={setAnswer}
          onInterestsChange={setInterests}
          onDisinterestsChange={setDisinterests}
          onMotivationsChange={setMotivations}
          onPrimaryMotivationChange={setPrimaryMotivation}
          onFinished={handleFinished}
        />
      )}

      {result && (
        <section className="space-y-6">
          <ResultSummary
            scores={result.scores}
            interests={result.interests}
            disinterests={result.disinterests}
            motivations={result.motivations}
            primaryMotivation={result.primaryMotivation}
          />

          <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <TraitRadarChart scores={result.scores} />

            <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900">Share Result</h3>
              <p className="mt-2 text-sm text-stone-600">
                Share by URL for one-click viewing, or share a compact code to compare directly in this app.
              </p>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Compact Share Code</label>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={compactCode}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700"
                />
                <button
                  type="button"
                  onClick={() => copyText(compactCode, 'compactCode')}
                  className={`min-w-[88px] rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    copiedField === 'compactCode'
                      ? 'bg-green-600 text-white'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {copiedField === 'compactCode' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Share URL</label>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={resultUrl}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700"
                />
                <button
                  type="button"
                  onClick={() => copyText(resultUrl, 'url')}
                  className={`min-w-[88px] rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    copiedField === 'url'
                      ? 'bg-green-600 text-white'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {copiedField === 'url' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Share Message</label>
              <p className="mt-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
                Take the Travel Compatibility Quiz: {baseQuizUrl} and compare with code: {compactCode}
              </p>
              <button
                type="button"
                onClick={() => copyText(`Take the Travel Compatibility Quiz: ${baseQuizUrl} and compare with code: ${compactCode}`, 'message')}
                className={`mt-2 w-full rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  copiedField === 'message'
                    ? 'bg-green-600 text-white'
                    : 'bg-teal-700 text-white hover:bg-teal-800'
                }`}
              >
                {copiedField === 'message' ? 'Copied' : 'Copy Message'}
              </button>

              <button
                type="button"
                onClick={retakeQuiz}
                className="mt-5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
              >
                Retake Quiz
              </button>
            </aside>
          </section>

          <CompatibilityChecker myResult={result} />
        </section>
      )}
    </main>
  )
}

export default App
