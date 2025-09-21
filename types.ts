

export enum OpportunityCategory {
  ENVIRONMENT = "Environment",
  EDUCATION = "Education",
  HEALTH = "Health",
  COMMUNITY = "Community Development",
  ANIMALS = "Animal Welfare",
  SENIORS = "Seniors",
  CHILDREN = "Children",
  ARTS_CULTURE = "Arts & Culture",
  HOMELESSNESS = "Homelessness",
  TECHNOLOGY = "Technology", 
  CAREGIVING = "Caregiving", 
  LEADERSHIP = "Organizational Leadership", 
  EVENTS = "PR, Fundraising, Events", 
  OTHER = "Other"
}

export enum TimeCommitment {
  LESS_THAN_2_HOURS = "Less than 2 hours",
  TWO_TO_FOUR_HOURS = "2-4 hours",
  FULL_DAY = "Full day",
  ONGOING_WEEKLY = "Ongoing weekly",
  ONGOING_MONTHLY = "Ongoing monthly", 
  ONE_TIME_EVENT = "One-time event",
  FLEXIBLE = "Flexible"
}

export interface Organization {
  id: string; // Slugified name
  name: string;
  contactEmail?: string; // Might not be available from Gemini
  website?: string; // Might be part of opportunity URL or separate
  description?: string; // Might not be available
  logo?: string; // Might not be available
}

export interface Opportunity {
  id: string; // Gemini-generated or derived
  title: string;
  organization: Organization; 
  organizationId: string; // ID of the organization object (slugified name)
  description: string;
  dates: string; 
  location: string;
  skillsRequired?: string[]; // From Gemini, or simple parsing
  ageRequirement?: string; // New field for age filters
  contactPerson?: string; // Less likely from Gemini general search
  contactEmail?: string; // Less likely from Gemini general search
  applicationLink?: string; // URL from Gemini
  category: OpportunityCategory;
  timeCommitment: TimeCommitment;
  imageUrl?: string; // Might try to find one or use a default
  publishedDate: string; // ISO date string (will be fetch date)
  remoteOrOnline?: boolean;
  groundingSources?: { // For Google Search grounding
    uri: string;
    title: string;
    textContent?: string; // Snippet from the source
  }[];
}

export interface NotificationPreferences {
  email: {
    newOpportunities: boolean;
    eventReminders: boolean;
  };
  phone: {
    eventReminders: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interests: OpportunityCategory[];
  availability?: string; 
  savedOpportunityIds: string[];
  location?: string;
  notificationPreferences?: NotificationPreferences;
  impactStories: ImpactStory[];
}

export interface LoggedHour {
  id: string;
  userId: string;
  opportunityId: string;
  opportunityTitle: string; 
  organizationName: string; 
  date: string; 
  hours: number;
  notes?: string;
  status: "Pending" | "Approved" | "Self-Certified";
  category: OpportunityCategory; 
  loggedAt: string; 
}

export interface ImpactStory {
  id: string;
  userId: string;
  userName: string;
  opportunityTitle: string;
  story: string;
  imageUrl?: string; 
  submittedAt: string; 
}

// Gemini specific result structure (example, will be defined by the prompt)
export interface GeminiOpportunityItem {
  id: string;
  title: string;
  organizationName: string;
  description: string;
  location: string;
  dates: string;
  searchQuery: string;
  category: string; // Gemini will provide a string, needs mapping
  timeCommitment: string; // Gemini will provide a string, needs mapping
  remoteOrOnline: boolean;
  skillsRequired: string[];
  ageRequirement: string;
}