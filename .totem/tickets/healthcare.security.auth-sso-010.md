
```yaml
id: healthcare.frontend.patient-dashboard-012
status: open
priority: medium
complexity: m
persona: Security-Sasha
blocks: []
blocked_by: []
scheduling:
  start_time: -1
  end_time: -1
```


# SSO Consent Management

Add consent screen for SSO users to approve data sharing with third-party apps.

## Acceptance Criteria

- [ ] Consent screen before data sharing
- [ ] Audit consent logs
- [ ] 90% test coverage
- [ ] Security review

## Implementation Notes

```javascript
// Add /src/components/ConsentScreen
// Log all consent actions
```

### Risks

- User confusion (low)
- Incomplete audit trail (medium)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-012]: ./tickets/healthcare.frontend.patient-dashboard-012.md
