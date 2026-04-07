import type { InterestDefinition, InterestKey } from '../types/quiz'

export const travelInterests: InterestDefinition[] = [
  { key: 'culinary', label: 'Culinary', description: 'Food tours, markets, fine dining.' },
  { key: 'active', label: 'Active', description: 'Hiking, surfing, gym sessions.' },
  { key: 'creative', label: 'Creative', description: 'Photography, sketching, vlogging.' },
  { key: 'historical', label: 'Historical', description: 'Museums, ruins, old towns.' },
  { key: 'retail', label: 'Retail', description: 'Thrifting, luxury shopping, local crafts.' },
  { key: 'nightlife', label: 'Nightlife', description: 'Bars, clubs, late-night music.' },
  { key: 'wellness', label: 'Wellness', description: 'Yoga, spas, meditation.' },
  { key: 'nature', label: 'Nature', description: 'Wildlife, parks, scenic views.' },
]

export const interestMap = travelInterests.reduce((acc, interest) => {
  acc[interest.key] = interest
  return acc
}, {} as Record<InterestKey, InterestDefinition>)
