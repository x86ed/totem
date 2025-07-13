```yaml
id: healthcare.security.auth-sso-001
status: open
priority: high
complexity: m
persona: security-sasha
blocks: [patient-dashboard-003]
blocked_by: [ad-integration-001]
```

# SSO Authentication for Patient Portal

HIPAA-compliant SAML/OAuth integration with Active Directory. 15min session timeout, audit logging required.

## Acceptance Criteria
- [x] Corporate credential login
- [ ] Failed attempts logged and monitored
- [ ] Token expiration enforced (15min)
- [ ] 95% test coverage
- [ ] Security audit approval

## Implementation Notes
```javascript
// Use SecurityAuthProvider in /src/auth/
// Follow existing token patterns in auth-service
// Implement proper error boundaries
```

### Risks

- Patient data exposure (high)
- AD maintenance downtime (medium)

---

[security-sasha]: ./personas/security-sasha.md
[patient-dashboard-003]: ./tickets/healthcare.frontend.patient-dashboard-003.md
[ad-integration-001]: ./tickets/healthcare.infrastructure.ad-integration-001.md