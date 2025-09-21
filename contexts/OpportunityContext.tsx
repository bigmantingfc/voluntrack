

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Opportunity, Organization, OpportunityCategory, TimeCommitment, GeminiOpportunityItem } from '../types';
import { MOCK_OPPORTUNITIES, MOCK_ORGANIZATIONS } from '../data/mockData';
// Fix: Corrected typo from ALL_OPPORTUNTITY_CATEGORIES to ALL_OPPORTUNITY_CATEGORIES
import { MOCK_API_DELAY, ALL_OPPORTUNITY_CATEGORIES } from '../constants';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, GenerateContentResponse } from '@google/genai';
import { Filters } from '../components/opportunities/OpportunityFilter'; // Assuming Filters is exported

// --- Configuration Flag ---
// Set to true to attempt fetching from Gemini.
// Set to false to use mock data directly.
const ENABLE_GEMINI_FETCH = true;
// --------------------------

interface OpportunityContextType {
  opportunities: Opportunity[];
  organizations: Organization[];
  getOpportunityById: (id: string) => Opportunity | undefined;
  getOrganizationById: (id: string) => Organization | undefined;
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'organization' | 'publishedDate' | 'groundingSources' | 'imageUrl'>) => Promise<Opportunity>;
  isLoading: boolean;
  error: string | null;
  fetchOpportunities: (currentFilters: Filters) => void; // Expose fetch function
}

const OpportunityContext = createContext<OpportunityContextType | undefined>(undefined);

// Helper to slugify organization names for ID
const slugify = (text: string): string => {
  if (!text) return `org-${Date.now()}`;
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const mapGeminiCategoryToEnum = (geminiCategory: string): OpportunityCategory => {
  const lowerCategory = geminiCategory.toLowerCase();
  for (const enumKey in OpportunityCategory) {
    const enumValue = OpportunityCategory[enumKey as keyof typeof OpportunityCategory];
    if (lowerCategory.includes(enumValue.toLowerCase()) || enumValue.toLowerCase().includes(lowerCategory)) {
      return enumValue;
    }
  }
  // More specific mappings
  if (lowerCategory.includes('animal')) return OpportunityCategory.ANIMALS;
  if (lowerCategory.includes('art') || lowerCategory.includes('culture') || lowerCategory.includes('museum')) return OpportunityCategory.ARTS_CULTURE;
  if (lowerCategory.includes('child') || lowerCategory.includes('youth') || lowerCategory.includes('mentor')) return OpportunityCategory.CHILDREN;
  if (lowerCategory.includes('community') || lowerCategory.includes('civic')) return OpportunityCategory.COMMUNITY;
  if (lowerCategory.includes('education') || lowerCategory.includes('tutor') || lowerCategory.includes('school')) return OpportunityCategory.EDUCATION;
  if (lowerCategory.includes('environment') || lowerCategory.includes('nature') || lowerCategory.includes('park') || lowerCategory.includes('conservation')) return OpportunityCategory.ENVIRONMENT;
  if (lowerCategory.includes('health') || lowerCategory.includes('medical') || lowerCategory.includes('hospital') || lowerCategory.includes('wellness')) return OpportunityCategory.HEALTH;
  if (lowerCategory.includes('homeless') || lowerCategory.includes('housing') || lowerCategory.includes('food bank') || lowerCategory.includes('hunger')) return OpportunityCategory.HOMELESSNESS;
  if (lowerCategory.includes('senior') || lowerCategory.includes('elderly')) return OpportunityCategory.SENIORS;
  if (lowerCategory.includes('tech') || lowerCategory.includes('digital')) return OpportunityCategory.TECHNOLOGY;
  if (lowerCategory.includes('caregiving') || lowerCategory.includes('support')) return OpportunityCategory.CAREGIVING;
  if (lowerCategory.includes('board') || lowerCategory.includes('leader') || lowerCategory.includes('admin')) return OpportunityCategory.LEADERSHIP;
  if (lowerCategory.includes('event') || lowerCategory.includes('festival')) return OpportunityCategory.EVENTS;
  return OpportunityCategory.OTHER;
};

const mapGeminiTimeCommitmentToEnum = (geminiTimeCommitment: string): TimeCommitment => {
    if (!geminiTimeCommitment) return TimeCommitment.FLEXIBLE;
    const lowerTC = geminiTimeCommitment.toLowerCase();
    if (lowerTC.includes('less than 2') || lowerTC.includes('1-2 hour')) return TimeCommitment.LESS_THAN_2_HOURS;
    if (lowerTC.includes('2-4 hour') || lowerTC.includes('3-4 hour')) return TimeCommitment.TWO_TO_FOUR_HOURS;
    if (lowerTC.includes('full day') || lowerTC.includes('all day')) return TimeCommitment.FULL_DAY;
    if (lowerTC.includes('weekly')) return TimeCommitment.ONGOING_WEEKLY;
    if (lowerTC.includes('monthly')) return TimeCommitment.ONGOING_MONTHLY;
    if (lowerTC.includes('one-time') || lowerTC.includes('single event')) return TimeCommitment.ONE_TIME_EVENT;
    return TimeCommitment.FLEXIBLE;
};


const mapGeminiResultToOpportunity = (
    item: GeminiOpportunityItem,
    orgMap: Map<string, Organization>
  ): { opportunity: Opportunity, organization: Organization } => {
  
  const orgId = slugify(item.organizationName);
  let organization = orgMap.get(orgId);
  if (!organization) {
    organization = {
      id: orgId,
      name: item.organizationName,
      website: undefined, // It's safer to omit this than to guess. The Google search will lead the user to the site.
    };
  }

  const applicationSearchLink = item.searchQuery
    ? `https://www.google.com/search?q=${encodeURIComponent(item.searchQuery)}`
    : ''; // Fallback, though query should be mandatory.

  const category = mapGeminiCategoryToEnum(item.category || 'Other');

  const opportunity: Opportunity = {
    id: item.id || `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.title,
    organizationId: organization.id,
    organization: organization,
    description: item.description || 'No description provided by AI.',
    dates: item.dates || 'Varies',
    location: item.location || 'To be confirmed',
    skillsRequired: item.skillsRequired || [],
    ageRequirement: item.ageRequirement || 'Not specified',
    category: category,
    timeCommitment: mapGeminiTimeCommitmentToEnum(item.timeCommitment || 'Flexible'),
    applicationLink: applicationSearchLink,
    publishedDate: new Date().toISOString(),
    remoteOrOnline: item.remoteOrOnline || false,
    groundingSources: undefined, // Grounding is disabled in the browser to prevent CORS errors
  };
  return { opportunity, organization };
};

export const OpportunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async (currentFilters: Filters) => {
    if (ENABLE_GEMINI_FETCH) {
      setIsLoading(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const categoriesString = ALL_OPPORTUNITY_CATEGORIES.join(', ');
        const locationQuery = currentFilters.location ? `in or near ${currentFilters.location}` : 'in my local area';
        const interestsQuery = currentFilters.searchTerm ? `related to ${currentFilters.searchTerm}` : '';
        const categoryFilterQuery = currentFilters.category ? `specifically for the category: ${currentFilters.category}` : '';
        const timeCommitmentQuery = currentFilters.timeCommitment ? `with a time commitment of '${currentFilters.timeCommitment}'` : '';
        const skillsQuery = currentFilters.skills ? `requiring skills like ${currentFilters.skills}` : '';
        const ageQuery = currentFilters.age ? `with age requirements suitable for '${currentFilters.age}'` : '';
        const currentYear = new Date().getFullYear();

        const prompt = `You are an AI assistant for a student volunteer app. We have a critical problem: previous attempts to provide direct URLs resulted in too many 404 broken links, destroying user trust. We are implementing a new, 100% reliable strategy.

**Your New, Critical Task:** You must generate a list of high-quality, realistic-sounding volunteer opportunities. Although you do not have live access to the web, you must act as if you are finding real opportunities. For each one, you must provide a **perfectly crafted Google Search Query**. This query must be so specific that if a real opportunity like the one you describe existed, this query would be the best way to find it on Google.

This approach ensures the user can take the search query you provide and find similar, real-world opportunities on their own, guaranteeing they never see a broken link from our app. The quality and precision of your search query is the most important measure of your performance.

Find 10-15 volunteer opportunities ${locationQuery} ${interestsQuery} ${categoryFilterQuery} ${timeCommitmentQuery} ${skillsQuery} ${ageQuery}.

**Search Query Requirements (MANDATORY):**
1.  **Use the \`site:\` operator whenever plausible.** If you know the typical website for a large organization (e.g., \`redcross.org\`), construct a query like \`site:redcross.org disaster volunteer\`. This is a highly effective search pattern.
2.  **Be Specific.** The query must be for the *specific opportunity*, not just the organization. Include keywords from the opportunity title.
3.  **Include the Current Year.** Add the current year (${currentYear}) to your query to make the search more relevant for the user.

It is 1000 times better to return 3 opportunities with perfect search queries than 10 with mediocre ones.

**JSON OUTPUT FORMAT:**

Provide the information as a JSON object. The entire response must be ONLY a single, well-formed JSON array of opportunity objects. Do not include any text, explanations, or markdown fences like \`\`\`json around the output.

- "id": a unique string identifier you generate (e.g., "gemini-opp-123")
- "title": string (The opportunity title.)
- "organizationName": string (name of the organization)
- "description": string (a brief description, 1-3 sentences)
- "location": string (specific address or city/area)
- "dates": string (e.g., "Ongoing", "Every Saturday 9am-12pm", "October 26, ${currentYear}")
- "searchQuery": string (**CRITICAL**: The perfectly crafted Google search query. This field replaces the old 'url' field and is mandatory.)
- "category": string (choose the most fitting category from: ${categoriesString}. If unsure, use a general term from the list or "Other".)
- "timeCommitment": string (e.g., "2-4 hours/week", "One-time event", "Flexible", "Full-day")
- "remoteOrOnline": boolean (true if the opportunity can be done remotely or online, false otherwise)
- "skillsRequired": string[] (a list of 1-3 key skills needed, e.g., ["Gardening", "Public Speaking"], or an empty array [])
- "ageRequirement": string (e.g., "16+ with parental consent", "18 and over", "All ages welcome", "Family Friendly")

Example:
\`\`\`json
[
  {
    "id": "gemini-opp-1",
    "title": "Disaster Action Team Volunteer",
    "organizationName": "American Red Cross",
    "description": "Provide immediate support to families affected by home fires and other local disasters.",
    "location": "Local Chapter Office, Anytown",
    "dates": "Flexible, on-call shifts",
    "searchQuery": "site:redcross.org volunteer disaster action team ${currentYear}",
    "category": "Community Development",
    "timeCommitment": "Flexible",
    "remoteOrOnline": false,
    "skillsRequired": ["Communication", "Empathy"],
    "ageRequirement": "18 and over"
  }
]
\`\`\`
Your entire reputation depends on the quality of these search queries. Do not fail this task. Your response must be ONLY the JSON array.`;
        
        const genAIResponse: GenerateContentResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        let jsonString = genAIResponse.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonString.match(fenceRegex);
        if (match && match[2]) {
          jsonString = match[2].trim();
        }
        
        let geminiResults: GeminiOpportunityItem[] = [];
        try {
          geminiResults = JSON.parse(jsonString);
          if (!Array.isArray(geminiResults)) {
            console.warn("Gemini response was not a JSON array, attempting to find array within object:", geminiResults);
            // Attempt to find an array if Gemini wrapped it in an object
            if (typeof geminiResults === 'object' && geminiResults !== null) {
              const arrayKey = Object.keys(geminiResults).find(key => Array.isArray((geminiResults as any)[key]));
              if (arrayKey) geminiResults = (geminiResults as any)[arrayKey];
              else throw new Error("Parsed JSON from Gemini is not an array and no array found within object.");
            } else {
               throw new Error("Parsed JSON from Gemini is not an array.");
            }
          }
        } catch (parseError) {
          console.error("Failed to parse JSON from Gemini:", parseError, "Raw response:", genAIResponse.text);
          throw new Error(`Failed to parse JSON response from AI. Raw text: ${genAIResponse.text.substring(0,100)}...`);
        }
        
        const orgMap = new Map<string, Organization>();
        MOCK_ORGANIZATIONS.forEach(org => orgMap.set(org.id, {...org}));

        const mappedOpportunities = geminiResults.map(item => {
          const { opportunity, organization } = mapGeminiResultToOpportunity(item, orgMap);
          if (!orgMap.has(organization.id)) {
            orgMap.set(organization.id, organization);
          }
          return opportunity;
        });

        setOpportunities(mappedOpportunities);
        setOrganizations(Array.from(orgMap.values()));

      } catch (e) {
        const errMessage = e instanceof Error ? e.message : 'Unknown error fetching opportunities via AI';
        console.error("Failed to fetch opportunities from Gemini:", errMessage, e);
        setError(e instanceof Error ? errMessage : JSON.stringify(e)); // Display the error message for debugging
        setOpportunities(MOCK_OPPORTUNITIES.map(op => ({
          ...op,
          organization: MOCK_ORGANIZATIONS.find(org => org.id === op.organizationId) || MOCK_ORGANIZATIONS[0],
        })).sort((a,b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()));
        setOrganizations([...MOCK_ORGANIZATIONS]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Gemini fetch is disabled, load mock data
      setIsLoading(true);
      setError(null);
      console.info("Gemini AI fetch is disabled. Loading mock data.");
      setTimeout(() => {
        setOpportunities(MOCK_OPPORTUNITIES.map(op => ({
          ...op,
          organization: MOCK_ORGANIZATIONS.find(org => org.id === op.organizationId) || MOCK_ORGANIZATIONS[0],
        })).sort((a,b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()));
        setOrganizations([...MOCK_ORGANIZATIONS]);
        setIsLoading(false);
        setError("AI search is currently disabled. Displaying sample data.");
      }, MOCK_API_DELAY / 2);
    }
  }, []); // useCallback dependencies will be managed by useEffect calling this

  useEffect(() => {
    // Initial fetch with default filters (empty)
    fetchOpportunities({searchTerm: '', category: '', timeCommitment: '', organizationId: '', dateRange: 'any', location: '', skills: '', age: ''});
  }, [fetchOpportunities]);


  const getOpportunityById = useCallback((id: string): Opportunity | undefined => {
    return opportunities.find(op => op.id === id);
  }, [opportunities]);

  const getOrganizationById = useCallback((id: string): Organization | undefined => {
    return organizations.find(org => org.id === id);
  }, [organizations]);

  const addOpportunity = useCallback(async (opportunityData: Omit<Opportunity, 'id' | 'organization' | 'publishedDate' | 'groundingSources' | 'imageUrl'>): Promise<Opportunity> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let organization = organizations.find(o => o.id === opportunityData.organizationId);
          if (!organization) {
             // If organizationId was a name, create a new org object
             const orgIdFromName = slugify(opportunityData.organizationId);
             organization = { id: orgIdFromName, name: opportunityData.organizationId };
             if (!organizations.find(o => o.id === orgIdFromName)) {
                 setOrganizations(prevOrgs => [...prevOrgs, organization!]);
             }
          }
          
          const newOpportunity: Opportunity = {
            ...opportunityData,
            id: `opp${Date.now()}`,
            organization: organization!,
            publishedDate: new Date().toISOString(),
          };
          setOpportunities(prev => [newOpportunity, ...prev].sort((a,b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()));
          setIsLoading(false);
          resolve(newOpportunity);
        } catch (e) {
          const err = e instanceof Error ? e.message : "Failed to add opportunity";
          setError(err);
          setIsLoading(false);
          reject(new Error(err));
        }
      }, MOCK_API_DELAY);
    });
  }, [organizations]);


  return (
    <OpportunityContext.Provider value={{ opportunities, organizations, getOpportunityById, getOrganizationById, addOpportunity, isLoading, error, fetchOpportunities }}>
      {children}
    </OpportunityContext.Provider>
  );
};

export const useOpportunities = (): OpportunityContextType => {
  const context = useContext(OpportunityContext);
  if (context === undefined) {
    throw new Error('useOpportunities must be used within an OpportunityProvider');
  }
  return context;
};
