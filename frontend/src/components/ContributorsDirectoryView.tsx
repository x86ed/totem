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

function ContributorsDirectoryView() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

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
  const selectedContributor = sorted.find(c => c.name === selected) || sorted[0];

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
                background: contrib.name === selectedContributor?.name ? '#e0e7ff' : undefined,
                color: contrib.name === selectedContributor?.name ? '#1d4ed8' : undefined,
                fontWeight: contrib.name === selectedContributor?.name ? 600 : 400,
                cursor: 'pointer',
                marginBottom: 2
              }}
              onClick={() => setSelected(contrib.name)}
            >
              {contrib.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedContributor ? (
          <div className="site-font">
            <h3 className="text-xl font-semibold mb-2">{selectedContributor.name}</h3>
            {selectedContributor.gitProfile && (
              <div className="mb-2">
                <strong>Git Profile:</strong>
                <ul>
                  {selectedContributor.gitProfile.username && <li>Username: {selectedContributor.gitProfile.username}</li>}
                  {selectedContributor.gitProfile.fullName && <li>Full Name: {selectedContributor.gitProfile.fullName}</li>}
                  {selectedContributor.gitProfile.email && <li>Email: {selectedContributor.gitProfile.email}</li>}
                  {selectedContributor.gitProfile.github && <li>GitHub: {selectedContributor.gitProfile.github}</li>}
                  {selectedContributor.gitProfile.location && <li>Location: {selectedContributor.gitProfile.location}</li>}
                  {selectedContributor.gitProfile.joined && <li>Joined: {selectedContributor.gitProfile.joined}</li>}
                </ul>
              </div>
            )}
            {selectedContributor.roleAndResponsibilities && (
              <div className="mb-2">
                <strong>Role & Responsibilities:</strong>
                <ul>
                  {selectedContributor.roleAndResponsibilities.position && <li>Position: {selectedContributor.roleAndResponsibilities.position}</li>}
                  {selectedContributor.roleAndResponsibilities.team && <li>Team: {selectedContributor.roleAndResponsibilities.team}</li>}
                  {selectedContributor.roleAndResponsibilities.focusAreas && (
                    <li>Focus Areas:
                      <ul>
                        {selectedContributor.roleAndResponsibilities.focusAreas.map(fa => <li key={fa}>{fa}</li>)}
                      </ul>
                    </li>
                  )}
                </ul>
              </div>
            )}
            {selectedContributor.availability && (
              <div className="mb-2">
                <strong>Availability:</strong>
                <ul>
                  {selectedContributor.availability.primaryTimezone && <li>Primary Timezone: {selectedContributor.availability.primaryTimezone}</li>}
                  {selectedContributor.availability.workingHours && <li>Working Hours: {selectedContributor.availability.workingHours}</li>}
                  {selectedContributor.availability.bestContactTime && <li>Best Contact Time: {selectedContributor.availability.bestContactTime}</li>}
                  {selectedContributor.availability.responseTime && <li>Response Time: {selectedContributor.availability.responseTime}</li>}
                </ul>
              </div>
            )}
            {selectedContributor.codingPreferences && (
              <div className="mb-2">
                <strong>Coding Preferences:</strong>
                <ul>
                  {selectedContributor.codingPreferences.primary && <li>Primary: {selectedContributor.codingPreferences.primary.join(', ')}</li>}
                  {selectedContributor.codingPreferences.frontend && <li>Frontend: {selectedContributor.codingPreferences.frontend}</li>}
                  {selectedContributor.codingPreferences.backend && <li>Backend: {selectedContributor.codingPreferences.backend}</li>}
                  {selectedContributor.codingPreferences.databases && <li>Databases: {selectedContributor.codingPreferences.databases}</li>}
                  {selectedContributor.codingPreferences.tools && <li>Tools: {selectedContributor.codingPreferences.tools}</li>}
                </ul>
              </div>
            )}
            {selectedContributor.codeStyle && (
              <div className="mb-2">
                <strong>Code Style:</strong>
                <ul>
                  {selectedContributor.codeStyle.formatting && <li>Formatting: {selectedContributor.codeStyle.formatting}</li>}
                  {selectedContributor.codeStyle.linting && <li>Linting: {selectedContributor.codeStyle.linting}</li>}
                  {selectedContributor.codeStyle.testing && <li>Testing: {selectedContributor.codeStyle.testing}</li>}
                  {selectedContributor.codeStyle.documentation && <li>Documentation: {selectedContributor.codeStyle.documentation}</li>}
                </ul>
              </div>
            )}
            {selectedContributor.workflow && (
              <div className="mb-2">
                <strong>Development Workflow:</strong>
                <ul>
                  {selectedContributor.workflow.branching && <li>Branching: {selectedContributor.workflow.branching}</li>}
                  {selectedContributor.workflow.commits && <li>Commits: {selectedContributor.workflow.commits}</li>}
                  {selectedContributor.workflow.prProcess && <li>PR Process: {selectedContributor.workflow.prProcess}</li>}
                  {selectedContributor.workflow.codeReview && <li>Code Review: {selectedContributor.workflow.codeReview}</li>}
                </ul>
              </div>
            )}
            {selectedContributor.communication && (
              <div className="mb-2">
                <strong>Communication Style:</strong>
                <ul>
                  {selectedContributor.communication.codeReviews && <li>Code Reviews: {selectedContributor.communication.codeReviews}</li>}
                  {selectedContributor.communication.documentation && <li>Documentation: {selectedContributor.communication.documentation}</li>}
                  {selectedContributor.communication.meetings && <li>Meetings: {selectedContributor.communication.meetings}</li>}
                  {selectedContributor.communication.mentoring && <li>Mentoring: {selectedContributor.communication.mentoring}</li>}
                </ul>
              </div>
            )}
            {selectedContributor.expertise && selectedContributor.expertise.expertiseAreas && (
              <div className="mb-2">
                <strong>Expertise Areas:</strong>
                <ul>
                  {selectedContributor.expertise.expertiseAreas.map(area => <li key={area}>{area}</li>)}
                </ul>
              </div>
            )}
            {selectedContributor.funFacts && selectedContributor.funFacts.funFacts && (
              <div className="mb-2">
                <strong>Fun Facts:</strong>
                <ul>
                  {selectedContributor.funFacts.funFacts.map(fact => <li key={fact}>{fact}</li>)}
                </ul>
              </div>
            )}
            {selectedContributor.contactPreferences && (
              <div className="mb-2">
                <strong>Contact Preferences:</strong>
                <ul>
                  {selectedContributor.contactPreferences.urgentIssues && <li>Urgent Issues: {selectedContributor.contactPreferences.urgentIssues}</li>}
                  {selectedContributor.contactPreferences.codeQuestions && <li>Code Questions: {selectedContributor.contactPreferences.codeQuestions}</li>}
                  {selectedContributor.contactPreferences.generalDiscussion && <li>General Discussion: {selectedContributor.contactPreferences.generalDiscussion}</li>}
                  {selectedContributor.contactPreferences.afterHours && <li>After Hours: {selectedContributor.contactPreferences.afterHours}</li>}
                </ul>
              </div>
            )}
            {selectedContributor.lastUpdated && (
              <div className="text-gray-400 text-sm mt-2">Last Updated: {selectedContributor.lastUpdated}</div>
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
