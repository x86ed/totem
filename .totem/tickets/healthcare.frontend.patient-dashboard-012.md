```yaml
id: healthcare.frontend.patient-dashboard-012
contributor: The Laughing Man
status: open
priority: high
complexity: h
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-016]
blocked_by: [healthcare.security.auth-sso-007]
scheduling:
  start_time: -1
  end_time: -1
```

# Dashboard Security Alerts

Display security alerts and recommendations to users based on account activity and risk.


## Acceptance Criteria
- [ ] Security alert component
- [ ] Risk-based alert logic
- [ ] 95% test coverage
- [ ] Alert dismissal and logging

## Implementation Notes

```typescript
// Use /src/components/SecurityAlert
// Integrate with risk scoring API
// Log alert dismissals
```

### Risks

- Alert fatigue (medium)
- Missed critical alerts (high)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.security.auth-sso-007]: ./tickets/healthcare.security.auth-sso-007.md
[healthcare.mobile.app-sync-016]: ./tickets/healthcare.mobile.app-sync-016.md
