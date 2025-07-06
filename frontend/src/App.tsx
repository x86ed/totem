import { useState, useEffect } from 'react'
import KanbanBoard from './components/KanbanBoard'
import RoadmapView from './components/RoadmapView'
import BacklogView from './components/BacklogView'
import CreateTicket from './components/CreateTicket'
import DemoView from './components/DemoView'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

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
    { id: 'export', label: 'Demo', icon: '🎨' }
  ]

  return (
    <TicketProvider>
      <div className="min-h-screen flex" style={{ background: '#f0f4f1' }}>
        {/* Sidenav */}
        <nav className={`sidenav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidenav-header">
            <h1 className="sidenav-title">totem</h1>
          </div>
          <div className="sidenav-items">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  handleTabChange(tab.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`sidenav-item ${activeTab === tab.id ? 'active' : ''}`}
                title={tab.label}
              >
                <span className="sidenav-icon">{tab.icon}</span>
                <span className="sidenav-label">{tab.label}</span>
                {tab.id === 'ticket' && ticketMode !== 'create' && (
                  <span className="sidenav-badge">
                    {ticketMode}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="main-content">
          <header className="top-header">
            <button
              className="mobile-menu-toggle md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
            <h1 className="header-title">totem</h1>
          </header>

          <main className="content-area">
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
            {activeTab === 'export' && <DemoView />}
          </main>
        </div>
      </div>
    </TicketProvider>
  )
}

export default App
