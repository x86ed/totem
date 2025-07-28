```yaml
id: healthcare.frontend.patient-dashboard-006
contributor: Zero Cool
status: open
priority: low
complexity: m
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-010]
blocked_by: []
scheduling:
  start_time: -1
  end_time: -1
```

# Dashboard Language Localization

Support multiple languages for all dashboard UI and content. Must be switchable at runtime.

## Acceptance Criteria
- [ ] Language selector component
- [ ] All UI strings translatable
- [ ] RTL language support
- [ ] 90% test coverage

## Implementation Notes

```typescript
// Use i18next for localization
// Store language preference in user profile
// Test with Spanish and Arabic
```

### Risks

- Incomplete translations (medium)
- Layout issues with RTL (low)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.mobile.app-sync-010]: ./tickets/healthcare.mobile.app-sync-010.md
