import Avatar from 'boring-avatars';
import React, { useState, useEffect } from 'react';

// Types for Contributor (should match ContributorDto)
export interface Contributor {
  name: string;
  gitProfile?: {
    username?: string;
    fullName?: string;
    email?: string;
    github?: string;
    location?: string;
    joined?: string;
  };
  roleAndResponsibilities?: {
    position?: string;
    team?: string;
    focusAreas?: string[];
  };
  availability?: {
    primaryTimezone?: string;
    workingHours?: string;
    bestContactTime?: string;
    responseTime?: string;
  };
  codingPreferences?: {
    primary?: string[];
    frontend?: string;
    backend?: string;
    databases?: string;
    tools?: string;
  };
  codeStyle?: {
    formatting?: string;
    linting?: string;
    testing?: string;
    documentation?: string;
  };
  workflow?: {
    branching?: string;
    commits?: string;
    prProcess?: string;
    codeReview?: string;
  };
  communication?: {
    codeReviews?: string;
    documentation?: string;
    meetings?: string;
    mentoring?: string;
  };
  expertise?: {
    expertiseAreas?: string[];
  };
  funFacts?: {
    funFacts?: string[];
  };
  contactPreferences?: {
    urgentIssues?: string;
    codeQuestions?: string;
    generalDiscussion?: string;
    afterHours?: string;
  };
  lastUpdated?: string;
}

const API_BASE = import.meta.env?.DEV ? 'http://localhost:8080/api/contributor' : '/api/contributor';

interface ContributorsDirectoryViewProps {
  selectedContributor?: string | null;
  onSelectContributor?: (name: string) => void;
}

function ContributorsDirectoryView({ selectedContributor, onSelectContributor }: ContributorsDirectoryViewProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(selectedContributor || null);

  // Sync prop to state
  useEffect(() => {
    setSelected(selectedContributor || null);
  }, [selectedContributor]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_BASE)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch contributors');
        return res.json();
      })
      .then(data => {
        setContributors(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const sorted = [...contributors].sort((a, b) => a.name.localeCompare(b.name));
  const selectedContrib = sorted.find(c => c.name === selected) || sorted[0];

  // When a contributor is clicked, update state and notify parent for deeplink
  const handleSelect = (name: string) => {
    setSelected(name);
    if (onSelectContributor) {
      onSelectContributor(name);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ minWidth: 220, maxWidth: 300, borderRight: '1px solid #e5e7eb', paddingRight: 16 }}>
        <h2 className="text-xl font-bold mb-3">Contributors</h2>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sorted.map(contrib => (
            <li
              key={contrib.name}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: contrib.name === selectedContrib?.name ? '#e0e7ff' : undefined,
                color: contrib.name === selectedContrib?.name ? '#1d4ed8' : undefined,
                fontWeight: contrib.name === selectedContrib?.name ? 600 : 400,
                cursor: 'pointer',
                marginBottom: 2
              }}
              onClick={() => handleSelect(contrib.name)}
            >
              <Avatar name={contrib.name}   colors={["#0a0310","#49007e","#ff005b","#ff7d10","#ffb238"]} variant="pixel" style={{ width: "2em", verticalAlign: "middle", margin: ".25em"}} square/>
              {contrib.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedContrib ? (
          <div className="site-font">
            <h3 className="text-xl font-semibold mb-2">{selectedContrib.name}</h3>
            {selectedContrib.gitProfile && (
              <div className="mb-2">
                <strong>Git Profile:</strong>
                <ul>
                  {selectedContrib.gitProfile.username && <li>Username: {selectedContrib.gitProfile.username}</li>}
                  {selectedContrib.gitProfile.fullName && <li>Full Name: {selectedContrib.gitProfile.fullName}</li>}
                  {selectedContrib.gitProfile.email && <li>Email: {selectedContrib.gitProfile.email}</li>}
                  {selectedContrib.gitProfile.github && <li>GitHub: {selectedContrib.gitProfile.github}</li>}
                  {selectedContrib.gitProfile.location && <li>Location: {selectedContrib.gitProfile.location}</li>}
                  {selectedContrib.gitProfile.joined && <li>Joined: {selectedContrib.gitProfile.joined}</li>}
                </ul>
              </div>
            )}
            {selectedContrib.roleAndResponsibilities && (
              <div className="mb-2">
                <strong>Role & Responsibilities:</strong>
                <ul>
                  {selectedContrib.roleAndResponsibilities.position && <li>Position: {selectedContrib.roleAndResponsibilities.position}</li>}
                  {selectedContrib.roleAndResponsibilities.team && <li>Team: {selectedContrib.roleAndResponsibilities.team}</li>}
                  {selectedContrib.roleAndResponsibilities.focusAreas && (
                    <li>Focus Areas:
                      <ul>
                        {selectedContrib.roleAndResponsibilities.focusAreas.map(fa => <li key={fa}>{fa}</li>)}
                      </ul>
                    </li>
                  )}
                </ul>
              </div>
            )}
            {selectedContrib.availability && (
              <div className="mb-2">
                <strong>Availability:</strong>
                <ul>
                  {selectedContrib.availability.primaryTimezone && <li>Primary Timezone: {selectedContrib.availability.primaryTimezone}</li>}
                  {selectedContrib.availability.workingHours && <li>Working Hours: {selectedContrib.availability.workingHours}</li>}
                  {selectedContrib.availability.bestContactTime && <li>Best Contact Time: {selectedContrib.availability.bestContactTime}</li>}
                  {selectedContrib.availability.responseTime && <li>Response Time: {selectedContrib.availability.responseTime}</li>}
                </ul>
              </div>
            )}
            {selectedContrib.codingPreferences && (
              <div className="mb-2">
                <strong>Coding Preferences:</strong>
                <ul>
                  {selectedContrib.codingPreferences.primary && <li>Primary: {selectedContrib.codingPreferences.primary.join(', ')}</li>}
                  {selectedContrib.codingPreferences.frontend && <li>Frontend: {selectedContrib.codingPreferences.frontend}</li>}
                  {selectedContrib.codingPreferences.backend && <li>Backend: {selectedContrib.codingPreferences.backend}</li>}
                  {selectedContrib.codingPreferences.databases && <li>Databases: {selectedContrib.codingPreferences.databases}</li>}
                  {selectedContrib.codingPreferences.tools && <li>Tools: {selectedContrib.codingPreferences.tools}</li>}
                </ul>
              </div>
            )}
            {selectedContrib.codeStyle && (
              <div className="mb-2">
                <strong>Code Style:</strong>
                <ul>
                  {selectedContrib.codeStyle.formatting && <li>Formatting: {selectedContrib.codeStyle.formatting}</li>}
                  {selectedContrib.codeStyle.linting && <li>Linting: {selectedContrib.codeStyle.linting}</li>}
                  {selectedContrib.codeStyle.testing && <li>Testing: {selectedContrib.codeStyle.testing}</li>}
                  {selectedContrib.codeStyle.documentation && <li>Documentation: {selectedContrib.codeStyle.documentation}</li>}
                </ul>
              </div>
            )}
            {selectedContrib.workflow && (
              <div className="mb-2">
                <strong>Development Workflow:</strong>
                <ul>
                  {selectedContrib.workflow.branching && <li>Branching: {selectedContrib.workflow.branching}</li>}
                  {selectedContrib.workflow.commits && <li>Commits: {selectedContrib.workflow.commits}</li>}
                  {selectedContrib.workflow.prProcess && <li>PR Process: {selectedContrib.workflow.prProcess}</li>}
                  {selectedContrib.workflow.codeReview && <li>Code Review: {selectedContrib.workflow.codeReview}</li>}
                </ul>
              </div>
            )}
            {selectedContrib.communication && (
              <div className="mb-2">
                <strong>Communication Style:</strong>
                <ul>
                  {selectedContrib.communication.codeReviews && <li>Code Reviews: {selectedContrib.communication.codeReviews}</li>}
                  {selectedContrib.communication.documentation && <li>Documentation: {selectedContrib.communication.documentation}</li>}
                  {selectedContrib.communication.meetings && <li>Meetings: {selectedContrib.communication.meetings}</li>}
                  {selectedContrib.communication.mentoring && <li>Mentoring: {selectedContrib.communication.mentoring}</li>}
                </ul>
              </div>
            )}
            {selectedContrib.expertise && selectedContrib.expertise.expertiseAreas && (
              <div className="mb-2">
                <strong>Expertise Areas:</strong>
                <ul>
                  {selectedContrib.expertise.expertiseAreas.map(area => <li key={area}>{area}</li>)}
                </ul>
              </div>
            )}
            {selectedContrib.funFacts && selectedContrib.funFacts.funFacts && (
              <div className="mb-2">
                <strong>Fun Facts:</strong>
                <ul>
                  {selectedContrib.funFacts.funFacts.map(fact => <li key={fact}>{fact}</li>)}
                </ul>
              </div>
            )}
            {selectedContrib.contactPreferences && (
              <div className="mb-2">
                <strong>Contact Preferences:</strong>
                <ul>
                  {selectedContrib.contactPreferences.urgentIssues && <li>Urgent Issues: {selectedContrib.contactPreferences.urgentIssues}</li>}
                  {selectedContrib.contactPreferences.codeQuestions && <li>Code Questions: {selectedContrib.contactPreferences.codeQuestions}</li>}
                  {selectedContrib.contactPreferences.generalDiscussion && <li>General Discussion: {selectedContrib.contactPreferences.generalDiscussion}</li>}
                  {selectedContrib.contactPreferences.afterHours && <li>After Hours: {selectedContrib.contactPreferences.afterHours}</li>}
                </ul>
              </div>
            )}
            {selectedContrib.lastUpdated && (
              <div className="text-gray-400 text-sm mt-2">Last Updated: {selectedContrib.lastUpdated}</div>
            )}
          </div>
        ) : (
          <div className="text-gray-400">Select a contributor to view details.</div>
        )}
      </div>
    </div>
  );
}

export default ContributorsDirectoryView;
