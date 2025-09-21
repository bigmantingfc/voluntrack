

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { UserProfile, OpportunityCategory, NotificationPreferences } from '../../types';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { ALL_OPPORTUNITY_CATEGORIES } from '../../constants';
import { useOpportunities } from '../../contexts/OpportunityContext';
import OpportunityCard from '../opportunities/OpportunityCard'; // Assuming you have this
import LoadingSpinner from '../shared/LoadingSpinner';
import { Link } from 'react-router-dom';


const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading: authLoading, unsaveOpportunity, isOpportunitySaved } = useAuth();
  const { opportunities, isLoading: oppsLoading } = useOpportunities();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [interests, setInterests] = useState<OpportunityCategory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  
  const [phone, setPhone] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
      email: { newOpportunities: false, eventReminders: false },
      phone: { eventReminders: false },
  });


  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setLocation(user.location || '');
      setAvailability(user.availability || '');
      setInterests(user.interests || []);
      setPhone(user.phone || '');
      if (user.notificationPreferences) {
          setNotificationPreferences(user.notificationPreferences);
      }
    }
  }, [user]);

  const handleInterestChange = (interest: OpportunityCategory) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNotificationChange = (
    type: 'email' | 'phone',
    key: 'newOpportunities' | 'eventReminders',
    value: boolean
  ) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!user) return;

    const updatedProfileData: Partial<UserProfile> = {
      name,
      location,
      availability,
      interests,
      phone,
      notificationPreferences,
    };
    
    const updatedUser = await updateProfile(updatedProfileData);
    if (updatedUser) {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setMessage('Failed to update profile.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8 mt-16"><LoadingSpinner message="Loading profile..." /></div>;
  }

  const userSavedOpportunities = opportunities.filter(op => user.savedOpportunityIds && user.savedOpportunityIds.includes(op.id));


  return (
    <div className="container mx-auto px-4 py-8 mt-16"> {/* Added mt-16 for navbar offset */}
      <h1 className="text-3xl font-bold text-primary mb-6">My Profile & Settings</h1>
      {message && <p className="mb-4 p-3 rounded bg-green-100 text-green-700">{message}</p>}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {!isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-500">Name</h3>
                    <p className="text-gray-800">{user.name}</p>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-500">Email</h3>
                    <p className="text-gray-800">{user.email}</p>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-500">Phone</h3>
                    <p className="text-gray-800">{user.phone || 'Not provided'}</p>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-500">Location</h3>
                    <p className="text-gray-800">{user.location || 'Not set'}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-500">Availability</h3>
                    <p className="text-gray-800">{user.availability || 'Not set'}</p>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-500">Interests</h3>
                    <p className="text-gray-800">{user.interests?.join(', ') || 'None selected'}</p>
                </div>
            </div>
            <div className="border-t pt-6">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification Settings</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Email Notifications</h3>
                        <p className="mb-1">New Opportunities: <strong className={notificationPreferences.email.newOpportunities ? 'text-green-600' : 'text-red-600'}>{notificationPreferences.email.newOpportunities ? 'On' : 'Off'}</strong></p>
                        <p>Event Reminders: <strong className={notificationPreferences.email.eventReminders ? 'text-green-600' : 'text-red-600'}>{notificationPreferences.email.eventReminders ? 'On' : 'Off'}</strong></p>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">SMS Notifications</h3>
                        <p>Event Reminders: <strong className={notificationPreferences.phone.eventReminders ? 'text-green-600' : 'text-red-600'}>{notificationPreferences.phone.eventReminders ? 'On' : 'Off'}</strong></p>
                    </div>
                 </div>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="primary" className="mt-6">Edit Profile & Settings</Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
             <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Edit Profile</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email" value={email} disabled className="bg-gray-100" />
                <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For SMS notifications"/>
                <Input label="Location (e.g., City, State)" value={location} onChange={(e) => setLocation(e.target.value)} />
                <Input label="Availability (e.g., Weekends)" value={availability} onChange={(e) => setAvailability(e.target.value)} containerClassName="md:col-span-2"/>
             </div>

            <div className="my-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_OPPORTUNITY_CATEGORIES.map(interest => (
                  <label key={interest} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={interests.includes(interest)}
                      onChange={() => handleInterestChange(interest)}
                      className="form-checkbox h-5 w-5 text-primary focus:ring-primary"
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 pt-6 border-t">Notification Settings</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Email Notifications</h3>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-primary focus:ring-primary" checked={notificationPreferences.email.newOpportunities} onChange={e => handleNotificationChange('email', 'newOpportunities', e.target.checked)} />
                            <span>Notify me about new opportunities matching my interests.</span>
                        </label>
                        <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-primary focus:ring-primary" checked={notificationPreferences.email.eventReminders} onChange={e => handleNotificationChange('email', 'eventReminders', e.target.checked)} />
                            <span>Send me reminders for events I've saved.</span>
                        </label>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">SMS Notifications</h3>
                    <p className="text-sm text-gray-500 mb-2">A valid phone number must be saved above.</p>
                     <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-primary focus:ring-primary" checked={notificationPreferences.phone.eventReminders} onChange={e => handleNotificationChange('phone', 'eventReminders', e.target.checked)} disabled={!phone} />
                        <span className={!phone ? 'text-gray-400' : ''}>Send me SMS reminders for events I've saved.</span>
                    </label>
                </div>
            </div>
            
            <div className="flex space-x-4 mt-8 border-t pt-6">
              <Button type="submit" variant="secondary" isLoading={authLoading}>Save Changes</Button>
              <Button onClick={() => { setIsEditing(false); setMessage(''); }} variant="outline">Cancel</Button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-primary mb-4">My Saved Opportunities</h2>
        {oppsLoading ? (
          <LoadingSpinner message="Loading saved opportunities..." />
        ) : userSavedOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSavedOpportunities.map(op => (
              <OpportunityCard key={op.id} opportunity={op} showUnsaveButton={true} onUnsave={unsaveOpportunity} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You haven't saved any opportunities yet. <Link to="/opportunities" className="text-primary hover:underline">Explore opportunities</Link>.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;