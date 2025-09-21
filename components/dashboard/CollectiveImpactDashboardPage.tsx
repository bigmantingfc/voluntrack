

import React, { useMemo, useState, useEffect } from 'react';
import { useLoggedHours } from '../../contexts/LoggedHoursContext';
import { useOpportunities } from '../../contexts/OpportunityContext';
import { LoggedHour, OpportunityCategory, Organization, ImpactStory } from '../../types';
import LoadingSpinner from '../shared/LoadingSpinner';
import ImpactChart from './ImpactChart';
import { MOCK_IMPACT_STORIES } from '../../data/mockData'; 
import Badge from '../shared/Badge';

// Simple SVG Icons for Stat Cards
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ListBulletIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
</svg>
);


const CollectiveImpactDashboardPage: React.FC = () => {
  const { loggedHours, isLoading: hoursLoading } = useLoggedHours();
  const { organizations, isLoading: orgsLoading } = useOpportunities(); // Not directly used, but an example if needed for org count
  const [impactStories, setImpactStories] = useState<ImpactStory[]>([]);

  useEffect(() => {
    setImpactStories(MOCK_IMPACT_STORIES);
  }, []);

  const totalCollectiveHours = useMemo(() => {
    return loggedHours.reduce((sum, log) => sum + log.hours, 0);
  }, [loggedHours]);

  const collectiveHoursByCategory = useMemo(() => {
    const categoryMap: { [key in OpportunityCategory]?: number } = {};
    loggedHours.forEach(log => {
      categoryMap[log.category] = (categoryMap[log.category] || 0) + log.hours;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name: name as OpportunityCategory, value: value || 0 }))
      .filter(item => item.value > 0) 
      .sort((a, b) => b.value - a.value);
  }, [loggedHours]);

  const hoursByOrganization = useMemo(() => {
    const orgMap: { [orgName: string]: number } = {};
    loggedHours.forEach(log => {
      orgMap[log.organizationName] = (orgMap[log.organizationName] || 0) + log.hours;
    });
    return Object.entries(orgMap)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); 
  }, [loggedHours]);
  
  const totalVolunteers = useMemo(() => {
    const uniqueUserIds = new Set(loggedHours.map(log => log.userId));
    return uniqueUserIds.size;
  }, [loggedHours]);

  const communityHourGoal = 10000;
  const progressToGoal = Math.min((totalCollectiveHours / communityHourGoal) * 100, 100);

  if ((hoursLoading || orgsLoading) && loggedHours.length === 0) { // Consider orgsLoading if it becomes a factor
    return <div className="container mx-auto px-4 py-8 mt-8 sm:mt-16"><LoadingSpinner message="Loading collective impact data..." /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-8 sm:mt-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 animate-fade-in-down">Our Community's Collective Impact</h1>
        <p className="text-dashboard-text-secondary text-lg sm:text-xl animate-fade-in-up animation-delay-200">
          Together, we're making a significant difference. See the power of our combined efforts!
        </p>
      </div>

      {/* Key Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-dashboard-card p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:animate-cardGlow animate-fade-in-up animation-delay-100">
            <div className="w-14 h-14 mb-4 rounded-full flex items-center justify-center text-white bg-primary"><ClockIcon /></div>
            <p className="text-5xl font-extrabold text-primary">{totalCollectiveHours.toFixed(1)}</p>
            <p className="text-dashboard-text-secondary mt-1 text-lg">Total Hours Contributed</p>
        </div>
        <div className="bg-dashboard-card p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:animate-cardGlow animate-fade-in-up animation-delay-200">
            <div className="w-14 h-14 mb-4 rounded-full flex items-center justify-center text-white bg-secondary"><UsersIcon /></div>
            <p className="text-5xl font-extrabold text-secondary">{totalVolunteers}</p>
            <p className="text-dashboard-text-secondary mt-1 text-lg">Active Volunteers</p>
        </div>
        <div className="bg-dashboard-card p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:animate-cardGlow animate-fade-in-up animation-delay-300">
            <div className="w-14 h-14 mb-4 rounded-full flex items-center justify-center text-white bg-dashboard-accent-purple"><ListBulletIcon /></div>
            <p className="text-5xl font-extrabold text-dashboard-accent-purple">{loggedHours.length}</p>
            <p className="text-dashboard-text-secondary mt-1 text-lg">Total Activities Logged</p>
        </div>
      </div>
      
      {/* Pledge for Progress */}
      <div className="bg-gradient-to-br from-dashboard-accent-purple to-dashboard-accent-teal text-white p-6 sm:p-8 rounded-xl shadow-lg mb-12 animate-fade-in-up animation-delay-400">
          <h2 className="text-2xl font-bold text-center mb-4">Pledge for Progress!</h2>
          <p className="text-center text-lg max-w-3xl mx-auto">
              When our community reaches the goal of <strong className="font-semibold">{communityHourGoal.toLocaleString()} hours</strong>, our sponsor, <strong className="font-semibold">Impact Inc.</strong>, will donate <strong className="font-semibold">$1,000</strong> to the <strong className="font-semibold">Community Food Bank</strong> to amplify our collective efforts!
          </p>
      </div>

      {/* Community Goal Progress */}
      <div className="bg-dashboard-card p-6 sm:p-8 rounded-xl shadow-lg mb-12 animate-fade-in-up animation-delay-400">
        <h2 className="text-2xl font-semibold text-dashboard-text-primary mb-4 text-center">
          Community Goal: <span className="text-primary">{communityHourGoal.toLocaleString()} Hours</span>
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-10 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-dashboard-accent-teal to-primary h-10 rounded-full text-center text-white font-bold text-sm flex items-center justify-center transition-all duration-1000 ease-out animate-bg-pan"
            style={{ width: `${progressToGoal}%`, backgroundSize: '200% 200%' }} // backgroundSize for bgPan
            title={`${progressToGoal.toFixed(1)}% Reached`}
          >
            {progressToGoal > 10 && `${progressToGoal.toFixed(1)}% Reached!`}
          </div>
        </div>
        <p className="text-center text-dashboard-text-secondary mt-3">
          We've contributed <span className="font-semibold text-secondary">{totalCollectiveHours.toLocaleString()}</span> hours towards our goal. Keep up the great work!
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {collectiveHoursByCategory.length > 0 && (
          <div className="animate-fade-in-up animation-delay-500">
            <ImpactChart 
              data={collectiveHoursByCategory} 
              chartType="pie" 
              title="Hours Contributed by Cause" 
              height={400}
            />
          </div>
        )}
        {hoursByOrganization.length > 0 && (
           <div className="animate-fade-in-up animation-delay-600">
            <ImpactChart 
              data={hoursByOrganization} 
              chartType="bar" 
              title="Top Organizations by Hours Received" 
              dataKey="value"
              fillColor="#2ecc71" // secondary color
              height={400}
            />
          </div>
        )}
      </div>
      
      {/* Impact Stories Section */}
      {impactStories.length > 0 && (
        <div className="bg-dashboard-card p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in-up animation-delay-700">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Impact Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {impactStories.slice(0, 2).map((story, index) => ( 
              <div 
                key={story.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-100 group overflow-hidden animate-fade-in-up"
                style={{animationDelay: `${800 + index * 150}ms`}}
              >
                {story.imageUrl && 
                  <div className="overflow-hidden rounded-t-lg">
                    <img src={story.imageUrl} alt={`Impact story for ${story.opportunityTitle}`} className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"/>
                  </div>
                }
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-secondary mb-1">{story.opportunityTitle}</h3>
                  <p className="text-sm text-dashboard-text-secondary mb-3">By: {story.userName}</p>
                  <p className="text-dashboard-text-primary italic leading-relaxed line-clamp-4">"{story.story}"</p>
                </div>
              </div>
            ))}
          </div>
          {impactStories.length > 2 && (
             <p className="mt-8 text-center">
                <a href="#" className="text-primary hover:text-primary-dark font-medium transition-colors">View More Impact Stories (Coming Soon)</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectiveImpactDashboardPage;