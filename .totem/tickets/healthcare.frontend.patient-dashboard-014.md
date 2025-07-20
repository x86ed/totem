```yaml
id: healthcare.frontend.patient-dashboard-012
contributor: Acid Burn
status: open
priority: low
complexity: l
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-018]
blocked_by: [healthcare.security.auth-sso-008]
scheduling:
  start_time: -1
  end_time: -1
```

# Dashboard Medication Reminders

Add medication reminder notifications and tracking to the dashboard.


## Acceptance Criteria
- [ ] Reminder notification UI
- [ ] Mark as taken/skipped
- [ ] 90% test coverage

## Implementation Notes

```typescript
// Use /src/components/MedicationReminder
// Integrate with /api/medications
// Track adherence in user profile
```

### Risks

- Missed reminders (medium)
- Notification fatigue (low)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.security.auth-sso-008]: ./tickets/healthcare.security.auth-sso-008.md
[healthcare.mobile.app-sync-018]: ./tickets/healthcare.mobile.app-sync-018.md
