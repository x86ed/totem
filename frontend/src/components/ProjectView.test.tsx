/// <reference types="vitest" />

import { render, screen, fireEvent } from '@testing-library/react'
import ProjectView from './ProjectView'

describe('ProjectView', () => {
  it('renders Project Overview heading', () => {
    render(<ProjectView />)
    expect(screen.getByText(/Project Overview/i)).toBeInTheDocument()
  })

  it('shows Settings tab by default', () => {
    render(<ProjectView />)
    expect(screen.getByText(/Project Settings/i)).toBeInTheDocument()
    expect(screen.getByText(/Settings for your project will appear here/i)).toBeInTheDocument()
  })

  it('switches to Collaborators tab', () => {
    render(<ProjectView />)
    fireEvent.click(screen.getByRole('button', { name: /Collaborators/i }))
    // Heading for Collaborators
    expect(screen.getByRole('heading', { name: /Collaborators/i, level: 3 })).toBeInTheDocument()
    expect(screen.getByText(/Manage project collaborators here/i)).toBeInTheDocument()
  })

  it('switches to Personas tab', () => {
    render(<ProjectView />)
    fireEvent.click(screen.getByRole('button', { name: /Personas/i }))
    // Heading for Personas
    expect(screen.getByRole('heading', { name: /Personas/i, level: 3 })).toBeInTheDocument()
    expect(screen.getByText(/Define and manage project personas here/i)).toBeInTheDocument()
  })
})
