```yaml
id: healthcare.security.auth-sso-008
status: open
priority: low
complexity: m
persona: Security-Sasha
blocks: [patient-dashboard-010]
blocked_by: []
```

# SSO Login Analytics Dashboard

Create dashboard for SSO login attempts, failures, and trends. Accessible to security team only.

## Acceptance Criteria

- [ ] Dashboard displays login stats
- [ ] Filter by date and user
- [ ] 90% test coverage
- [ ] Security review

## Implementation Notes

```javascript
// Use /src/components/LoginAnalyticsDashboard
// Query SSO logs for stats
```

### Risks

- Data accuracy (medium)
- Dashboard performance (low)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-010]: ./tickets/healthcare.frontend.patient-dashboard-010.md
