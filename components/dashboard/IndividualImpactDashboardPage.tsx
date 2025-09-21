

import React, { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLoggedHours } from '../../contexts/LoggedHoursContext';
import { LoggedHour, OpportunityCategory, ImpactStory } from '../../types';
import LoadingSpinner from '../shared/LoadingSpinner';
import ImpactChart from './ImpactChart';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import GenerateStoryModal from './GenerateStoryModal';

// Simple SVG Icons for Stat Cards
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L15.404 12.813a4.5 4.5 0 01-3.09 3.09L11.25 18.75l.813-2.846a4.5 4.5 0 013.09-3.09L18.25 12zM12 2.25l.813 2.846a4.5 4.5 0 003.09 3.09L18.75 9l-2.846.813a4.5 4.5 0 00-3.09 3.09L12 15.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L5.25 9l2.846-.813a4.5 4.5 0 003.09-3.09L12 2.25z" />
  </svg>
);

const ListBulletIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
</svg>
);


const IndividualImpactDashboardPage: React.FC = () => {
  const { user, addImpactStory } = useAuth();
  const { userLoggedHours, isLoading } = useLoggedHours();
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const totalHours = useMemo(() => {
    return userLoggedHours.reduce((sum, log) => sum + log.hours, 0);
  }, [userLoggedHours]);

  const hoursByCategory = useMemo(() => {
    const categoryMap: { [key in OpportunityCategory]?: number } = {};
    userLoggedHours.forEach(log => {
      categoryMap[log.category] = (categoryMap[log.category] || 0) + log.hours;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name: name as OpportunityCategory, value: value || 0 }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [userLoggedHours]);

  const uniqueOpportunitiesCount = useMemo(() => {
    const uniqueIds = new Set(userLoggedHours.map(log => log.opportunityId));
    return uniqueIds.size;
  }, [userLoggedHours]);

  if (isLoading && !user) {
     return <div className="container mx-auto px-4 py-8 mt-8 sm:mt-16"><LoadingSpinner message="Loading your impact..." /></div>;
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8 mt-8 sm:mt-16 text-center py-10 text-dashboard-text-secondary">Please log in to view your impact.</div>;
  }
  
  const recentActivities = userLoggedHours.slice(0, 5);


  return (
    <>
      <div className="container mx-auto px-4 py-8 mt-8 sm:mt-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 animate-fade-in-down">My Volunteer Impact</h1>
          <p className="text-dashboard-text-secondary text-lg sm:text-xl animate-fade-in-up animation-delay-200">
            Hello, <span className="font-semibold text-secondary">{user.name}</span>! Here's a summary of your amazing contributions.
          </p>
        </div>

        {isLoading && userLoggedHours.length === 0 && <LoadingSpinner message="Fetching your activities..." />}
        
        {userLoggedHours.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-dashboard-card shadow-xl rounded-xl animate-fade-in-up">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-dashboard-text-secondary mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-2xl text-dashboard-text-primary mb-3">You haven't logged any volunteer hours yet.</p>
            <p className="text-dashboard-text-secondary mb-8">Start making an impact today!</p>
            <div className="space-x-4">
              <Link to="/log-hours">
                <Button variant="primary" size="lg" className="transform hover:scale-105 transition-transform">Log Your First Hours</Button>
              </Link>
              <Link to="/opportunities">
                <Button variant="secondary" size="lg" className="transform hover:scale-105 transition-transform">Find Opportunities</Button>
              </Link>
            </div>
          </div>
        )}

        {userLoggedHours.length > 0 && (
          <div className="space-y-10">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dashboard-card p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:animate-cardGlow animate-fade-in-up animation-delay-100">
                <div className="w-14 h-14 mb-4 rounded-full flex items-center justify-center text-white bg-primary"><ClockIcon /></div>
                <p className="text-5xl font-extrabold text-primary">{totalHours.toFixed(1)}</p>
                <p className="text-dashboard-text-secondary mt-1 text-lg">Total Hours Volunteered</p>
              </div>
              <div className="bg-dashboard-card p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:animate-cardGlow animate-fade-in-up animation-delay-200">
                <div className="w-14 h-14 mb-4 rounded-full flex items-center justify-center text-white bg-secondary"><SparklesIcon /></div>
                <p className="text-5xl font-extrabold text-secondary">{uniqueOpportunitiesCount}</p>
                <p className="text-dashboard-text-secondary mt-1 text-lg">Unique Opportunities</p>
              </div>
              <div className="bg-dashboard-card p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:animate-cardGlow animate-fade-in-up animation-delay-300">
                <div className="w-14 h-14 mb-4 rounded-full flex items-center justify-center text-white bg-dashboard-accent-purple"><ListBulletIcon /></div>
                <p className="text-5xl font-extrabold text-dashboard-accent-purple">{userLoggedHours.length}</p>
                <p className="text-dashboard-text-secondary mt-1 text-lg">Activities Logged</p>
              </div>
            </div>

            {/* AI Story Generator CTA */}
             <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-lg text-center animate-fade-in-up animation-delay-400">
                <h2 className="text-2xl font-bold mb-2">Share Your Story!</h2>
                <p className="mb-4">Use our AI assistant to craft a compelling story about your volunteer experience.</p>
                <Button variant="outline" className="bg-white !text-primary hover:!bg-gray-100" onClick={() => setIsStoryModalOpen(true)}>
                    Create Your Impact Story
                </Button>
            </div>


            {/* Charts */}
            {hoursByCategory.length > 0 && (
              <div className="animate-fade-in-up animation-delay-400">
                <ImpactChart 
                  data={hoursByCategory} 
                  chartType="pie" 
                  title="Your Hours by Category"
                  height={380} 
                />
              </div>
            )}

            {/* Impact Stories */}
            {user.impactStories && user.impactStories.length > 0 && (
                <div className="bg-dashboard-card p-6 rounded-xl shadow-lg animate-fade-in-up animation-delay-500">
                    <h2 className="text-2xl font-semibold text-dashboard-text-primary mb-6 text-center">My Impact Stories</h2>
                    <div className="space-y-6">
                        {user.impactStories.map((story, index) => (
                            <div key={story.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 animate-fade-in-up" style={{ animationDelay: `${600 + index * 100}ms`}}>
                                <h3 className="font-semibold text-lg text-secondary mb-1">{story.opportunityTitle}</h3>
                                <p className="text-xs text-gray-500 mb-3">Saved on: {new Date(story.submittedAt).toLocaleDateString()}</p>
                                <p className="text-dashboard-text-primary italic leading-relaxed">"{story.story}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Recent Activities */}
            <div className="bg-dashboard-card p-6 rounded-xl shadow-lg animate-fade-in-up animation-delay-500">
              <h2 className="text-2xl font-semibold text-dashboard-text-primary mb-6">Recent Activities</h2>
              {recentActivities.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivities.map((log, index) => (
                    <li 
                      key={log.id} 
                      className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-200 hover:border-primary flex flex-col sm:flex-row justify-between items-start sm:items-center animate-fade-in-up"
                      style={{ animationDelay: `${600 + index * 100}ms`}}
                    >
                      <div className="flex-grow mb-3 sm:mb-0">
                        <h3 className="font-semibold text-lg text-primary mb-1">{log.opportunityTitle}</h3>
                        <p className="text-sm text-dashboard-text-secondary">Organization: {log.organizationName}</p>
                        <p className="text-sm text-dashboard-text-secondary">Date: {new Date(log.date).toLocaleDateString()} - Hours: {log.hours}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge color="green" size="sm">{log.status}</Badge>
                          <Badge color={log.category === OpportunityCategory.ENVIRONMENT ? 'green' : (log.category === OpportunityCategory.EDUCATION ? 'blue' : 'purple')} size="sm">{log.category}</Badge>
                        </div>
                        {log.notes && <p className="text-sm text-dashboard-text-secondary mt-3 pt-2 border-t border-gray-100 w-full"><em>Notes: {log.notes}</em></p>}
                      </div>
                      <Link to={`/opportunities/${log.opportunityId}`} className="text-sm text-secondary hover:text-secondary-dark font-medium whitespace-nowrap self-start sm:self-center mt-2 sm:mt-0">
                        View Op &rarr;
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-dashboard-text-secondary">No recent activities to display.</p>
              )}
              {userLoggedHours.length > 5 && (
                  <p className="mt-6 text-center">
                      <Link to="#" className="text-primary hover:text-primary-dark font-medium transition-colors">View all activities (Feature coming soon)</Link>
                  </p>
              )}
            </div>
          </div>
        )}
      </div>

      {userLoggedHours.length > 0 && (
        <GenerateStoryModal 
            isOpen={isStoryModalOpen}
            onClose={() => setIsStoryModalOpen(false)}
            loggedHours={userLoggedHours}
            onStorySaved={addImpactStory}
        />
      )}
    </>
  );
};

export default IndividualImpactDashboardPage;