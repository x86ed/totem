import { useState, useEffect } from 'react'
import KanbanBoard from './components/KanbanBoard'
import RoadmapView from './components/RoadmapView'
import BacklogView from './components/BacklogView'
import CreateTicket from './components/CreateTicket'
import ExportView from './components/ExportView'
import { TicketProvider } from './context/TicketContext'
import { TabConfig } from './types'
import './App.css'

/**
 * Main application component that provides the overall layout and navigation
 * 
 * Features:
 * - Tab-based navigation between different views (Kanban, Roadmap, Backlog, Ticket, Export)
 * - Deep linking support for individual tickets and ticket modes
 * - Responsive header with application branding
 * - Context provider for ticket management state
 * - Green-themed styling with custom background
 * 
 * URL Structure:
 * - /kanban - Kanban board view
 * - /roadmap - Roadmap view
 * - /backlog - Backlog data table view
 * - /ticket - Create new ticket
 * - /ticket/create - Create new ticket (explicit)
 * - /ticket/edit/:id - Edit existing ticket
 * - /ticket/view/:id - View ticket (read-only)
 * - /export - Export view
 * 
 * @returns The main application component with navigation and content areas
 */
function App() {
  const [activeTab, setActiveTab] = useState<string>('kanban')
  const [ticketMode, setTicketMode] = useState<'create' | 'edit' | 'view'>('create')
  const [ticketId, setTicketId] = useState<string | null>(null)

  // Parse URL and set initial state
  useEffect(() => {
    const parseUrl = () => {
      const hash = window.location.hash.slice(1) || 'kanban'
      const segments = hash.split('/')
      
      if (segments[0] === 'ticket') {
        setActiveTab('ticket')
        
        if (segments[1] === 'create') {
          setTicketMode('create')
          setTicketId(null)
        } else if (segments[1] === 'edit' && segments[2]) {
          setTicketMode('edit')
          setTicketId(segments[2])
        } else if (segments[1] === 'view' && segments[2]) {
          setTicketMode('view')
          setTicketId(segments[2])
        } else {
          // Default to create mode for /ticket
          setTicketMode('create')
          setTicketId(null)
        }
      } else {
        setActiveTab(segments[0])
        setTicketMode('create')
        setTicketId(null)
      }
    }

    parseUrl()
    
    // Listen for hash changes
    window.addEventListener('hashchange', parseUrl)
    return () => window.removeEventListener('hashchange', parseUrl)
  }, [])

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    window.location.hash = `#${tabId}`
  }

  // Navigation helpers
  const navigateToTicket = (mode: 'create' | 'edit' | 'view', id?: string) => {
    if (mode === 'create') {
      window.location.hash = '#ticket/create'
    } else if (id) {
      window.location.hash = `#ticket/${mode}/${id}`
    }
  }

  const tabs: TabConfig[] = [
    { id: 'kanban', label: 'Kanban', icon: '📋' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
    { id: 'backlog', label: 'Backlog', icon: '📊' },
    { id: 'ticket', label: 'Ticket', icon: '🎟️' },
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
                    onClick={() => handleTabChange(tab.id)}
                    className={`nav-btn-green ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <span className="icon-spacing">{tab.icon}</span>
                    {tab.label}
                    {tab.id === 'ticket' && ticketMode !== 'create' && (
                      <span className="ml-1 text-xs opacity-75">
                        ({ticketMode})
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeTab === 'kanban' && <KanbanBoard />}
          {activeTab === 'roadmap' && <RoadmapView />}
          {activeTab === 'backlog' && <BacklogView onNavigateToTicket={navigateToTicket} />}
          {activeTab === 'ticket' && (
            <CreateTicket 
              mode={ticketMode}
              ticketId={ticketId}
              onNavigate={navigateToTicket}
            />
          )}
          {activeTab === 'export' && <ExportView />}
        </main>
      </div>
    </TicketProvider>
  )
}

export default App
