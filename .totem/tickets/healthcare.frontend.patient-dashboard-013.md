```yaml
id: healthcare.frontend.patient-dashboard-011
contributor: Octocat
status: open
priority: medium
complexity: m
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-017]
blocked_by: []
scheduling:
  start_time: -1
  end_time: -1
```

# Dashboard Appointment Calendar

Integrate a calendar view for upcoming and past appointments. Sync with backend scheduling API.


## Acceptance Criteria
- [ ] Calendar component
- [ ] Sync with scheduling API
- [ ] Color-coded appointment types
- [ ] 90% test coverage

## Implementation Notes

```typescript
// Use /src/components/AppointmentCalendar
// Integrate with /api/schedule
// Color-code by appointment type
```

### Risks

- Calendar sync errors (medium)
- UI clutter (low)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.mobile.app-sync-017]: ./tickets/healthcare.mobile.app-sync-017.md
