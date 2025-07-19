```yaml
id: healthcare.security.auth-sso-007
status: open
priority: medium
complexity: l
persona: Security-Sasha
blocks: [patient-dashboard-009]
blocked_by: [ad-integration-005]
```

# SSO Password Policy Enforcement

Enforce password complexity and rotation policy for all SSO users.

## Acceptance Criteria

- [ ] Password complexity rules
- [ ] Password rotation every 90 days
- [ ] 90% test coverage
- [ ] Security review

## Implementation Notes

```javascript
// Add password policy checks in /src/auth/password-policy
// Notify users before expiration
```

### Risks

- User frustration (medium)
- Increased support tickets (low)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-009]: ./tickets/healthcare.frontend.patient-dashboard-009.md
[ad-integration-005]: ./tickets/healthcare.infrastructure.ad-integration-005.md
