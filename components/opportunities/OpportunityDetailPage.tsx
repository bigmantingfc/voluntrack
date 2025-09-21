
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOpportunities } from '../../contexts/OpportunityContext';
import { Opportunity, OpportunityCategory } from '../../types';
import LoadingSpinner from '../shared/LoadingSpinner';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { useAuth } from '../auth/AuthContext';

const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOpportunityById, isLoading } = useOpportunities();
  const [opportunity, setOpportunity] = useState<Opportunity | null | undefined>(null);
  const { user, saveOpportunity, unsaveOpportunity, isOpportunitySaved } = useAuth();
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (id) {
      const opp = getOpportunityById(id);
      setOpportunity(opp);
    }
  }, [id, getOpportunityById, isLoading]); // Added isLoading to re-check if opps load later

  if (isLoading && opportunity === null) { 
    return <div className="container mx-auto px-4 py-8 mt-16"><LoadingSpinner message="Loading opportunity details..." /></div>;
  }

  if (opportunity === undefined && !isLoading) { 
    return <div className="container mx-auto px-4 py-8 mt-16 text-center py-10 text-xl text-red-500">Opportunity not found.</div>;
  }
  
  if (!opportunity) { 
    return <div className="container mx-auto px-4 py-8 mt-16"><LoadingSpinner message="Loading opportunity details..." /></div>;
  }

  const isSaved = isOpportunitySaved(opportunity.id);

  const handleSaveToggle = () => {
    if (!user) {
        alert("Please log in to save opportunities."); 
        return;
    }
    if (isSaved) {
        unsaveOpportunity(opportunity.id);
    } else {
        saveOpportunity(opportunity.id);
    }
  };

  const legacyCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Make the textarea invisible and out of the document flow
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2500);
      } else {
        console.error('Fallback: Copying text command was unsuccessful');
        alert("Sharing failed. Please copy the URL from your browser's address bar.");
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert("Sharing failed. Please copy the URL from your browser's address bar.");
    }

    document.body.removeChild(textArea);
  };

  const copyToClipboard = (text: string) => {
    // Modern Clipboard API is preferred for its security and better UX.
    // It requires a secure context (HTTPS).
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2500);
      }).catch(err => {
        console.error("Failed to copy with Clipboard API:", err);
        // If modern API fails (e.g., transient browser issue), try legacy method.
        legacyCopyToClipboard(text);
      });
    } else {
      // Use legacy method for insecure contexts (HTTP) or older browsers.
      legacyCopyToClipboard(text);
    }
  };

  const handleShare = async () => {
    if (!opportunity) return;
    
    const shareData = {
      title: opportunity.title,
      text: `Check out this volunteer opportunity: ${opportunity.title} with ${opportunity.organization.name}.`,
      // URL property is omitted. The browser will use the canonical URL of the document, which is more reliable.
    };
    
    // We still need the URL for the clipboard fallback.
    const shareUrl = window.location.href;

    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignore AbortError which is thrown when the user cancels the share dialog
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error("Web Share API Error:", err);
          // Fallback to clipboard if Web Share API fails unexpectedly
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback to clipboard if Web Share API is not supported
      copyToClipboard(shareUrl);
    }
  };


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

  return (
    <div className="container mx-auto px-4 py-8 mt-16"> 
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{opportunity.title}</h1>
              <p className="text-lg text-gray-600 mb-1">
                Offered by: {opportunity.organization.website ? <a href={opportunity.organization.website} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">{opportunity.organization.name}</a> : opportunity.organization.name }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                {user && (
                  <Button 
                    onClick={handleSaveToggle}
                    variant={isSaved ? 'accent' : 'secondary'}
                  >
                    {isSaved ? 'Unsave' : 'Save'}
                  </Button>
                )}
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  leftIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>}
                >
                  Share
                </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge color={categoryColorMapping[opportunity.category] || 'gray'} size="md">{opportunity.category}</Badge>
            <Badge color="blue" size="md">{opportunity.timeCommitment}</Badge>
            {opportunity.remoteOrOnline && <Badge color="purple" size="md">Remote/Online</Badge>}
            {opportunity.ageRequirement && <Badge color="orange" size="md">Age: {opportunity.ageRequirement}</Badge>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div><strong className="block text-gray-700">Location:</strong> {opportunity.location}</div>
            </div>
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div><strong className="block text-gray-700">Dates & Times:</strong> {opportunity.dates}</div>
            </div>
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /> 
              </svg>
              <div><strong className="block text-gray-700">Skills Required:</strong> {opportunity.skillsRequired?.join(', ') || 'None specified'}</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Opportunity Description</h2>
          <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line">{opportunity.description}</p>

          { (opportunity.contactPerson || opportunity.contactEmail) && (
            <div className="bg-lightgray p-6 rounded-md mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Information</h3>
              {opportunity.contactPerson && <p className="text-gray-700 mb-1"><strong>Contact Person:</strong> {opportunity.contactPerson}</p>}
              {opportunity.contactEmail && <p className="text-gray-700"><strong>Email:</strong> <a href={`mailto:${opportunity.contactEmail}`} className="text-primary hover:underline">{opportunity.contactEmail}</a></p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            {opportunity.applicationLink ? (
              <Button 
                onClick={() => window.open(opportunity.applicationLink, '_blank')} 
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Search & Apply on Google
              </Button>
            ) : (
              <p className="text-gray-600 italic">No direct application link provided. Please use contact information if available.</p>
            )}
            <Link to="/log-hours" state={{ prefillOpportunityId: opportunity.id }}>
              <Button variant="primary" size="lg" className="w-full sm:w-auto">Log Hours for this Opportunity</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Link to="/opportunities" className="text-primary hover:text-blue-700">&larr; Back to All Opportunities</Link>
      </div>

      {showCopiedMessage && (
        <div className="fixed bottom-5 right-5 bg-darkgray text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 animate-fade-in-up">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default OpportunityDetailPage;
