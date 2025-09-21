
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoggedHours } from '../../contexts/LoggedHoursContext';
import { useOpportunities } from '../../contexts/OpportunityContext';
import { Opportunity } from '../../types';
import Input from '../shared/Input';
import Button from '../shared/Button';

const LogHoursForm: React.FC = () => {
  const { addLoggedHour, isLoading } = useLoggedHours();
  const { opportunities, getOpportunityById } = useOpportunities();
  const navigate = useNavigate();
  const location = useLocation(); // To get prefill data

  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [hours, setHours] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.prefillOpportunityId) {
      setSelectedOpportunityId(location.state.prefillOpportunityId);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedOpportunityId || !date || !hours) {
      setError('Please select an opportunity, date, and enter hours.');
      return;
    }
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError('Please enter a valid positive number for hours.');
      return;
    }

    const opportunity = getOpportunityById(selectedOpportunityId);
    if (!opportunity) {
      setError('Selected opportunity not found. Please choose a valid one.');
      return;
    }

    try {
      await addLoggedHour({
        opportunityId: selectedOpportunityId,
        opportunityTitle: opportunity.title,
        organizationName: opportunity.organization.name,
        category: opportunity.category,
        date,
        hours: hoursNum,
        notes: notes || undefined,
      });
      setSuccessMessage('Hours logged successfully!');
      // Reset form
      setSelectedOpportunityId('');
      setDate(new Date().toISOString().split('T')[0]);
      setHours('');
      setNotes('');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/dashboard/individual'); // Navigate to impact dashboard
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log hours.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md">{successMessage}</p>}

      <div>
        <label htmlFor="opportunityId" className="block text-sm font-medium text-gray-700 mb-1">Opportunity *</label>
        <select
          id="opportunityId"
          value={selectedOpportunityId}
          onChange={e => setSelectedOpportunityId(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        >
          <option value="" disabled>Select an opportunity</option>
          {opportunities.map(op => (
            <option key={op.id} value={op.id}>{op.title} (by {op.organization.name})</option>
          ))}
        </select>
      </div>

      <Input 
        label="Date of Volunteering *" 
        type="date" 
        value={date} 
        onChange={e => setDate(e.target.value)} 
        required 
        max={new Date().toISOString().split('T')[0]} // Cannot log future dates
      />
      <Input 
        label="Hours Volunteered *" 
        type="number" 
        value={hours} 
        onChange={e => setHours(e.target.value)} 
        required 
        min="0.1" 
        step="0.1"
        placeholder="e.g., 2.5"
      />
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Impact Story (Optional)</label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Describe your activity or share a short story about your experience..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} size="lg">
        Log Hours
      </Button>
    </form>
  );
};

export default LogHoursForm;
