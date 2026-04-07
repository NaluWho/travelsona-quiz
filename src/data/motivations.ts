import type { MotivationDefinition, MotivationKey } from '../types/quiz'

export const travelMotivations: MotivationDefinition[] = [
  { key: 'restoration', label: 'Restoration', description: 'To de-stress, sleep, and heal from work/life.' },
  { key: 'education', label: 'Education', description: 'To learn history, language, or new skills.' },
  { key: 'socialMedia', label: 'Social Media', description: 'To see the it places and share the experience.' },
  { key: 'escapism', label: 'Escapism', description: 'To feel like you are in a different world/reality.' },
  { key: 'community', label: 'Community', description: 'To become closer to the people I am traveling with/visiting.' },
  { key: 'challenge', label: 'Challenge', description: 'To push physical or mental limits (hiking, marathons).' },
]

export const motivationMap = travelMotivations.reduce((acc, motivation) => {
  acc[motivation.key] = motivation
  return acc
}, {} as Record<MotivationKey, MotivationDefinition>)
