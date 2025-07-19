```yaml
id: healthcare.security.auth-sso-002
status: open
priority: medium
complexity: l
persona: Security-Sasha
blocks: [patient-dashboard-004]
blocked_by: [ad-integration-002]
```

# OAuth2 Integration for Mobile App

Enable secure OAuth2 login for mobile patient app. Must support refresh tokens and device revocation.

## Acceptance Criteria
- [x] OAuth2 login flow implemented
- [ ] Device revocation endpoint
- [ ] Refresh token rotation
- [ ] 90% test coverage
- [ ] Security review sign-off

## Implementation Notes
```javascript
// Use OAuth2Provider in /src/auth/
// Ensure device tokens are unique per device
// Add endpoint for device revocation
```

### Risks

- Token leakage risk (medium)
- Mobile device loss (high)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-004]: ./tickets/healthcare.frontend.patient-dashboard-004.md
[ad-integration-002]: ./tickets/healthcare.infrastructure.ad-integration-002.md
