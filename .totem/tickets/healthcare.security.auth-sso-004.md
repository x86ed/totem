```yaml
id: healthcare.security.auth-sso-004
status: open
priority: low
complexity: l
persona: Security-Sasha
blocks: [patient-dashboard-006]
blocked_by: []
scheduling:
  start_time: -1
  end_time: -1
```

# SSO Session Timeout Banner

Display a warning banner 2 minutes before SSO session expiration. Allow users to extend session if active.

## Acceptance Criteria

- [ ] Banner appears 2 minutes before timeout
- [ ] Extend session button works
- [ ] Banner disappears on session renewal
- [ ] 90% test coverage

## Implementation Notes

```javascript
// Use /src/components/SessionTimeoutBanner
// Integrate with SSO session state
```

### Risks

- Banner ignored by users (low)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-006]: ./tickets/healthcare.frontend.patient-dashboard-006.md
