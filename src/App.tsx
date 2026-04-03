import { useMemo, useState } from 'react'
import { CompatibilityChecker } from './components/CompatibilityChecker'
import { QuizView } from './components/QuizView'
import { ResultSummary } from './components/ResultSummary'
import { TraitRadarChart } from './components/TraitRadarChart'
import type { TraitScores } from './types/quiz'
import { decodeScores, encodeScores } from './utils/encoding'

function App() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<TraitScores | null>(() => {
    const code = new URL(window.location.href).searchParams.get('r')
    return code ? decodeScores(code) : null
  })

  const shareCode = useMemo(() => (result ? encodeScores(result) : ''), [result])
  const shareUrl = useMemo(() => {
    if (!shareCode) {
      return ''
    }
    const url = new URL(window.location.href)
    url.searchParams.set('r', shareCode)
    return url.toString()
  }, [shareCode])

  function setAnswer(questionId: number, score: number) {
    setAnswers((current) => ({ ...current, [questionId]: score }))
  }

  function handleFinished(scores: TraitScores) {
    setResult(scores)
    const code = encodeScores(scores)
    const url = new URL(window.location.href)
    url.searchParams.set('r', code)
    window.history.replaceState({}, '', url)
  }

  function copyText(value: string) {
    navigator.clipboard.writeText(value).catch(() => {
      window.prompt('Copy this value:', value)
    })
  }

  function retakeQuiz() {
    setAnswers({})
    setResult(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('r')
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
        <QuizView answers={answers} onAnswer={setAnswer} onFinished={handleFinished} />
      )}

      {result && (
        <section className="space-y-6">
          <ResultSummary scores={result} />

          <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <TraitRadarChart scores={result} />

            <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900">Share Result</h3>
              <p className="mt-2 text-sm text-stone-600">
                This app does not store personal data. Your scores are encoded in this share value.
              </p>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Share Code</label>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={shareCode}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700"
                />
                <button
                  type="button"
                  onClick={() => copyText(shareCode)}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                >
                  Copy
                </button>
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Share URL</label>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700"
                />
                <button
                  type="button"
                  onClick={() => copyText(shareUrl)}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                >
                  Copy
                </button>
              </div>

              <button
                type="button"
                onClick={retakeQuiz}
                className="mt-5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
              >
                Retake Quiz
              </button>
            </aside>
          </section>

          <CompatibilityChecker myScores={result} />
        </section>
      )}
    </main>
  )
}

export default App
