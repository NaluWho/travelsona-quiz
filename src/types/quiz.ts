export type TraitKey =
  | 'structure'
  | 'budget'
  | 'pace'
  | 'energy'
  | 'adventure'
  | 'immersion'
  | 'social'
  | 'initiative'

export type TraitDefinition = {
  key: TraitKey
  label: string
  description: string
  highTitle: string
  lowTitle: string
}

export type QuestionOption = {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
  score: number
}

export type QuizQuestion = {
  id: number
  trait: TraitKey
  prompt: string
  options: QuestionOption[]
}

export type TraitScores = Record<TraitKey, number>
