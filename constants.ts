
import { OpportunityCategory, TimeCommitment } from './types';

export const APP_NAME = "VolunTrack";

export const ALL_OPPORTUNITY_CATEGORIES: OpportunityCategory[] = Object.values(OpportunityCategory);
export const ALL_TIME_COMMITMENTS: TimeCommitment[] = Object.values(TimeCommitment);

export const DEFAULT_USER_PROFILE_INTERESTS: OpportunityCategory[] = [
  OpportunityCategory.COMMUNITY,
  OpportunityCategory.ENVIRONMENT,
];

export const MOCK_API_DELAY = 500; // ms for simulating network latency

export const ITEMS_PER_PAGE = 9;

export const MIN_PASSWORD_LENGTH = 8;
