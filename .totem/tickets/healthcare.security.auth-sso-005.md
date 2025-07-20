
```yaml
id: healthcare.frontend.patient-dashboard-007
status: open
priority: high
complexity: h
persona: Security-Sasha
blocks: []
blocked_by: [healthcare.infrastructure.ad-integration-004]
scheduling:
  start_time: -1
  end_time: -1
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
[healthcare.infrastructure.ad-integration-004]: ./tickets/healthcare.infrastructure.ad-integration-004.md
