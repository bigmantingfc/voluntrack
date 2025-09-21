
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '../../contexts/OpportunityContext';
import { Opportunity, OpportunityCategory, TimeCommitment, Organization } from '../../types';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { ALL_OPPORTUNITY_CATEGORIES, ALL_TIME_COMMITMENTS } from '../../constants';

const SubmitOpportunityPage: React.FC = () => {
  const { addOpportunity, organizations, isLoading } = useOpportunities();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [organizationId, setOrganizationId] = useState<string>(organizations[0]?.id || ''); // Default to first org or empty
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState('');
  const [location, setLocation] = useState('');
  const [skillsRequired, setSkillsRequired] = useState(''); // Comma-separated
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [category, setCategory] = useState<OpportunityCategory>(OpportunityCategory.COMMUNITY);
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment>(TimeCommitment.FLEXIBLE);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!title || !organizationId || !description || !dates || !location || !category || !timeCommitment) {
      setError('Please fill in all required fields.');
      return;
    }
    
    const selectedOrganization = organizations.find(org => org.id === organizationId);
    if (!selectedOrganization) {
        setError('Invalid organization selected.');
        return;
    }

    const newOpportunityData: Omit<Opportunity, 'id' | 'organization' | 'publishedDate' | 'imageUrl'> = {
      title,
      organizationId,
      description,
      dates,
      location,
      skillsRequired: skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : undefined,
      contactPerson: contactPerson || undefined,
      contactEmail: contactEmail || undefined,
      applicationLink: applicationLink || undefined,
      category,
      timeCommitment,
    };

    try {
      const newOpp = await addOpportunity(newOpportunityData);
      setSuccessMessage(`Opportunity "${newOpp.title}" submitted successfully!`);
      // Optionally reset form or navigate
      // setTitle(''); setOrganizationId(''); ...
      setTimeout(() => navigate(`/opportunities/${newOpp.id}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit opportunity.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16"> {/* Added mt-16 for navbar offset */}
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Submit a Volunteer Opportunity</h1>
        {error && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {successMessage && <p className="mb-4 text-green-600 bg-green-100 p-3 rounded-md">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Opportunity Title *" value={title} onChange={e => setTitle(e.target.value)} required />
          
          <div>
            <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
            <select
              id="organizationId"
              name="organizationId"
              value={organizationId}
              onChange={e => setOrganizationId(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="" disabled>Select an Organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
              {/* TODO: Add option to create a new organization if needed */}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          <Input label="Dates & Times (e.g., Every Saturday 9am-12pm, Oct 15th 10am-4pm) *" value={dates} onChange={e => setDates(e.target.value)} required />
          <Input label="Location (e.g., City Park Community Center) *" value={location} onChange={e => setLocation(e.target.value)} required />
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value as OpportunityCategory)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
              {ALL_OPPORTUNITY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700 mb-1">Time Commitment *</label>
            <select id="timeCommitment" value={timeCommitment} onChange={e => setTimeCommitment(e.target.value as TimeCommitment)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
              {ALL_TIME_COMMITMENTS.map(tc => <option key={tc} value={tc}>{tc}</option>)}
            </select>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-700 pt-4 border-t mt-6">Optional Details</h2>
          <Input label="Skills Required (comma-separated)" value={skillsRequired} onChange={e => setSkillsRequired(e.target.value)} />
          <Input label="Contact Person" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
          <Input label="Contact Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
          <Input label="Application/Website Link" type="url" value={applicationLink} onChange={e => setApplicationLink(e.target.value)} placeholder="https://example.com/apply" />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} size="lg">
            Submit Opportunity
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SubmitOpportunityPage;
