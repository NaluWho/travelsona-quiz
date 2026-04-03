import type { TraitDefinition } from '../types/quiz'

export const traitDefinitions: TraitDefinition[] = [
  {
    key: 'structure',
    label: 'Structure',
    description: 'Planning and organization',
    highTitle: 'The Architect',
    lowTitle: 'The Wanderer',
  },
  {
    key: 'budget',
    label: 'Budget',
    description: 'Financial priority on the trip',
    highTitle: 'The Investor',
    lowTitle: 'The Backpacker',
  },
  {
    key: 'pace',
    label: 'Pace',
    description: 'Daily activity and energy level',
    highTitle: 'The Dynamo',
    lowTitle: 'The Lounger',
  },
  {
    key: 'energy',
    label: 'Energy',
    description: 'To do or to see',
    highTitle: 'The Expediter',
    lowTitle: 'The Observer',
  },
  {
    key: 'adventure',
    label: 'Adventure',
    description: 'Risk tolerance and thrill-seeking',
    highTitle: 'The Explorer',
    lowTitle: 'The Cautious',
  },
  {
    key: 'immersion',
    label: 'Immersion',
    description: 'Desire for local experience',
    highTitle: 'The Cultured',
    lowTitle: 'The Escapist',
  },
  {
    key: 'social',
    label: 'Social',
    description: 'Need for time with the group vs. solo time',
    highTitle: 'The Hive',
    lowTitle: 'The Solitaire',
  },
  {
    key: 'initiative',
    label: 'Initiative',
    description: 'Group role and decision-making',
    highTitle: 'The Leader',
    lowTitle: 'The Follower',
  },
]

export const traitMap = Object.fromEntries(
  traitDefinitions.map((trait) => [trait.key, trait]),
)
