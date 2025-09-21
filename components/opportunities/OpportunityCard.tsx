
import React from 'react';
import { Link } from 'react-router-dom';
import { Opportunity, OpportunityCategory } from '../../types';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { useAuth } from '../auth/AuthContext';

interface OpportunityCardProps {
  opportunity: Opportunity;
  showUnsaveButton?: boolean;
  onUnsave?: (opportunityId: string) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, showUnsaveButton = false, onUnsave }) => {
  const { user, saveOpportunity, unsaveOpportunity: authUnsave, isOpportunitySaved } = useAuth();
  const isSaved = isOpportunitySaved(opportunity.id);

  const categoryColorMapping: Record<OpportunityCategory, 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray'> = {
    [OpportunityCategory.ANIMALS]: 'green',
    [OpportunityCategory.ARTS_CULTURE]: 'purple',
    [OpportunityCategory.CHILDREN]: 'yellow',
    [OpportunityCategory.COMMUNITY]: 'indigo',
    [OpportunityCategory.EDUCATION]: 'blue',
    [OpportunityCategory.ENVIRONMENT]: 'green',
    [OpportunityCategory.HEALTH]: 'red',
    [OpportunityCategory.HOMELESSNESS]: 'gray',
    [OpportunityCategory.SENIORS]: 'yellow',
    [OpportunityCategory.TECHNOLOGY]: 'blue',
    [OpportunityCategory.CAREGIVING]: 'red',
    [OpportunityCategory.LEADERSHIP]: 'purple',
    [OpportunityCategory.EVENTS]: 'indigo',
    [OpportunityCategory.OTHER]: 'gray',
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) {
        alert("Please log in to save opportunities.");
        return;
    }
    if (isSaved) {
        authUnsave(opportunity.id);
        if (showUnsaveButton && onUnsave) { 
            onUnsave(opportunity.id);
        }
    } else {
        saveOpportunity(opportunity.id);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <Badge color={categoryColorMapping[opportunity.category] || 'gray'}>{opportunity.category}</Badge>
            {user && !showUnsaveButton && (
                 <Button 
                    size="sm" 
                    variant={isSaved ? "accent" : "outline"} 
                    onClick={handleSaveToggle}
                    className="ml-auto"
                 >
                    {isSaved ? 'Unsave' : 'Save'}
                 </Button>
            )}
            {showUnsaveButton && onUnsave && (
                <Button 
                    size="sm" 
                    variant="accent"
                    onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        onUnsave(opportunity.id);
                    }}
                    className="ml-auto"
                >
                    Unsave
                </Button>
            )}
        </div>
        <Link to={`/opportunities/${opportunity.id}`} className="block">
          <h3 className="text-xl font-semibold text-primary mb-2 hover:underline">{opportunity.title}</h3>
        </Link>
        <p className="text-sm text-gray-600 mb-1">By: {opportunity.organization.name}</p>
        <p className="text-sm text-gray-600 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {opportunity.location}
        </p>
        <p className="text-sm text-gray-600 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {opportunity.dates}
        </p>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow whitespace-pre-line">{opportunity.description}</p>
        
        {opportunity.groundingSources && opportunity.groundingSources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 mb-1">Sources (from AI Search):</h4>
            <ul className="list-disc list-inside space-y-0.5">
              {opportunity.groundingSources.slice(0, 2).map((source, index) => ( // Show max 2 sources on card
                <li key={index} className="text-xs text-gray-500 truncate">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline" title={source.uri}>
                    {source.title || new URL(source.uri).hostname}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-200">
          <Link to={`/opportunities/${opportunity.id}`} className="text-primary hover:text-blue-700 font-medium text-sm">
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
