```yaml
id: healthcare.security.auth-sso-001
status: open
priority: high
contributor: Acid Burn
status: open
persona: Security-Sasha
blocks: [patient-dashboard-003]
blocked_by: [ad-integration-001]
scheduling:
  start_time: -1
  end_time: -1
```

# SSO Authentication for Patient Portal

HIPAA-compliant SAML/OAuth integration with Active Directory. 15min session timeout, audit logging required.

## Acceptance Criteria
- [x] Corporate credential login
## Implementation Notes
```javascript
// Use SecurityAuthProvider in /src/auth/
// Follow existing token patterns in auth-service
// Implement proper error boundaries
```

### Risks

- Patient data exposure (high)
---
[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-003]: ./tickets/healthcare.frontend.patient-dashboard-003.md
[ad-integration-001]: ./tickets/healthcare.infrastructure.ad-integration-001.md