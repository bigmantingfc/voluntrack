
import React, { useMemo } from 'react';
import { useOpportunities } from '../../contexts/OpportunityContext';
import { Opportunity } from '../../types';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Link } from 'react-router-dom';
import Badge from '../shared/Badge';

/**
 * A best-effort function to parse a date from various string formats.
 * Returns null for common non-date strings like "Ongoing".
 */
const parseDate = (dateString: string): Date | null => {
  const lowerDateString = dateString.toLowerCase();
  if (['ongoing', 'flexible', 'varies', 'to be confirmed'].some(s => lowerDateString.includes(s))) {
    return null;
  }

  try {
    // Attempt to parse. This handles many formats but is not perfect.
    // For ranges like "June 10-12, 2024", it will likely parse the start date.
    const date = new Date(dateString.split('-')[0].split(',')[0].trim());
    if (!isNaN(date.getTime())) {
      // Basic validation: check if the parsed year is reasonable
      const year = date.getFullYear();
      if (year > 1990 && year < 2050) {
        return date;
      }
    }
  } catch (e) {
    return null;
  }

  return null;
};


const EventsPage: React.FC = () => {
  const { opportunities, isLoading } = useOpportunities();

  const events = useMemo(() => {
    return opportunities
      .map(op => ({
        ...op,
        parsedDate: parseDate(op.dates),
      }))
      .filter(op => op.parsedDate !== null && op.parsedDate >= new Date(new Date().setDate(new Date().getDate() - 1))) // Show events from today onwards
      .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());
  }, [opportunities]);

  const eventsByMonth = useMemo(() => {
    const grouped: { [key: string]: Opportunity[] } = {};
    events.forEach(event => {
      const monthYear = event.parsedDate!.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(event);
    });
    return grouped;
  }, [events]);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 animate-fade-in-down">Upcoming Volunteer Events</h1>
        <p className="text-dashboard-text-secondary text-lg sm:text-xl animate-fade-in-up animation-delay-200">
          Find date-specific opportunities to get involved in your community.
        </p>
      </div>

      {isLoading && opportunities.length === 0 ? (
        <LoadingSpinner message="Loading upcoming events..." />
      ) : Object.keys(eventsByMonth).length === 0 ? (
        <div className="text-center py-12 bg-dashboard-card shadow-xl rounded-xl animate-fade-in-up">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-dashboard-text-secondary mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-2xl text-dashboard-text-primary mb-3">No upcoming events found.</p>
            <p className="text-dashboard-text-secondary mb-8">
                Try a broader search on the main opportunities page, as some listings may not have specific dates.
            </p>
            <Link to="/opportunities" className="text-primary hover:underline font-semibold">
                Explore All Opportunities &rarr;
            </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(eventsByMonth).map(([monthYear, monthEvents], index) => (
            <div key={monthYear} className="animate-fade-in-up" style={{animationDelay: `${index * 150}ms`}}>
              <h2 className="text-3xl font-bold text-secondary mb-6 pb-2 border-b-2 border-secondary/20">{monthYear}</h2>
              <ul className="space-y-6">
                {monthEvents.map(event => (
                  <li key={event.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out border-l-4 border-primary">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex-grow">
                            <p className="text-sm font-semibold text-primary mb-1">{event.dates}</p>
                            <Link to={`/opportunities/${event.id}`}>
                                <h3 className="font-bold text-xl text-primary hover:underline mb-1">{event.title}</h3>
                            </Link>
                            <p className="text-sm text-dashboard-text-secondary mb-2">
                                <span className="font-medium">{event.organization.name}</span> at {event.location}
                            </p>
                             <div className="flex flex-wrap gap-2">
                                <Badge color="green">{event.category}</Badge>
                                <Badge color="blue">{event.timeCommitment}</Badge>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <Link to={`/opportunities/${event.id}`}>
                                <button className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors w-full sm:w-auto">
                                    View Details
                                </button>
                            </Link>
                        </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
