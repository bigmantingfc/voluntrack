
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { LoggedHour, OpportunityCategory } from '../types';
import { useAuth } from '../components/auth/AuthContext';
import { apiGetUserLoggedHours, apiGetAllLoggedHours, apiAddLoggedHour } from '../api/apiClient';

interface LoggedHoursContextType {
  loggedHours: LoggedHour[]; // All hours for collective dashboard
  userLoggedHours: LoggedHour[]; // Current user's hours
  addLoggedHour: (hourLog: Omit<LoggedHour, 'id' | 'userId' | 'status' | 'loggedAt'>) => Promise<LoggedHour>;
  isLoading: boolean;
  error: string | null;
}

const LoggedHoursContext = createContext<LoggedHoursContextType | undefined>(undefined);

export const LoggedHoursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [allLoggedHours, setAllLoggedHours] = useState<LoggedHour[]>([]);
  const [userLoggedHours, setUserLoggedHours] = useState<LoggedHour[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch all hours for the collective dashboard. Runs once on mount.
  useEffect(() => {
    setIsLoading(true);
    apiGetAllLoggedHours()
      .then(hours => setAllLoggedHours(hours))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to fetch collective hours."))
      .finally(() => {
        // Loading is only truly false when user hours are also fetched (or not needed)
        if (!user) setIsLoading(false);
      });
  }, [user]); // Rerun if user logs out to reset loading state

  // Effect to fetch the current user's hours. Runs when user logs in or out.
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      apiGetUserLoggedHours(user.id)
        .then(hours => setUserLoggedHours(hours))
        .catch(e => {
          setError(e instanceof Error ? e.message : "Failed to fetch your hours.");
          setUserLoggedHours([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setUserLoggedHours([]);
      // If there's no user, the initial load is complete after fetching all hours
      if (allLoggedHours.length > 0) setIsLoading(false);
    }
  }, [user?.id, allLoggedHours]); // Depend on allLoggedHours to ensure it runs after collective fetch completes

  const addLoggedHour = async (hourLogData: Omit<LoggedHour, 'id' | 'userId' | 'status' | 'loggedAt'>): Promise<LoggedHour> => {
    if (!user) {
      throw new Error("User not logged in.");
    }
    
    setIsLoading(true);
    try {
      const newLog = await apiAddLoggedHour(user.id, hourLogData);
      
      // After adding, refetch both user and all hours to ensure data is in sync with our "database"
      const [updatedUserHours, updatedAllHours] = await Promise.all([
        apiGetUserLoggedHours(user.id),
        apiGetAllLoggedHours()
      ]);
      
      setUserLoggedHours(updatedUserHours);
      setAllLoggedHours(updatedAllHours);
      
      return newLog;
    } catch (e) {
      const err = e instanceof Error ? e.message : "Failed to log hours";
      setError(err);
      throw new Error(err); // Re-throw for the form component to handle
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoggedHoursContext.Provider value={{ loggedHours: allLoggedHours, userLoggedHours, addLoggedHour, isLoading, error }}>
      {children}
    </LoggedHoursContext.Provider>
  );
};

export const useLoggedHours = (): LoggedHoursContextType => {
  const context = useContext(LoggedHoursContext);
  if (context === undefined) {
    throw new Error('useLoggedHours must be used within a LoggedHoursProvider');
  }
  return context;
};
