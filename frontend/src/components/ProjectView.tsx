import { useState, useEffect } from 'react'
import ContributorsDirectoryView from './ContributorsDirectoryView'
import PersonasDirectoryView from './PersonasDirectoryView'
import SettingsView from './SettingsView'

/**
 * ProjectView - A placeholder for project-level settings, info, or dashboard.
 */
function ProjectView() {
  const [activeTab, setActiveTab] = useState<'settings' | 'contributors' | 'personas'>('settings')
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null)

  // Parse hash for tab and contributor
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#/, '')
      const segments = hash.split('/')
      if (segments[0] === 'project') {
        if (segments[1] === 'contributors') {
          setActiveTab('contributors')
          setSelectedContributor(segments[2] || null)
        } else if (segments[1] === 'personas') {
          setActiveTab('personas')
          setSelectedContributor(null)
        } else {
          setActiveTab('settings')
          setSelectedContributor(null)
        }
      } else {
        setActiveTab('settings')
        setSelectedContributor(null)
      }
    }
    parseHash()
    window.addEventListener('hashchange', parseHash)
    return () => window.removeEventListener('hashchange', parseHash)
  }, [])

  // Tab navigation updates hash
  const handleTabChange = (tab: 'settings' | 'contributors' | 'personas') => {
    setActiveTab(tab)
    setSelectedContributor(null)
    window.location.hash = `#project/${tab}`
  }

  // Contributor selection updates hash
  const handleContributorSelect = (name: string) => {
    setActiveTab('contributors')
    setSelectedContributor(name)
    window.location.hash = `#project/contributors/${encodeURIComponent(name)}`
  }

  return (
    <div className="project-view">
      <h2 className="text-2xl font-bold mb-6">Project Overview</h2>
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          className={`pb-2 px-4 font-medium text-lg border-b-2 transition-colors duration-150 ${activeTab === 'settings' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
          onClick={() => handleTabChange('settings')}
        >
          Settings
        </button>
        <button
          className={`pb-2 px-4 font-medium text-lg border-b-2 transition-colors duration-150 ${activeTab === 'contributors' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
          onClick={() => handleTabChange('contributors')}
        >
          Contributors
        </button>
        <button
          className={`pb-2 px-4 font-medium text-lg border-b-2 transition-colors duration-150 ${activeTab === 'personas' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
          onClick={() => handleTabChange('personas')}
        >
          Personas
        </button>
      </div>
      <div>
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'contributors' && (
          <ContributorsDirectoryView 
            selectedContributor={selectedContributor}
            onSelectContributor={handleContributorSelect}
          />
        )}
        {activeTab === 'personas' && <PersonasDirectoryView />}
      </div>
    </div>
  )
}

export default ProjectView
