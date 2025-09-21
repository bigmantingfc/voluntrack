
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { UserProfile, OpportunityCategory, NotificationPreferences, ImpactStory } from '../../types';
import { apiLogin, apiSignup, apiUpdateProfile } from '../../api/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  signup: (name: string, email: string, pass: string, phone?: string) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
  saveOpportunity: (opportunityId: string) => Promise<void>;
  unsaveOpportunity: (opportunityId: string) => Promise<void>;
  isOpportunitySaved: (opportunityId: string) => boolean;
  addImpactStory: (story: ImpactStory) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for a logged-in user session on initial app load.
  useEffect(() => {
    setIsLoading(true);
    // In a real app, this might be a 'get current user' endpoint using a token.
    // We use localStorage to persist the session info on the client.
    const storedUser = localStorage.getItem('voluntrack_currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('voluntrack_currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const updateUserStateAndStorage = (userData: UserProfile | null) => {
    if (userData) {
      // Sanitize data before setting state to prevent runtime errors
      const userToSet: UserProfile = {
        ...userData,
        savedOpportunityIds: userData.savedOpportunityIds || [],
        impactStories: userData.impactStories || [],
      };
      setUser(userToSet);
      localStorage.setItem('voluntrack_currentUser', JSON.stringify(userToSet));
    } else {
      setUser(null);
      localStorage.removeItem('voluntrack_currentUser');
    }
  };

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const loggedInUser = await apiLogin(email, pass);
      updateUserStateAndStorage(loggedInUser);
      return loggedInUser;
    } catch (error) {
      updateUserStateAndStorage(null); // Ensure user is logged out on failure
      throw error; // Re-throw for the UI component to handle
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string, phone?: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const newUser = await apiSignup(name, email, pass, phone);
      updateUserStateAndStorage(newUser);
      return newUser;
    } catch (error) {
      updateUserStateAndStorage(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    updateUserStateAndStorage(null);
  };

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error("No user is logged in.");
    setIsLoading(true);
    try {
      const updatedUser = await apiUpdateProfile(user.id, profileData);
      updateUserStateAndStorage(updatedUser);
      return updatedUser;
    } catch(error) {
        console.error("Profile update failed:", error);
        throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveOpportunity = async (opportunityId: string): Promise<void> => {
    if (!user || (user.savedOpportunityIds && user.savedOpportunityIds.includes(opportunityId))) return;
    const savedOpportunityIds = [...(user.savedOpportunityIds || []), opportunityId];
    await updateProfile({ savedOpportunityIds });
  };

  const unsaveOpportunity = async (opportunityId: string): Promise<void> => {
    if (!user || !user.savedOpportunityIds) return;
    const savedOpportunityIds = user.savedOpportunityIds.filter(id => id !== opportunityId);
    await updateProfile({ savedOpportunityIds });
  };
  
  const isOpportunitySaved = (opportunityId: string): boolean => {
    return !!user?.savedOpportunityIds?.includes(opportunityId);
  };

  const addImpactStory = async (story: ImpactStory): Promise<void> => {
    if (!user) return;
    const impactStories = [story, ...(user.impactStories || [])];
    await updateProfile({ impactStories });
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile, saveOpportunity, unsaveOpportunity, isOpportunitySaved, addImpactStory }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
