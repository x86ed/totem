import React, { useState } from 'react'
import ContributorsDirectoryView from './ContributorsDirectoryView'
import PersonasDirectoryView from './PersonasDirectoryView'
import SettingsView from './SettingsView'

/**
 * ProjectView - A placeholder for project-level settings, info, or dashboard.
 */
function ProjectView() {
  const [activeTab, setActiveTab] = useState<'settings' | 'contributors' | 'personas'>('settings')

  return (
    <div className="project-view">
      <h2 className="text-2xl font-bold mb-6">Project Overview</h2>
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          className={`pb-2 px-4 font-medium text-lg border-b-2 transition-colors duration-150 ${activeTab === 'settings' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`pb-2 px-4 font-medium text-lg border-b-2 transition-colors duration-150 ${activeTab === 'contributors' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
          onClick={() => setActiveTab('contributors')}
        >
          Contributors
        </button>
        <button
          className={`pb-2 px-4 font-medium text-lg border-b-2 transition-colors duration-150 ${activeTab === 'personas' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
          onClick={() => setActiveTab('personas')}
        >
          Personas
        </button>
      </div>
      <div>
        {activeTab === 'settings' && (
          <SettingsView />
        )}
        {activeTab === 'contributors' && (
          <ContributorsDirectoryView />
        )}
        {activeTab === 'personas' && (
          <PersonasDirectoryView />
        )}
      </div>
    </div>
  )
}

export default ProjectView
