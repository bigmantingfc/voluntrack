
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useOpportunities } from '../../contexts/OpportunityContext';
import OpportunityCard from './OpportunityCard';
import OpportunityFilter, { Filters } from './OpportunityFilter';
import LoadingSpinner from '../shared/LoadingSpinner';
import ProgressBar from '../shared/ProgressBar';
import { Opportunity, OpportunityCategory, TimeCommitment } from '../../types';
import Button from '../shared/Button';
import { ITEMS_PER_PAGE } from '../../constants';

const initialFilters: Filters = {
  searchTerm: '',
  category: '',
  timeCommitment: '',
  organizationId: '',
  dateRange: 'any',
  location: '',
  skills: '',
  age: '',
};

const OpportunityListPage: React.FC = () => {
  const { opportunities, organizations, isLoading, error, fetchOpportunities } = useOpportunities();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [showApiMessage, setShowApiMessage] = useState(true);

  // State for progress bar simulation
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("AI is preparing your search...");
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  const handleFilterChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Do not reset current page here, only on apply
  }, []);
  
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    fetchOpportunities(filters);
  }, [fetchOpportunities, filters]);

  const resetFiltersAndFetch = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
    fetchOpportunities(initialFilters); // Fetch with default/empty filters
  }, [fetchOpportunities]);
  
  // Effect for managing progress bar simulation
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isLoading) {
      setProgress(0);
      setIsIndeterminate(false);
      setProgressMessage("AI is preparing your search..."); // Start with an initial message
      let currentProgress = 0;
      
      // Slower interval for a more deliberate feel
      const interval = 450; 

      timer = setInterval(() => {
        // Only update if tab is visible to avoid background processing
        if (!document.hidden) {
            // Slower, more consistent progress increment
            currentProgress += Math.random() * 2 + 1;
        }

        // Updated dynamic messages with new thresholds
        if (currentProgress < 25) {
            setProgressMessage("Consulting global volunteering database...");
        } else if (currentProgress < 50) {
            setProgressMessage("AI is analyzing your location and preferences...");
        } else if (currentProgress < 75) {
            setProgressMessage("AI is filtering opportunities for you...");
        } else if (currentProgress < 90) {
            setProgressMessage("Sorting the best matches for you...");
        } else {
            setProgressMessage("Just a moment, finalizing the list...");
        }

        if (currentProgress >= 95) {
            setProgress(95);
            setIsIndeterminate(true);
            clearInterval(timer); // Stop incrementing and go indeterminate
        } else {
            setProgress(currentProgress);
        }

      }, interval);
    }

    return () => {
        if(timer) clearInterval(timer);
    };
  }, [isLoading]);
  
  const filteredOpportunities = useMemo(() => {
    // If AI provides good filtering, this client-side logic might be simplified or removed.
    // For now, it acts as a secondary filter on AI results.
    return opportunities.filter(op => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch = filters.searchTerm === '' ||
        op.title.toLowerCase().includes(searchTermLower) ||
        op.description.toLowerCase().includes(searchTermLower) ||
        op.organization.name.toLowerCase().includes(searchTermLower) ||
        op.location.toLowerCase().includes(searchTermLower);

      const matchesCategory = filters.category === '' || op.category === filters.category;
      // Additional filters like timeCommitment, organizationId might be less effective
      // if Gemini already incorporates them into its search.
      // const matchesTimeCommitment = filters.timeCommitment === '' || op.timeCommitment === filters.timeCommitment;
      // const matchesOrganization = filters.organizationId === '' || op.organizationId === filters.organizationId;
      
      return matchesSearch && matchesCategory; // Simplified client-side filter
    });
  }, [opportunities, filters]);

  const paginatedOpportunities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOpportunities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOpportunities, currentPage]);

  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE);

  useEffect(() => {
    // Automatically apply filters when the component mounts if needed, or rely on user action.
    // Initial fetch is now handled in OpportunityContext.
    // If filters change and user clicks "Search with AI", handleApplyFilters is called.
  }, []);


  if (isLoading && opportunities.length === 0) { 
    return (
      <div className="container mx-auto px-4 py-8 mt-16 flex flex-col justify-center items-center" style={{ minHeight: '60vh' }}>
        <ProgressBar 
          progress={progress} 
          message={progressMessage} 
          isIndeterminate={isIndeterminate} 
        />
      </div>
    );
  }

  const isAIDisabledMessage = error && error.includes("AI search is currently disabled");
  const bannerType = isAIDisabledMessage ? 'info' : (error ? 'error' : ''); // Add error type
  const bannerBgColor = isAIDisabledMessage ? 'bg-yellow-100 border-yellow-500 text-yellow-700' : (error ? 'bg-red-100 border-red-500 text-red-700' : '');
  const bannerIconColor = isAIDisabledMessage ? 'text-yellow-500' : (error ? 'text-red-500' : '');
  const bannerTitle = isAIDisabledMessage ? "Information" : (error ? "AI Search Error" : "");
  let bannerMessage = "";
  if (isAIDisabledMessage) {
    bannerMessage = "AI search is currently disabled. Displaying sample data for demonstration.";
  } else if (error) {
    const cleanError = error.replace(". Displaying mock data as fallback.", "");
    bannerMessage = `Could not fetch live opportunities via AI. Displaying sample data. Error: ${cleanError}`;
  }


  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-4xl font-bold text-center text-primary mb-4">Find Your Next Volunteer Opportunity</h1>
      <p className="text-center text-gray-600 mb-8 text-lg">
        Use AI to discover ways to make a difference in your community.
      </p>
      
      {bannerMessage && showApiMessage && (
        <div className={`${bannerBgColor} border-l-4 p-4 mb-6`} role="alert">
          <div className="flex">
            <div className="py-1">
              {isAIDisabledMessage ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`fill-current h-6 w-6 ${bannerIconColor} mr-4`}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              ) : error ? (
                <svg className={`fill-current h-6 w-6 ${bannerIconColor} mr-4`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11 14v-4h-2v4h2zm0-6V6h-2v2h2z"/></svg>
              ) : null}
            </div>
            <div>
              <p className="font-bold">{bannerTitle}</p>
              <p className="text-sm">{bannerMessage}</p>
              <button onClick={() => setShowApiMessage(false)} className={`text-xs ${isAIDisabledMessage ? 'text-yellow-600 hover:text-yellow-800' : (error ? 'text-red-600 hover:text-red-800' : '')} underline mt-1`}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
      
      <OpportunityFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        organizations={organizations} // Still pass for consistency, though less used by Gemini
        onResetFilters={resetFiltersAndFetch}
        onApplyFilters={handleApplyFilters}
      />

      {isLoading && (
        <div className="my-8">
          <ProgressBar
            progress={progress}
            message={progressMessage}
            isIndeterminate={isIndeterminate}
          />
        </div>
      )}

      {!isLoading && filteredOpportunities.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <p className="text-xl text-gray-600">No opportunities found matching your criteria.</p>
          <p className="text-gray-500 mt-2">Try adjusting your location or search terms for the AI.</p>
        </div>
      ) : !isLoading && paginatedOpportunities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {paginatedOpportunities.map(op => (
              <OpportunityCard key={op.id} opportunity={op} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-8">
              <Button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              { currentPage > 2 && <Button onClick={() => setCurrentPage(1)} variant="outline" size="sm">1</Button> }
              { currentPage > 3 && <span className="px-1 sm:px-2">...</span> }
              
              { Math.max(1, currentPage - 1) !== currentPage && currentPage > 1 &&
                <Button onClick={() => setCurrentPage(currentPage - 1)} variant="outline" size="sm">{currentPage - 1}</Button>
              }
              
              <Button variant="primary" size="sm" disabled>{currentPage}</Button>
              
              { Math.min(totalPages, currentPage + 1) !== currentPage && currentPage < totalPages &&
                <Button onClick={() => setCurrentPage(currentPage + 1)} variant="outline" size="sm">{currentPage + 1}</Button>
              }

              { currentPage < totalPages - 2 && <span className="px-1 sm:px-2">...</span> }
              { currentPage < totalPages -1 && <Button onClick={() => setCurrentPage(totalPages)} variant="outline" size="sm">{totalPages}</Button>}

              <Button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default OpportunityListPage;
