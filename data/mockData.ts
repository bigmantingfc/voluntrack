
import { Organization, Opportunity, OpportunityCategory, TimeCommitment, UserProfile, LoggedHour, ImpactStory } from '../types';

export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org1', name: 'Green Earth Initiative', contactEmail: 'contact@greenearth.org', website: 'https://greenearth.org', description: 'Dedicated to local environmental conservation and education.' },
  { id: 'org2', name: 'Community Food Bank', contactEmail: 'volunteer@foodbank.org', website: 'https://communityfoodbank.org', description: 'Providing essential food support to families in need.' },
  { id: 'org3', name: 'Tech for Seniors', contactEmail: 'info@techforseniors.com', website: 'https://techforseniors.com', description: 'Bridging the digital divide for senior citizens.' },
  { id: 'org4', name: 'Animal Friends Shelter', contactEmail: 'adopt@animalfriends.org', website: 'https://animalfriends.org', description: 'Caring for and rehoming abandoned and stray animals.' },
  { id: 'org5', name: 'Youth Mentorship Program', contactEmail: 'mentor@youthprogram.org', website: 'https://youthprogram.org', description: 'Connecting young students with positive role models.' },
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp1',
    title: 'Tree Planting Day',
    organizationId: 'org1',
    organization: MOCK_ORGANIZATIONS[0],
    description: 'Join us for a day of tree planting at Willow Creek Park. Help improve our local ecosystem and enjoy a day outdoors. All tools provided.',
    dates: '2024-09-15, 9:00 AM - 1:00 PM',
    location: 'Willow Creek Park',
    skillsRequired: ['Gardening (optional)', 'Teamwork'],
    contactPerson: 'Sarah Green',
    contactEmail: 'sarah@greenearth.org',
    applicationLink: 'https://greenearth.org/tree-planting',
    category: OpportunityCategory.ENVIRONMENT,
    timeCommitment: TimeCommitment.TWO_TO_FOUR_HOURS,
    publishedDate: '2024-07-01T10:00:00Z'
  },
  {
    id: 'opp2',
    title: 'Food Pantry Sorter',
    organizationId: 'org2',
    organization: MOCK_ORGANIZATIONS[1],
    description: 'Help sort and pack food donations at our central warehouse. A vital role in ensuring families receive the support they need.',
    dates: 'Ongoing, Mon-Fri, 10:00 AM - 4:00 PM (flexible shifts)',
    location: '123 Food Bank Rd',
    skillsRequired: ['Attention to detail', 'Ability to lift 10 lbs'],
    contactEmail: 'volunteer@foodbank.org',
    category: OpportunityCategory.HOMELESSNESS,
    timeCommitment: TimeCommitment.FLEXIBLE,
    publishedDate: '2024-07-05T14:00:00Z'
  },
  {
    id: 'opp3',
    title: 'Digital Literacy Tutor for Seniors',
    organizationId: 'org3',
    organization: MOCK_ORGANIZATIONS[2],
    description: 'Teach basic computer and internet skills to senior citizens. Help them connect with family and access online resources. Patience and good communication skills are key.',
    dates: 'Every Wednesday, 2:00 PM - 4:00 PM',
    location: 'Senior Community Center',
    skillsRequired: ['Basic computer proficiency', 'Teaching ability', 'Patience'],
    category: OpportunityCategory.SENIORS,
    timeCommitment: TimeCommitment.ONGOING_WEEKLY,
    publishedDate: '2024-07-10T11:00:00Z'
  },
  {
    id: 'opp4',
    title: 'Weekend Dog Walker',
    organizationId: 'org4',
    organization: MOCK_ORGANIZATIONS[3],
    description: 'Spend your weekend mornings walking and playing with shelter dogs. Provide much-needed exercise and socialization for our furry friends.',
    dates: 'Saturdays & Sundays, 9:00 AM - 12:00 PM',
    location: 'Animal Friends Shelter, 55 Paws Ave',
    category: OpportunityCategory.ANIMALS,
    timeCommitment: TimeCommitment.TWO_TO_FOUR_HOURS,
    publishedDate: '2024-07-12T16:00:00Z'
  },
  {
    id: 'opp5',
    title: 'After-School Homework Helper',
    organizationId: 'org5',
    organization: MOCK_ORGANIZATIONS[4],
    description: 'Assist elementary school students with their homework and provide academic support in a positive environment.',
    dates: 'Tuesdays & Thursdays, 3:30 PM - 5:00 PM',
    location: 'Community Youth Center',
    skillsRequired: ['Proficiency in basic subjects', 'Good communication'],
    category: OpportunityCategory.EDUCATION,
    timeCommitment: TimeCommitment.ONGOING_WEEKLY,
    publishedDate: '2024-07-15T09:00:00Z'
  },
  {
    id: 'opp6',
    title: 'Community Garden Maintenance',
    organizationId: 'org1',
    organization: MOCK_ORGANIZATIONS[0],
    description: 'Help maintain our beautiful community garden. Tasks include weeding, watering, and planting seasonal vegetables.',
    dates: 'First Saturday of each month, 10:00 AM - 12:00 PM',
    location: 'Downtown Community Garden',
    category: OpportunityCategory.COMMUNITY,
    timeCommitment: TimeCommitment.LESS_THAN_2_HOURS,
    publishedDate: '2024-07-18T13:00:00Z'
  },
   {
    id: 'opp7',
    title: 'Museum Exhibit Guide',
    organizationId: 'org3', // Example, could be a museum org
    organization: MOCK_ORGANIZATIONS[2],
    description: 'Volunteer as an exhibit guide at the local history museum. Share fascinating stories with visitors and help bring history to life. Training provided.',
    dates: 'Weekends, 1:00 PM - 5:00 PM (flexible shifts)',
    location: 'City History Museum',
    skillsRequired: ['Public speaking', 'Interest in history'],
    category: OpportunityCategory.ARTS_CULTURE,
    timeCommitment: TimeCommitment.FLEXIBLE,
    publishedDate: '2024-07-20T10:00:00Z'
  },
  {
    id: 'opp8',
    title: 'Soup Kitchen Server',
    organizationId: 'org2',
    organization: MOCK_ORGANIZATIONS[1],
    description: 'Assist in preparing and serving meals at our community soup kitchen. A direct way to help those facing food insecurity.',
    dates: 'Every Friday, 5:00 PM - 7:00 PM',
    location: 'St. Mary\'s Church Hall',
    category: OpportunityCategory.HOMELESSNESS,
    timeCommitment: TimeCommitment.TWO_TO_FOUR_HOURS,
    publishedDate: '2024-07-22T15:00:00Z'
  },
  {
    id: 'opp9',
    title: 'Festival Setup Crew',
    organizationId: 'org5', // Example, could be a community event org
    organization: MOCK_ORGANIZATIONS[4],
    description: 'Help set up for the annual City Summer Festival. Tasks include setting up booths, signs, and decorations. Great for a one-time energetic contribution.',
    dates: '2024-08-10, 8:00 AM - 12:00 PM',
    location: 'City Central Park',
    category: OpportunityCategory.COMMUNITY,
    timeCommitment: TimeCommitment.FULL_DAY, // Or rather, Two to Four Hours based on time
    publishedDate: '2024-07-25T12:00:00Z'
  }
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user1',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    phone: '123-456-7890',
    interests: [OpportunityCategory.ANIMALS, OpportunityCategory.ENVIRONMENT],
    availability: 'Weekends',
    savedOpportunityIds: ['opp1', 'opp4'],
    location: 'San Francisco, CA',
    notificationPreferences: {
      email: { newOpportunities: true, eventReminders: true },
      phone: { eventReminders: false },
    },
    impactStories: [],
  },
  {
    id: 'user2',
    name: 'Bob The Builder',
    email: 'bob@example.com',
    phone: '',
    interests: [OpportunityCategory.COMMUNITY, OpportunityCategory.EDUCATION],
    availability: 'Weekday evenings',
    savedOpportunityIds: [],
    location: 'New York, NY',
    notificationPreferences: {
      email: { newOpportunities: true, eventReminders: false },
      phone: { eventReminders: false },
    },
    impactStories: [],
  },
];

export const MOCK_LOGGED_HOURS: LoggedHour[] = [
  {
    id: 'log1',
    userId: 'user1',
    opportunityId: 'opp1',
    opportunityTitle: 'Tree Planting Day',
    organizationName: 'Green Earth Initiative',
    date: '2024-09-15',
    hours: 4,
    notes: 'Planted 10 saplings. Great team!',
    status: 'Self-Certified',
    category: OpportunityCategory.ENVIRONMENT,
    loggedAt: '2024-09-15T14:00:00Z'
  },
  {
    id: 'log2',
    userId: 'user1',
    opportunityId: 'opp4',
    opportunityTitle: 'Weekend Dog Walker',
    organizationName: 'Animal Friends Shelter',
    date: '2024-09-21',
    hours: 3,
    notes: 'Walked three lovely dogs. So rewarding.',
    status: 'Self-Certified',
    category: OpportunityCategory.ANIMALS,
    loggedAt: '2024-09-21T13:00:00Z'
  },
  {
    id: 'log3',
    userId: 'user2',
    opportunityId: 'opp2',
    opportunityTitle: 'Food Pantry Sorter',
    organizationName: 'Community Food Bank',
    date: '2024-09-18',
    hours: 2.5,
    status: 'Approved',
    category: OpportunityCategory.HOMELESSNESS,
    loggedAt: '2024-09-18T17:00:00Z'
  },
  {
    id: 'log4',
    userId: 'user1',
    opportunityId: 'opp2',
    opportunityTitle: 'Food Pantry Sorter',
    organizationName: 'Community Food Bank',
    date: '2024-09-25',
    hours: 3,
    status: 'Approved',
    category: OpportunityCategory.HOMELESSNESS,
    loggedAt: '2024-09-25T17:00:00Z'
  }
];

export const MOCK_IMPACT_STORIES: ImpactStory[] = [
  {
    id: 'story1',
    userId: 'user1',
    userName: 'Alice W.',
    opportunityTitle: 'Tree Planting Day',
    story: 'It was an amazing experience contributing to our local park. Seeing everyone work together for a greener future was truly inspiring. I even made some new friends!',
    imageUrl: 'https://picsum.photos/seed/story1/400/300',
    submittedAt: '2024-09-16T10:00:00Z'
  },
  {
    id: 'story2',
    userId: 'user2',
    userName: 'Bob B.',
    opportunityTitle: 'Food Pantry Sorter',
    story: 'Volunteering at the food bank opened my eyes to the needs in our community. Every box sorted makes a difference. It felt great to be part of the solution.',
    submittedAt: '2024-09-19T14:30:00Z'
  }
];