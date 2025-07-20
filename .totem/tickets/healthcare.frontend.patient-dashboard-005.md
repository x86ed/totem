```yaml
id: healthcare.frontend.patient-dashboard-003
contributor: Clippy
status: open
priority: medium
complexity: xxl
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-009]
blocked_by: [healthcare.security.auth-sso-003]
scheduling:
  start_time: -1
  end_time: -1
```

# Dashboard Theme Customization

Allow users to select light/dark mode and custom color themes. Persist preferences across devices.


## Acceptance Criteria
- [ ] Theme selector component
- [ ] Preference persistence (localStorage & cloud)
- [ ] WCAG 2.1 AA color contrast
- [ ] 90% test coverage

## Implementation Notes

```typescript
// Use /src/components/ThemeSelector
// Store preferences in user profile API
// Use CSS variables for theming
```

### Risks

- Theme conflicts with branding (low)
- User confusion (low)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.security.auth-sso-003]: ./tickets/healthcare.security.auth-sso-003.md
[healthcare.mobile.app-sync-009]: ./tickets/healthcare.mobile.app-sync-009.md
