import type { TraitKey } from '../types/quiz'

export type NarrativeDiffRange = 'very_close' | 'moderate' | 'large'

export type TraitNarrative = {
  very_close: string
  moderate: string
  large: string
}

function getDiffRange(diff: number): NarrativeDiffRange {
  if (diff <= 2) return 'very_close'
  if (diff <= 6) return 'moderate'
  return 'large'
}

export function getNarrative(trait: TraitKey, diff: number): string {
  const range = getDiffRange(diff)
  return compatibilityNarratives[trait][range]
}

export const compatibilityNarratives: Record<TraitKey, TraitNarrative> = {
  structure: {
    very_close:
      'You both have compatible approaches to planning. Whether you lean toward structure or spontaneity, you\'re on similar wavelengths about how to prepare for travel. This means fewer negotiations about itineraries, you can enjoy the trip without constantly compromising on how detailed (or loose) your plans should be.',
    moderate:
      'One of you prefers more structure while the other leans spontaneous, but you are flexible enough to meet in the middle. The planner can build a framework while the spontaneous partner adds room for last-minute discoveries. This dynamic works best if both trust each other\'s instincts. You may need to check in explicitly about what "plan enough" means to each of you.',
    large:
      'One craves detailed itineraries while the other wants zero plans. The planner may feel anxious if everything isn\'t booked in advance, while the spontaneous partner could feel suffocated by too much scheduling. To travel together, you\'ll need to find a real middle ground; maybe booking accommodations and a few key experiences but protecting time for wandering. Compromise is essential; ignoring each other\'s needs will breed resentment.',
  },

  budget: {
    very_close:
      'You have aligned spending philosophies. Whether you are both splurging on luxury or keeping things budget-friendly, you are unlikely to clash over dining choices, accommodation upgrades, or souvenir shopping. This removes a major source of travel friction.',
    moderate:
      'One of you is more willing to spend on comfort while the other prefers value. You can navigate this by dividing experiences; maybe one person\'s splurge meal is another\'s everyday dinner. Clear conversations about individual budgets upfront prevent awkward moments at checkout or when splitting costs.',
    large:
      'Widely different spending habits can cause tension. One person sees travel as time to indulge while the other sees it as a chance to preserve funds. This gap can create friction when booking hotels, choosing restaurants, or deciding on activities. Establish a shared daily budget or agree to split certain big expenses while keeping others separate.',
  },

  pace: {
    very_close:
      'You sync on daily rhythm. Whether you both want to race through sights or slow down and soak in moments, your energy levels and activity tolerance match. You\'ll naturally find a flow together without one person dragging the other.',
    moderate:
      'One of you is ready to go from sunrise to sunset while the other needs more downtime. This works if the faster person respects rest days and the slower person occasionally pushes past their comfort zone. Building in breaks and checking in about energy levels helps everyone feel heard.',
    large:
      'One partner moves at a sprint while the other wants a leisurely meander. The faster person may feel bored or held back; the slower person may feel exhausted trying to keep up. You will need to structure days with both shared experiences and personal time; maybe you explore separately for an afternoon or split your group temporarily so each person can enjoy their preferred pace.',
  },

  energy: {
    very_close:
      'You have matching activity levels. Whether you both crave hiking, museums, and interactive experiences or prefer watching from the sidelines, your preferences align. You can share activities without one person feeling bored or one person burning out.',
    moderate:
      'One of you is more active while the other prefers observation. The active partner might tackle a multi-hour hike while the passive partner explores a museum. These differences can actually make trips richer, you each bring different perspectives and can recharge in different ways during the day.',
    large:
      'One partner thrives on constant hands-on engagement while the other gravitates toward passive experiences. The active person might feel frustrated with leisurely café stops; the passive person might feel exhausted after a full-day climbing expedition. Plan days that honor both styles; perhaps mornings are active and afternoons are restful, or alternate days between activity levels.',
  },

  adventure: {
    very_close:
      'You share similar risk tolerance and appetite for novelty. Whether you both seek thrills or prefer familiar ground, you can explore at a comfort level that works for both. You are unlikely to pressure each other into experiences that feel unsafe or boring.',
    moderate:
      'One person is more adventurous while the other plays it safer, but you can find experiences that satisfy both. Maybe you pick one "stretch" activity that pushes the comfort zone slightly, or you each do your own thing for a day. You respect each other\'s boundaries while still allowing for some growth.',
    large:
      'One person craves high-risk thrills while the other wants only familiar, safe experiences. The adventurer may push the cautious partner into situations that feel dangerous or uncomfortable. The cautious partner may feel judged for wanting to skip skydiving or street food. Agree upfront on non-negotiables for safety and give each other permission to sit out certain activities without judgment.',
  },

  immersion: {
    very_close:
      'You align on how "deep" to go with local culture. Whether you both seek authentic neighborhoods and local practices or prefer curated tourist experiences, you can explore together without one person feeling like a "fake tourist" or the other feeling like they are missing real travel.',
    moderate:
      'One person hunts for off-the-beaten-path experiences while the other is content with tourist highlights. You can balance this by mixing itineraries; hit famous landmarks together, but save time for your partner to explore neighborhood restaurants or residential areas. Both styles can coexist if you respect each other\'s interests.',
    large:
      'One person wants only genuine, local experiences while the other prefers tourist-friendly comfort zones. The immersion-seeker may view their partner as superficial; the tourist-comfort person may feel judged or pushed out of their depth. Negotiate explicitly: maybe split time where each person leads an afternoon, or agree that some meals are local-focused while others are familiar brands.',
  },

  social: {
    very_close:
      'You have matching social needs. Whether you both want constant togetherness or plenty of solo time, you naturally give each other what you need without friction. No one feels abandoned or suffocated.',
    moderate:
      'One person needs more group time while the other values independence. This works well if you schedule some group activities and allow personal time for the introverted person. Morning coffee together and an evening reunion can satisfy both needs.',
    large:
      'One person wants to do everything as a group while the other needs significant solo time. The high-social person may feel hurt or abandoned when their partner disappears for afternoons; the solo-time person may feel claustrophobic. Set expectations early: agree on group meals or check-ins, but protect unscheduled personal time. Don\'t take independence personally.',
  },

  initiative: {
    very_close:
      'You both have similar comfort levels with decision-making and planning. Whether you both love organizing or prefer someone else to take charge, you are the same. Two drivers may end up competing for control, but two passengers may never leave the driveway. As long as you\'re willing to step up or step back as needed, you can navigate this dynamic without resentment.',
    moderate:
      'One person naturally takes the lead while the other is content following. This can work beautifully; the leader researches and proposes, the follower enjoys the relief of not having to decide. As long as the follower occasionally shares preferences and the leader doesn\'t feel abandoned, this dynamic thrives.',
    large:
      'One person controls every decision while the other is along for the ride. The leader may feel frustrated managing everything while the follower may feel resentful or invisible. Or the follower will feel unburdened by decisions while the leader feels in their natural element. This dynamic can either be very challenging or harmonious depending on each person\'s expectations of the other\'s contributions.',
  },
}
