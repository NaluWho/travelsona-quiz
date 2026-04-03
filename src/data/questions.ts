import type { QuizQuestion } from '../types/quiz'

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    trait: 'structure',
    prompt: 'How much of your daily itinerary should be decided before the trip begins?',
    options: [
      { id: 'A', text: 'Every hour is accounted for with pre-booked tickets.', score: 3 },
      { id: 'B', text: 'Most major activities are scheduled, but afternoons are open.', score: 1 },
      { id: 'C', text: 'I have a list of ideas, but we decide what to do each morning.', score: -1 },
      { id: 'D', text: 'Absolutely nothing is planned; we go where the wind blows.', score: -3 },
    ],
  },
  {
    id: 2,
    trait: 'structure',
    prompt: 'How do you react when a plan has to be canceled or changed at the last minute?',
    options: [
      { id: 'A', text: 'I feel stressed and immediately need to build a new formal plan.', score: 3 },
      { id: 'B', text: 'I am slightly annoyed but can pivot to a backup option.', score: 1 },
      { id: 'C', text: 'I am fine with it; it is an opportunity for something unexpected.', score: -1 },
      { id: 'D', text: 'I prefer it; the best parts of travel are the unplanned ones.', score: -3 },
    ],
  },
  {
    id: 3,
    trait: 'budget',
    prompt: 'When choosing a place to stay, what is your primary mindset?',
    options: [
      { id: 'A', text: 'I am willing to pay a premium for luxury, comfort, and service.', score: 3 },
      { id: 'B', text: 'I look for high-quality boutique spots that are worth the splurge.', score: 1 },
      { id: 'C', text: 'I look for the best value-for-money, even if it is basic.', score: -1 },
      { id: 'D', text: 'I want the cheapest bed possible to save money for other things.', score: -3 },
    ],
  },
  {
    id: 4,
    trait: 'budget',
    prompt: 'How do you approach dining and meals while traveling?',
    options: [
      { id: 'A', text: 'Fine dining and famous restaurants are a priority worth the cost.', score: 3 },
      { id: 'B', text: 'I enjoy a mix of nice sit-down meals and casual spots.', score: 1 },
      { id: 'C', text: 'I stick to cheap local eats and street food to save money.', score: -1 },
      { id: 'D', text: 'I prefer grocery shopping and making my own meals to minimize cost.', score: -3 },
    ],
  },
  {
    id: 5,
    trait: 'pace',
    prompt: 'What is your ideal number of major activities or sights per day?',
    options: [
      { id: 'A', text: 'As many as possible; I want to see the whole city in one go.', score: 3 },
      { id: 'B', text: 'Three or four solid activities with short breaks in between.', score: 1 },
      { id: 'C', text: 'One or two main things, followed by plenty of downtime.', score: -1 },
      { id: 'D', text: 'Just one thing or even zero. I am here to relax.', score: -3 },
    ],
  },
  {
    id: 6,
    trait: 'pace',
    prompt: 'How do you feel about early starts (for example, leaving the hotel by 7:30 AM)?',
    options: [
      { id: 'A', text: 'I love them; it is the best way to beat crowds and maximize the day.', score: 3 },
      { id: 'B', text: 'I am fine with them if it means seeing something special.', score: 1 },
      { id: 'C', text: 'I would rather sleep in and start around 10:00 AM.', score: -1 },
      { id: 'D', text: 'I refuse to set an alarm; the day starts when I wake up.', score: -3 },
    ],
  },
  {
    id: 7,
    trait: 'energy',
    prompt: 'How physically or mentally involved do you want to be in your activities?',
    options: [
      { id: 'A', text: 'Very active; I want to hike, climb, or take a hands-on class.', score: 3 },
      { id: 'B', text: 'Moderately active; I enjoy walking tours and interactive museums.', score: 1 },
      { id: 'C', text: 'Mostly passive; I prefer boat tours, bus tours, or watching a show.', score: -1 },
      { id: 'D', text: 'Entirely passive; I want to sit and enjoy the view or read a book.', score: -3 },
    ],
  },
  {
    id: 8,
    trait: 'energy',
    prompt: 'After a long day of sightseeing, how do you recharge?',
    options: [
      { id: 'A', text: 'By doing something different, like a night walk or a fitness class.', score: 3 },
      { id: 'B', text: 'By going out for a social drink or a casual stroll.', score: 1 },
      { id: 'C', text: 'By sitting quietly in a park or a cafe with a snack.', score: -1 },
      { id: 'D', text: 'By returning to my room for total physical rest.', score: -3 },
    ],
  },
  {
    id: 9,
    trait: 'adventure',
    prompt: 'How do you feel about visiting a destination where you do not speak the language?',
    options: [
      { id: 'A', text: 'I love it; the challenge and the newness are the best parts.', score: 3 },
      { id: 'B', text: 'I enjoy it, as long as I have a translation app handy.', score: 1 },
      { id: 'C', text: 'I find it slightly stressful and prefer places with English signs.', score: -1 },
      { id: 'D', text: 'I avoid it; I prefer places where I can communicate easily.', score: -3 },
    ],
  },
  {
    id: 10,
    trait: 'adventure',
    prompt: 'What is your preference regarding repeat visits to destinations?',
    options: [
      { id: 'A', text: 'I never go to the same place twice; the world is too big.', score: 3 },
      { id: 'B', text: 'I usually prefer new places, but I will go back to a favorite once or twice.', score: 1 },
      { id: 'C', text: 'I like returning to familiar places where I know the layout.', score: -1 },
      { id: 'D', text: 'I have one or two go-to spots I visit almost every year.', score: -3 },
    ],
  },
  {
    id: 11,
    trait: 'immersion',
    prompt: 'How important is it for you to eat authentic local food?',
    options: [
      { id: 'A', text: 'Essential; I only eat where the locals eat, no matter the menu.', score: 3 },
      { id: 'B', text: 'Very important, but I still appreciate a tourist-friendly version.', score: 1 },
      { id: 'C', text: 'Not a priority; I am happy with familiar global food I know I like.', score: -1 },
      { id: 'D', text: 'I actively prefer familiar chain restaurants for comfort.', score: -3 },
    ],
  },
  {
    id: 12,
    trait: 'immersion',
    prompt: 'When exploring a city, which area draws you in?',
    options: [
      { id: 'A', text: 'The residential backstreets and quiet, non-touristy districts.', score: 3 },
      { id: 'B', text: 'A mix of the main historic sites and surrounding neighborhoods.', score: 1 },
      { id: 'C', text: 'The main tourist hubs where the famous landmarks are.', score: -1 },
      { id: 'D', text: 'The specific tourist zones like shopping centers and hotel strips.', score: -3 },
    ],
  },
  {
    id: 13,
    trait: 'social',
    prompt: 'On a group trip, how much time do you want to spend doing your own thing?',
    options: [
      { id: 'A', text: 'None; the point of a group trip is to be together 24/7.', score: 3 },
      { id: 'B', text: 'Very little; maybe an hour or two of solo time here and there.', score: 1 },
      { id: 'C', text: 'A fair amount; I like to peel off for half a day to explore alone.', score: -1 },
      { id: 'D', text: 'A lot; I need most of my afternoons or evenings to myself.', score: -3 },
    ],
  },
  {
    id: 14,
    trait: 'social',
    prompt: 'How do you feel about meeting and talking to strangers (locals or other travelers)?',
    options: [
      { id: 'A', text: 'I love it; I am always the first to start a conversation.', score: 3 },
      { id: 'B', text: 'I enjoy it if the situation arises naturally.', score: 1 },
      { id: 'C', text: 'I am polite if spoken to, but generally stay within my group.', score: -1 },
      { id: 'D', text: 'I avoid it; I prefer to keep to myself and close companions.', score: -3 },
    ],
  },
  {
    id: 15,
    trait: 'initiative',
    prompt: 'Who usually makes the final decision on where to eat or what to do next?',
    options: [
      { id: 'A', text: 'Me. I am the one doing the research and making the call.', score: 3 },
      { id: 'B', text: 'I usually offer a few options and help the group choose.', score: 1 },
      { id: 'C', text: 'I am happy to go with whatever the majority wants.', score: -1 },
      { id: 'D', text: 'I prefer someone else to tell me the plan so I do not have to think.', score: -3 },
    ],
  },
  {
    id: 16,
    trait: 'initiative',
    prompt: 'How do you feel about navigating (maps, transit, directions)?',
    options: [
      { id: 'A', text: 'I enjoy being the navigator and taking charge of directions.', score: 3 },
      { id: 'B', text: 'I can do it if needed, but I am fine letting someone else lead.', score: 1 },
      { id: 'C', text: 'I would rather follow the person who knows where they are going.', score: -1 },
      { id: 'D', text: 'I find navigation stressful and prefer to be a passenger.', score: -3 },
    ],
  },
]
