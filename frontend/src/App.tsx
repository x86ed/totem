import { useState } from 'react'
import KanbanBoard from './components/KanbanBoard'
import RoadmapView from './components/RoadmapView'
import CreateTicket from './components/CreateTicket'
import ExportView from './components/ExportView'
import { TicketProvider } from './context/TicketContext'
import { TabConfig } from './types'
import './App.css'

/**
 * Main application component that provides the overall layout and navigation
 * 
 * Features:
 * - Tab-based navigation between different views (Kanban, Roadmap, Create Ticket, Export)
 * - Responsive header with application branding
 * - Context provider for ticket management state
 * - Green-themed styling with custom background
 * 
 * @returns The main application component with navigation and content areas
 */
function App() {
  const [activeTab, setActiveTab] = useState<string>('kanban')

  const tabs: TabConfig[] = [
    { id: 'kanban', label: 'Kanban', icon: '📋' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
    { id: 'create', label: 'Create Ticket', icon: '➕' },
    { id: 'export', label: 'Export', icon: '📁' }
  ]

  return (
    <TicketProvider>
      <div className="min-h-screen" style={{ background: '#f0f4f1' }}>
        <header className="header-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <span className="icon-spacing text-2xl">🎯</span>
                <h1 className="text-2xl font-bold" style={{ color: '#e8f5e8' }}>
                  Totem
                </h1>
              </div>
              <nav className="flex space-x-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-btn-green ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <span className="icon-spacing">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeTab === 'kanban' && <KanbanBoard />}
          {activeTab === 'roadmap' && <RoadmapView />}
          {activeTab === 'create' && <CreateTicket />}
          {activeTab === 'export' && <ExportView />}
        </main>
      </div>
    </TicketProvider>
  )
}

export default App
