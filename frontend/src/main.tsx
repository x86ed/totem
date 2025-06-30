/**
 * @fileoverview Application entry point that initializes and renders the React application
 * 
 * This file serves as the main entry point for the Totem ticket management application.
 * It sets up the React root, applies global styles, and renders the main App component
 * within React.StrictMode for development safety checks.
 * 
 * @version 0.3.4
 * @since 1.0.0
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Main application initialization and rendering logic
 * 
 * Steps performed:
 * 1. Locates the root DOM element with id 'root'
 * 2. Validates that the root element exists (throws error if not found)
 * 3. Creates a React root using the new React 18 createRoot API
 * 4. Renders the App component wrapped in StrictMode for development checks
 * 
 * @throws {Error} When the root DOM element is not found in the document
 */
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
