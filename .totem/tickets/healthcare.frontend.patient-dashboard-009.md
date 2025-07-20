```yaml
id: healthcare.frontend.patient-dashboard-007
contributor: The Laughing Man
status: open
priority: high
complexity: m
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-013]
blocked_by: [healthcare.security.auth-sso-005]
scheduling:
  start_time: -1
  end_time: -1
```

# Dashboard Custom Widgets

Allow users to add, remove, and rearrange dashboard widgets. Persist layout per user.


## Acceptance Criteria
- [ ] Widget add/remove UI
- [ ] Drag-and-drop rearrange
- [ ] Layout persistence
- [ ] 90% test coverage

## Implementation Notes

```typescript
// Use react-beautiful-dnd for drag-and-drop
// Store layout in user profile
// Provide default widget set
```

### Risks

- Widget layout bugs (medium)
- User confusion (low)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.security.auth-sso-005]: ./tickets/healthcare.security.auth-sso-005.md
[healthcare.mobile.app-sync-013]: ./tickets/healthcare.mobile.app-sync-013.md
