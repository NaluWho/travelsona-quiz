import type { QuizQuestion } from '../types/quiz'

type QuestionCardProps = {
  question: QuizQuestion
  selectedScore?: number
  onAnswer: (score: number) => void
}

export function QuestionCard({ question, selectedScore, onAnswer }: QuestionCardProps) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Q{question.id}. {question.prompt}</h2>

      <div className="mt-4 grid gap-3">
        {question.options.map((option) => {
          const selected = selectedScore === option.score
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onAnswer(option.score)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? 'border-teal-700 bg-teal-50 text-teal-900'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-teal-400 hover:bg-teal-50/60'
              }`}
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-semibold">
                {option.id}
              </span>
              {option.text}
            </button>
          )
        })}
      </div>
    </article>
  )
}
