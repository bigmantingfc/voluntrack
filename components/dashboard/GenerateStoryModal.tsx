
import React, { useState, useCallback } from 'react';
import { LoggedHour, ImpactStory } from '../../types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../auth/AuthContext';
import LoadingSpinner from '../shared/LoadingSpinner';

interface GenerateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedHours: LoggedHour[];
  onStorySaved: (newStory: ImpactStory) => void;
}

const GenerateStoryModal: React.FC<GenerateStoryModalProps> = ({ isOpen, onClose, loggedHours, onStorySaved }) => {
  const { user } = useAuth();
  const [selectedLogId, setSelectedLogId] = useState<string>(loggedHours.length > 0 ? loggedHours[0].id : '');
  const [personalNotes, setPersonalNotes] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateStory = useCallback(async () => {
    if (!selectedLogId || !user) {
      setError('Please select a volunteer activity.');
      return;
    }
    
    const selectedLog = loggedHours.find(log => log.id === selectedLogId);
    if (!selectedLog) {
      setError('Could not find the selected activity details.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedStory('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        You are an inspiring storyteller helping a volunteer articulate their experience. Write a short, heartfelt, first-person story (1-3 paragraphs) about their contribution.

        Here are the details:
        - Volunteer's Name: ${user.name}
        - Opportunity: ${selectedLog.opportunityTitle}
        - Organization: ${selectedLog.organizationName}
        - Date: ${new Date(selectedLog.date).toLocaleDateString()}
        - Hours Logged: ${selectedLog.hours}
        - Personal Notes from the volunteer: ${personalNotes || "None provided."}

        Based on these details, craft a story that sounds personal and reflects on the positive impact of their work. If the user provided personal notes, make sure to incorporate those feelings and moments into the story.
        The story should be engaging, reflective, and uplifting.
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      setGeneratedStory(response.text);

    } catch (e) {
      console.error("Gemini API error:", e);
      setError('Failed to generate story. Please check your API key or try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLogId, personalNotes, user, loggedHours]);

  const handleSaveStory = () => {
    if (!generatedStory || !user) return;
    const selectedLog = loggedHours.find(log => log.id === selectedLogId);
    if (!selectedLog) return;

    const newStory: ImpactStory = {
      id: `story-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      opportunityTitle: selectedLog.opportunityTitle,
      story: generatedStory,
      submittedAt: new Date().toISOString(),
    };
    onStorySaved(newStory);
    handleClose();
  };

  const handleClose = () => {
    setGeneratedStory('');
    setPersonalNotes('');
    setError('');
    if (loggedHours.length > 0) {
        setSelectedLogId(loggedHours[0].id);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate Your Impact Story with AI" size="lg">
      <div className="space-y-4">
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div>
          <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-1">
            Choose a volunteer activity
          </label>
          <select
            id="activity"
            value={selectedLogId}
            onChange={(e) => setSelectedLogId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            {loggedHours.map(log => (
              <option key={log.id} value={log.id}>
                {log.opportunityTitle} on {new Date(log.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Add personal feelings or memorable moments (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            placeholder="e.g., 'It was so rewarding to see the children's faces light up...'"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        {!generatedStory && !isLoading && (
            <Button onClick={generateStory} variant="primary" className="w-full" disabled={!selectedLogId}>
            Generate Story
            </Button>
        )}

        {isLoading && <LoadingSpinner message="AI is writing your story..." />}

        {generatedStory && !isLoading && (
          <div className="p-4 bg-lightgray rounded-md border border-gray-200 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Your Generated Story:</h3>
            <p className="text-gray-700 whitespace-pre-line">{generatedStory}</p>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button onClick={generateStory} variant="outline">
                Regenerate
              </Button>
              <Button onClick={handleSaveStory} variant="secondary">
                Save Story
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GenerateStoryModal;
