# Styling Conventions

This project uses a combination of CSS, Tailwind CSS utility classes, and some custom styles for the frontend. Below are the main conventions and recommendations for maintaining and evolving the styling system.

---

## Core Styling Technologies

- **Tailwind CSS**: Used for utility-first styling and responsive design. See `frontend/tailwind.config.js` for configuration.
- **Custom CSS**: Used for component-specific styles and overrides. See files like `App.css`, `SettingsView.css`, and `index.css`.
- **Font**: The primary font is `'Nunito'`, applied globally for a modern, readable look.
- **Theme**: The default theme uses earth tones and green accents for backgrounds, cards, and interactive elements.

---

## Conventions

- **Component Styles**:  
  - Place component-specific CSS in the same folder as the component (e.g., `SettingsView.css` for `SettingsView.tsx`).
  - Use BEM-like or descriptive class names to avoid conflicts.
  - Prefer Tailwind utility classes for layout, spacing, and typography when possible.
- **Global Styles**:  
  - Use `index.css` for global resets, font imports, and Tailwind base layers.
  - Use `App.css` for app-wide layout and typography.
- **Responsive Design**:  
  - Use Tailwind's responsive utilities (`@media` queries) for layout adjustments.
  - Custom CSS should include responsive breakpoints where needed.
- **Dark Mode**:  
  - Not currently implemented. If needed, prefer Tailwind's dark mode utilities for future support.

---

## Recommendations & Cleanup

- **Consolidate Redundant Styles**:  
  - There is some duplication between `.settings-section` styles in `SettingsView.css` and global styles in `index.css`/`App.css`. Consider consolidating these into a single source or using Tailwind utilities to reduce overlap.
- **Deprecate Unused Classes**:  
  - Remove or refactor any unused or duplicate CSS classes, especially in `SettingsView.css` where multiple `.feature-section` and `.prefix-section` rules exist.
- **Prefer Tailwind for New Styles**:  
  - For new components, use Tailwind utility classes as much as possible to ensure consistency and reduce custom CSS bloat.
- **Component Encapsulation**:  
  - Where possible, scope styles to components to avoid global leakage. Consider using CSS Modules or Tailwind's `@apply` for reusable patterns.
- **Accessibility**:  
  - Ensure color contrast meets accessibility standards, especially for badges, buttons, and backgrounds.
- **Remove Legacy/Unused Files**:  
  - Periodically audit CSS files for legacy or unused styles and remove them to keep the codebase clean.

---

## Example: Styling a Component

```tsx
// Example: Using Tailwind and minimal custom CSS
<div className="card-green p-4 rounded-lg shadow-md">
  <h2 className="font-bold text-lg mb-2">Card Title</h2>
  <p className="text-gray-700">Card content goes here.</p>
</div>
```
