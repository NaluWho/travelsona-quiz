import { quizQuestions } from '../data/questions'
import { travelInterests } from '../data/interests'
import { travelMotivations } from '../data/motivations'
import type { InterestKey, MotivationKey, QuizResult } from '../types/quiz'
import { QuestionCard } from './QuestionCard'
import { scoreQuiz } from '../utils/scoring'

type QuizViewProps = {
  answers: Record<number, number>
  selectedInterests: InterestKey[]
  selectedMotivations: MotivationKey[]
  primaryMotivation: MotivationKey | null
  onAnswer: (questionId: number, score: number) => void
  onInterestsChange: (interests: InterestKey[]) => void
  onMotivationsChange: (motivations: MotivationKey[]) => void
  onPrimaryMotivationChange: (motivation: MotivationKey | null) => void
  onFinished: (result: QuizResult) => void
}

export function QuizView({
  answers,
  selectedInterests,
  selectedMotivations,
  primaryMotivation,
  onAnswer,
  onInterestsChange,
  onMotivationsChange,
  onPrimaryMotivationChange,
  onFinished,
}: QuizViewProps) {
  const answeredCount = Object.keys(answers).length
  const interestsCount = selectedInterests.length
  const motivationsCount = selectedMotivations.length
  const validInterests = interestsCount >= 3 && interestsCount <= 5
  const validMotivations = motivationsCount >= 1 && motivationsCount <= 3
  const hasPrimaryMotivation =
    motivationsCount === 1 ||
    (primaryMotivation !== null && selectedMotivations.includes(primaryMotivation))
  const complete = answeredCount === quizQuestions.length && validInterests && validMotivations && hasPrimaryMotivation
  const progressSteps = answeredCount + (validInterests ? 1 : 0) + (validMotivations && hasPrimaryMotivation ? 1 : 0)
  const totalSteps = quizQuestions.length + 2
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

  function toggleMotivation(motivation: MotivationKey) {
    if (selectedMotivations.includes(motivation)) {
      const next = selectedMotivations.filter((item) => item !== motivation)
      onMotivationsChange(next)

      if (next.length === 1) {
        onPrimaryMotivationChange(next[0])
      } else if (primaryMotivation === motivation) {
        onPrimaryMotivationChange(null)
      }

      return
    }

    if (selectedMotivations.length >= 3) {
      return
    }

    const next = [...selectedMotivations, motivation]
    onMotivationsChange(next)

    if (next.length === 1) {
      onPrimaryMotivationChange(motivation)
    }
  }

  function submitQuiz() {
    const scores = scoreQuiz(answers, quizQuestions)
    onFinished({
      scores,
      interests: selectedInterests,
      motivations: selectedMotivations,
      primaryMotivation: selectedMotivations.length === 1 ? selectedMotivations[0] : primaryMotivation,
    })
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-teal-700">Travelsona Quiz</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-stone-900">Who Are You In A Travel Group?</h1>
        <p className="mt-2 text-stone-600">
          Section 1 covers personality traits. Sections 2 and 3 capture interests and motivations.
        </p>

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-stone-200">
            <div className="h-2 rounded-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            {answeredCount}/{quizQuestions.length} personality answered • {interestsCount}/5 interests selected • {motivationsCount}/3 motivations selected
          </p>
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

      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">Section 3</p>
        <h2 className="mt-2 text-lg font-semibold text-stone-900">Why do you travel?</h2>
        <p className="mt-2 text-sm text-stone-600">Select 1 to 3 motivations, then mark your number one motivation.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {travelMotivations.map((motivation) => {
            const selected = selectedMotivations.includes(motivation.key)
            const disabled = !selected && selectedMotivations.length >= 3
            const isPrimary = selected && ((selectedMotivations.length === 1) || primaryMotivation === motivation.key)

            return (
              <button
                key={motivation.key}
                type="button"
                disabled={disabled}
                onClick={() => toggleMotivation(motivation.key)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? 'border-teal-700 bg-teal-50 text-teal-900'
                    : disabled
                      ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-teal-400 hover:bg-teal-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{motivation.label}</p>
                  {isPrimary && (
                    <span className="rounded-full bg-teal-700 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                      #1
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm">{motivation.description}</p>
              </button>
            )
          })}
        </div>

        {selectedMotivations.length > 1 && (
          <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Pick your number one motivation</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedMotivations.map((motivation) => {
                const selectedPrimary = primaryMotivation === motivation
                return (
                  <button
                    key={motivation}
                    type="button"
                    onClick={() => onPrimaryMotivationChange(motivation)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                      selectedPrimary
                        ? 'bg-teal-700 text-white'
                        : 'border border-stone-300 bg-white text-stone-700 hover:border-teal-500 hover:text-teal-700'
                    }`}
                  >
                    {travelMotivations.find((item) => item.key === motivation)?.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!validMotivations && (
          <p className="mt-3 text-sm font-medium text-rose-700">Pick at least 1 motivation (maximum 3).</p>
        )}
        {validMotivations && selectedMotivations.length > 1 && !hasPrimaryMotivation && (
          <p className="mt-3 text-sm font-medium text-rose-700">Select your number one motivation.</p>
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
          {complete ? 'See My Results' : 'Complete All Sections To Continue'}
        </button>
      </div>
    </section>
  )
}
