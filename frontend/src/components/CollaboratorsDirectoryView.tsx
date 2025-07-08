import React, { useState, useEffect } from 'react';

// Types for Collaborator (should match CollaboratorDto)
export interface Collaborator {
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

const API_BASE = import.meta.env?.DEV ? 'http://localhost:8080/api/collaborator' : '/api/collaborator';

function CollaboratorsDirectoryView() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_BASE)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch collaborators');
        return res.json();
      })
      .then(data => {
        setCollaborators(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const sorted = [...collaborators].sort((a, b) => a.name.localeCompare(b.name));
  const selectedCollaborator = sorted.find(c => c.name === selected) || sorted[0];

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ minWidth: 220, maxWidth: 300, borderRight: '1px solid #e5e7eb', paddingRight: 16 }}>
        <h2 className="text-xl font-bold mb-3">Collaborators</h2>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sorted.map(collab => (
            <li
              key={collab.name}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: collab.name === selectedCollaborator?.name ? '#e0e7ff' : undefined,
                color: collab.name === selectedCollaborator?.name ? '#1d4ed8' : undefined,
                fontWeight: collab.name === selectedCollaborator?.name ? 600 : 400,
                cursor: 'pointer',
                marginBottom: 2
              }}
              onClick={() => setSelected(collab.name)}
            >
              {collab.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedCollaborator ? (
          <div className="site-font">
            <h3 className="text-xl font-semibold mb-2">{selectedCollaborator.name}</h3>
            {selectedCollaborator.gitProfile && (
              <div className="mb-2">
                <strong>Git Profile:</strong>
                <ul>
                  {selectedCollaborator.gitProfile.username && <li>Username: {selectedCollaborator.gitProfile.username}</li>}
                  {selectedCollaborator.gitProfile.fullName && <li>Full Name: {selectedCollaborator.gitProfile.fullName}</li>}
                  {selectedCollaborator.gitProfile.email && <li>Email: {selectedCollaborator.gitProfile.email}</li>}
                  {selectedCollaborator.gitProfile.github && <li>GitHub: {selectedCollaborator.gitProfile.github}</li>}
                  {selectedCollaborator.gitProfile.location && <li>Location: {selectedCollaborator.gitProfile.location}</li>}
                  {selectedCollaborator.gitProfile.joined && <li>Joined: {selectedCollaborator.gitProfile.joined}</li>}
                </ul>
              </div>
            )}
            {selectedCollaborator.roleAndResponsibilities && (
              <div className="mb-2">
                <strong>Role & Responsibilities:</strong>
                <ul>
                  {selectedCollaborator.roleAndResponsibilities.position && <li>Position: {selectedCollaborator.roleAndResponsibilities.position}</li>}
                  {selectedCollaborator.roleAndResponsibilities.team && <li>Team: {selectedCollaborator.roleAndResponsibilities.team}</li>}
                  {selectedCollaborator.roleAndResponsibilities.focusAreas && (
                    <li>Focus Areas:
                      <ul>
                        {selectedCollaborator.roleAndResponsibilities.focusAreas.map(fa => <li key={fa}>{fa}</li>)}
                      </ul>
                    </li>
                  )}
                </ul>
              </div>
            )}
            {selectedCollaborator.availability && (
              <div className="mb-2">
                <strong>Availability:</strong>
                <ul>
                  {selectedCollaborator.availability.primaryTimezone && <li>Primary Timezone: {selectedCollaborator.availability.primaryTimezone}</li>}
                  {selectedCollaborator.availability.workingHours && <li>Working Hours: {selectedCollaborator.availability.workingHours}</li>}
                  {selectedCollaborator.availability.bestContactTime && <li>Best Contact Time: {selectedCollaborator.availability.bestContactTime}</li>}
                  {selectedCollaborator.availability.responseTime && <li>Response Time: {selectedCollaborator.availability.responseTime}</li>}
                </ul>
              </div>
            )}
            {selectedCollaborator.codingPreferences && (
              <div className="mb-2">
                <strong>Coding Preferences:</strong>
                <ul>
                  {selectedCollaborator.codingPreferences.primary && <li>Primary: {selectedCollaborator.codingPreferences.primary.join(', ')}</li>}
                  {selectedCollaborator.codingPreferences.frontend && <li>Frontend: {selectedCollaborator.codingPreferences.frontend}</li>}
                  {selectedCollaborator.codingPreferences.backend && <li>Backend: {selectedCollaborator.codingPreferences.backend}</li>}
                  {selectedCollaborator.codingPreferences.databases && <li>Databases: {selectedCollaborator.codingPreferences.databases}</li>}
                  {selectedCollaborator.codingPreferences.tools && <li>Tools: {selectedCollaborator.codingPreferences.tools}</li>}
                </ul>
              </div>
            )}
            {selectedCollaborator.codeStyle && (
              <div className="mb-2">
                <strong>Code Style:</strong>
                <ul>
                  {selectedCollaborator.codeStyle.formatting && <li>Formatting: {selectedCollaborator.codeStyle.formatting}</li>}
                  {selectedCollaborator.codeStyle.linting && <li>Linting: {selectedCollaborator.codeStyle.linting}</li>}
                  {selectedCollaborator.codeStyle.testing && <li>Testing: {selectedCollaborator.codeStyle.testing}</li>}
                  {selectedCollaborator.codeStyle.documentation && <li>Documentation: {selectedCollaborator.codeStyle.documentation}</li>}
                </ul>
              </div>
            )}
            {selectedCollaborator.workflow && (
              <div className="mb-2">
                <strong>Development Workflow:</strong>
                <ul>
                  {selectedCollaborator.workflow.branching && <li>Branching: {selectedCollaborator.workflow.branching}</li>}
                  {selectedCollaborator.workflow.commits && <li>Commits: {selectedCollaborator.workflow.commits}</li>}
                  {selectedCollaborator.workflow.prProcess && <li>PR Process: {selectedCollaborator.workflow.prProcess}</li>}
                  {selectedCollaborator.workflow.codeReview && <li>Code Review: {selectedCollaborator.workflow.codeReview}</li>}
                </ul>
              </div>
            )}
            {selectedCollaborator.communication && (
              <div className="mb-2">
                <strong>Communication Style:</strong>
                <ul>
                  {selectedCollaborator.communication.codeReviews && <li>Code Reviews: {selectedCollaborator.communication.codeReviews}</li>}
                  {selectedCollaborator.communication.documentation && <li>Documentation: {selectedCollaborator.communication.documentation}</li>}
                  {selectedCollaborator.communication.meetings && <li>Meetings: {selectedCollaborator.communication.meetings}</li>}
                  {selectedCollaborator.communication.mentoring && <li>Mentoring: {selectedCollaborator.communication.mentoring}</li>}
                </ul>
              </div>
            )}
            {selectedCollaborator.expertise && selectedCollaborator.expertise.expertiseAreas && (
              <div className="mb-2">
                <strong>Expertise Areas:</strong>
                <ul>
                  {selectedCollaborator.expertise.expertiseAreas.map(area => <li key={area}>{area}</li>)}
                </ul>
              </div>
            )}
            {selectedCollaborator.funFacts && selectedCollaborator.funFacts.funFacts && (
              <div className="mb-2">
                <strong>Fun Facts:</strong>
                <ul>
                  {selectedCollaborator.funFacts.funFacts.map(fact => <li key={fact}>{fact}</li>)}
                </ul>
              </div>
            )}
            {selectedCollaborator.contactPreferences && (
              <div className="mb-2">
                <strong>Contact Preferences:</strong>
                <ul>
                  {selectedCollaborator.contactPreferences.urgentIssues && <li>Urgent Issues: {selectedCollaborator.contactPreferences.urgentIssues}</li>}
                  {selectedCollaborator.contactPreferences.codeQuestions && <li>Code Questions: {selectedCollaborator.contactPreferences.codeQuestions}</li>}
                  {selectedCollaborator.contactPreferences.generalDiscussion && <li>General Discussion: {selectedCollaborator.contactPreferences.generalDiscussion}</li>}
                  {selectedCollaborator.contactPreferences.afterHours && <li>After Hours: {selectedCollaborator.contactPreferences.afterHours}</li>}
                </ul>
              </div>
            )}
            {selectedCollaborator.lastUpdated && (
              <div className="text-gray-400 text-sm mt-2">Last Updated: {selectedCollaborator.lastUpdated}</div>
            )}
          </div>
        ) : (
          <div className="text-gray-400">Select a collaborator to view details.</div>
        )}
      </div>
    </div>
  );
}

export default CollaboratorsDirectoryView;
