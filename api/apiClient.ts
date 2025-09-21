
import { UserProfile, LoggedHour, ImpactStory, NotificationPreferences, OpportunityCategory } from '../types';
import { MOCK_USERS, MOCK_LOGGED_HOURS } from '../data/mockData';
import { DEFAULT_USER_PROFILE_INTERESTS, MOCK_API_DELAY } from '../constants';

// --- DATABASE SIMULATION ---
// In a real app, this data would be in a database. Here, we use localStorage
// to persist data across browser sessions.

const initializeLocalStorage = () => {
    if (!localStorage.getItem('voluntrack_users')) {
        localStorage.setItem('voluntrack_users', JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem('voluntrack_loggedHours')) {
        localStorage.setItem('voluntrack_loggedHours', JSON.stringify(MOCK_LOGGED_HOURS));
    }
};

initializeLocalStorage();

const getUsersFromStorage = (): UserProfile[] => JSON.parse(localStorage.getItem('voluntrack_users') || '[]');
const getLoggedHoursFromStorage = (): LoggedHour[] => JSON.parse(localStorage.getItem('voluntrack_loggedHours') || '[]');
const saveUsersToStorage = (users: UserProfile[]) => localStorage.setItem('voluntrack_users', JSON.stringify(users));
const saveLoggedHoursToStorage = (hours: LoggedHour[]) => localStorage.setItem('voluntrack_loggedHours', JSON.stringify(hours));

// --- API CLIENT ---
// These functions simulate making network requests to a backend server.

const simulateNetworkRequest = <T>(data: T, delay: number = MOCK_API_DELAY): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

const simulateFailingRequest = (message: string, delay: number = MOCK_API_DELAY): Promise<never> => {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
}

// --- Auth Endpoints ---

export const apiLogin = async (email: string, pass: string): Promise<UserProfile> => {
    const users = getUsersFromStorage();
    const user = users.find(u => u.email === email); // In a real app, we'd check the password hash
    
    if (user) {
        return simulateNetworkRequest(user);
    } else {
        return simulateFailingRequest('Invalid email or password.');
    }
};

export const apiSignup = async (name: string, email: string, pass: string, phone?: string): Promise<UserProfile> => {
    let users = getUsersFromStorage();
    if (users.some(u => u.email === email)) {
        return simulateFailingRequest('An account with this email already exists.');
    }

    const defaultNotificationPrefs: NotificationPreferences = {
        email: { newOpportunities: true, eventReminders: true },
        phone: { eventReminders: !!phone }
    };

    const newUser: UserProfile = {
        id: `user${Date.now()}`,
        name,
        email,
        phone: phone || '',
        interests: DEFAULT_USER_PROFILE_INTERESTS,
        savedOpportunityIds: [],
        location: '',
        notificationPreferences: defaultNotificationPrefs,
        impactStories: [],
    };

    users.push(newUser);
    saveUsersToStorage(users);
    return simulateNetworkRequest(newUser);
};

export const apiUpdateProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return simulateFailingRequest('User not found.');
    }

    // Important: Do not overwrite existing arrays if not provided in profileData
    const currentUser = users[userIndex];
    const updatedUser = {
        ...currentUser,
        ...profileData,
        savedOpportunityIds: profileData.savedOpportunityIds || currentUser.savedOpportunityIds,
        impactStories: profileData.impactStories || currentUser.impactStories,
    };
    
    users[userIndex] = updatedUser;
    saveUsersToStorage(users);
    return simulateNetworkRequest(updatedUser);
};

// --- Logged Hours Endpoints ---

export const apiGetUserLoggedHours = async (userId: string): Promise<LoggedHour[]> => {
    const allHours = getLoggedHoursFromStorage();
    const userHours = allHours.filter(h => h.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return simulateNetworkRequest(userHours, MOCK_API_DELAY / 2); // Faster load for user data
};

export const apiGetAllLoggedHours = async (): Promise<LoggedHour[]> => {
    const allHours = getLoggedHoursFromStorage().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return simulateNetworkRequest(allHours);
}

export const apiAddLoggedHour = async (userId: string, hourLogData: Omit<LoggedHour, 'id' | 'userId' | 'status' | 'loggedAt'>): Promise<LoggedHour> => {
    const newLog: LoggedHour = {
        ...hourLogData,
        id: `log${Date.now()}`,
        userId: userId,
        status: 'Self-Certified',
        loggedAt: new Date().toISOString(),
    };
    
    let allHours = getLoggedHoursFromStorage();
    allHours.push(newLog);
    saveLoggedHoursToStorage(allHours);
    return simulateNetworkRequest(newLog);
};
