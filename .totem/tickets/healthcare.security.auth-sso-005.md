```yaml
id: healthcare.security.auth-sso-005
status: open
priority: high
complexity: h
persona: Security-Sasha
blocks: [patient-dashboard-007]
blocked_by: [ad-integration-004]
```

# SSO Audit Log Export

Enable export of SSO audit logs in CSV and JSON formats. Only accessible to admins.

## Acceptance Criteria

- [ ] Export endpoint for logs
- [ ] CSV and JSON format support
- [ ] Access control for admin only
- [ ] 95% test coverage
- [ ] Security review

## Implementation Notes

```javascript
// Add /api/audit/export endpoint
// Use role-based access control
// Log export actions
```

### Risks

- Data leakage (high)
- Export performance (medium)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-007]: ./tickets/healthcare.frontend.patient-dashboard-007.md
[ad-integration-004]: ./tickets/healthcare.infrastructure.ad-integration-004.md
