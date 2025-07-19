```yaml
id: healthcare.security.auth-sso-011
status: open
priority: low
complexity: l
persona: Security-Sasha
blocks: [patient-dashboard-013]
blocked_by: []
```

# SSO User Self-Service Portal

Allow users to view and manage their SSO sessions and devices.

## Acceptance Criteria

- [ ] List active sessions/devices
- [ ] Allow session/device revocation
- [ ] 90% test coverage

## Implementation Notes

```javascript
// Use /src/components/SelfServicePortal
// Integrate with SSO session/device APIs
```

### Risks

- User error (low)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-013]: ./tickets/healthcare.frontend.patient-dashboard-013.md
