```yaml
id: healthcare.frontend.patient-dashboard-005
contributor: Octocat
status: open
priority: high
complexity: h
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-011]
blocked_by: [healthcare.security.auth-sso-004]
scheduling:
  start_time: -1
  end_time: -1
```

# Dashboard Data Export

Enable export of dashboard data (labs, vitals, appointments) to CSV and PDF. Only available to patients.

## Acceptance Criteria
- [ ] Export to CSV and PDF
- [ ] Access control for patients only
- [ ] 95% test coverage
- [ ] Export action logged

## Implementation Notes

```typescript
// Use /src/utils/exportData
// Integrate with /src/components/ExportButton
// Log export events in audit log
```

### Risks

- Data privacy (high)
- Export performance (medium)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.security.auth-sso-004]: ./tickets/healthcare.security.auth-sso-004.md
[healthcare.mobile.app-sync-011]: ./tickets/healthcare.mobile.app-sync-011.md
