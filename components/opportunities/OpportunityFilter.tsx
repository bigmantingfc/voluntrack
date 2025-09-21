

import React from 'react';
import { OpportunityCategory, TimeCommitment, Organization } from '../../types';
import { ALL_OPPORTUNITY_CATEGORIES, ALL_TIME_COMMITMENTS } from '../../constants';

export interface Filters {
  searchTerm: string;
  category: OpportunityCategory | '';
  timeCommitment: TimeCommitment | '';
  organizationId: string | '';
  dateRange: string;
  location: string;
  skills: string;
  age: string;
}

interface OpportunityFilterProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  organizations: Organization[];
  onResetFilters: () => void;
  onApplyFilters: () => void;
}

const OpportunityFilter: React.FC<OpportunityFilterProps> = ({ filters, onFilterChange, organizations, onResetFilters, onApplyFilters }) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange(e.target.name as keyof Filters, e.target.value as any);
  };

  const handleApply = () => {
    onApplyFilters();
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter Opportunities (AI Powered Search)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Your Location</label>
          <input
            type="text"
            name="location"
            id="location"
            value={filters.location}
            onChange={handleInputChange}
            placeholder="Anytown, USA"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900"
          />
        </div>
        
        {/* Search Term */}
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">Keywords</label>
          <input
            type="text"
            name="searchTerm"
            id="searchTerm"
            value={filters.searchTerm}
            onChange={handleInputChange}
            placeholder="e.g., teaching, clean up"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Cause / Category</label>
          <select
            name="category"
            id="category"
            value={filters.category}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white text-gray-900"
          >
            <option value="">All Categories</option>
            {ALL_OPPORTUNITY_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Time Commitment */}
        <div>
          <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700">Time Commitment</label>
          <select
            name="timeCommitment"
            id="timeCommitment"
            value={filters.timeCommitment}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="">All Commitments</option>
            {ALL_TIME_COMMITMENTS.map(tc => (
              <option key={tc} value={tc}>{tc}</option>
            ))}
          </select>
        </div>
        
        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
          <input
            type="text"
            name="skills"
            id="skills"
            value={filters.skills}
            onChange={handleInputChange}
            placeholder="e.g., leadership, coding"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900"
          />
        </div>
        
        {/* Age Requirement */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age Requirement</label>
          <select
            name="age"
            id="age"
            value={filters.age}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="">Any</option>
            <option value="Family Friendly">Family Friendly</option>
            <option value="16+">16+</option>
            <option value="18+">18+</option>
            <option value="21+">21+</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleApply}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors"
        >
          Search with AI
        </button>
        <button 
          onClick={onResetFilters}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default OpportunityFilter;