import { quizQuestions } from '../data/questions'
import { travelInterests } from '../data/interests'
import type { InterestKey, QuizResult } from '../types/quiz'
import { QuestionCard } from './QuestionCard'
import { scoreQuiz } from '../utils/scoring'

type QuizViewProps = {
  answers: Record<number, number>
  selectedInterests: InterestKey[]
  onAnswer: (questionId: number, score: number) => void
  onInterestsChange: (interests: InterestKey[]) => void
  onFinished: (result: QuizResult) => void
}

export function QuizView({
  answers,
  selectedInterests,
  onAnswer,
  onInterestsChange,
  onFinished,
}: QuizViewProps) {
  const answeredCount = Object.keys(answers).length
  const interestsCount = selectedInterests.length
  const validInterests = interestsCount >= 3 && interestsCount <= 5
  const complete = answeredCount === quizQuestions.length && validInterests
  const progressSteps = answeredCount + (validInterests ? 1 : 0)
  const totalSteps = quizQuestions.length + 1
  const progress = Math.round((progressSteps / totalSteps) * 100)

  function toggleInterest(interest: InterestKey) {
    if (selectedInterests.includes(interest)) {
      onInterestsChange(selectedInterests.filter((item) => item !== interest))
      return
    }

    if (selectedInterests.length >= 5) {
      return
    }

    onInterestsChange([...selectedInterests, interest])
  }

  function submitQuiz() {
    const scores = scoreQuiz(answers, quizQuestions)
    onFinished({ scores, interests: selectedInterests })
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-teal-700">Travelsona Quiz</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-stone-900">Who Are You In A Travel Group?</h1>
        <p className="mt-2 text-stone-600">
          Section 1 covers personality traits. Section 2 captures travel interests. Complete both to generate your profile.
        </p>

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-stone-200">
            <div className="h-2 rounded-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{answeredCount}/{quizQuestions.length} personality answered • {interestsCount}/5 interests selected</p>
        </div>
      </div>

      <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">Section 1</p>
        <p className="mt-1 text-sm font-semibold text-stone-900">Travel Personality</p>
      </section>

      {quizQuestions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          selectedScore={answers[question.id]}
          onAnswer={(score) => onAnswer(question.id, score)}
        />
      ))}

      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">Section 2</p>
        <h2 className="mt-2 text-lg font-semibold text-stone-900">What activities interest you while traveling?</h2>
        <p className="mt-2 text-sm text-stone-600">Select 3 to 5 options.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {travelInterests.map((interest) => {
            const selected = selectedInterests.includes(interest.key)
            const disabled = !selected && selectedInterests.length >= 5

            return (
              <button
                key={interest.key}
                type="button"
                disabled={disabled}
                onClick={() => toggleInterest(interest.key)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? 'border-teal-700 bg-teal-50 text-teal-900'
                    : disabled
                      ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-teal-400 hover:bg-teal-50/60'
                }`}
              >
                <p className="font-semibold">{interest.label}</p>
                <p className="mt-1 text-sm">{interest.description}</p>
              </button>
            )
          })}
        </div>

        {!validInterests && (
          <p className="mt-3 text-sm font-medium text-rose-700">Pick at least 3 interests (maximum 5).</p>
        )}
      </article>

      <div className="sticky bottom-4 z-10">
        <button
          type="button"
          onClick={submitQuiz}
          disabled={!complete}
          className={`w-full rounded-xl px-6 py-4 text-base font-bold uppercase tracking-[0.08em] transition ${
            complete
              ? 'bg-teal-700 text-white hover:bg-teal-800'
              : 'cursor-not-allowed bg-stone-300 text-stone-500'
          }`}
        >
          {complete ? 'See My Results' : 'Complete Both Sections To Continue'}
        </button>
      </div>
    </section>
  )
}
