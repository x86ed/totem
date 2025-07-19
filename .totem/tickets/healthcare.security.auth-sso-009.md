```yaml
id: healthcare.security.auth-sso-009
status: open
priority: high
complexity: h
persona: Security-Sasha
blocks: [patient-dashboard-011]
blocked_by: [ad-integration-006]
```

# SSO Brute Force Protection

Implement rate limiting and lockout for repeated failed SSO login attempts.

## Acceptance Criteria

- [ ] Rate limiting on failed logins
- [ ] Account lockout after threshold
- [ ] 95% test coverage
- [ ] Security review

## Implementation Notes

```javascript
// Add rate limiter middleware
// Track failed attempts in DB
```

### Risks

- Lockout of legitimate users (medium)
- Attackers bypassing limits (low)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-011]: ./tickets/healthcare.frontend.patient-dashboard-011.md
[ad-integration-006]: ./tickets/healthcare.infrastructure.ad-integration-006.md
