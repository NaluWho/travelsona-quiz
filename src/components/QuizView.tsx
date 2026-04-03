import { quizQuestions } from '../data/questions'
import type { TraitScores } from '../types/quiz'
import { QuestionCard } from './QuestionCard'
import { scoreQuiz } from '../utils/scoring'

type QuizViewProps = {
  answers: Record<number, number>
  onAnswer: (questionId: number, score: number) => void
  onFinished: (scores: TraitScores) => void
}

export function QuizView({ answers, onAnswer, onFinished }: QuizViewProps) {
  const answeredCount = Object.keys(answers).length
  const complete = answeredCount === quizQuestions.length
  const progress = Math.round((answeredCount / quizQuestions.length) * 100)

  function submitQuiz() {
    const scores = scoreQuiz(answers, quizQuestions)
    onFinished(scores)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-teal-700">Travelsona Quiz</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-stone-900">Who Are You In A Travel Group?</h1>
        <p className="mt-2 text-stone-600">
          16 questions, 8 traits. Answer all questions to generate your profile then share your code with a friend to see how compatible you would be on a trip together.
        </p>

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-stone-200">
            <div className="h-2 rounded-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{answeredCount}/{quizQuestions.length} answered</p>
        </div>
      </div>

      {quizQuestions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          selectedScore={answers[question.id]}
          onAnswer={(score) => onAnswer(question.id, score)}
        />
      ))}

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
          {complete ? 'See My Results' : 'Answer All Questions To Continue'}
        </button>
      </div>
    </section>
  )
}
