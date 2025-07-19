```yaml
id: healthcare.security.auth-sso-012
status: open
priority: medium
complexity: m
persona: Security-Sasha
blocks: [patient-dashboard-014]
blocked_by: [ad-integration-007]
```

# SSO API Access Tokens

Issue scoped API access tokens for third-party integrations via SSO.

## Acceptance Criteria

- [ ] API token issuance endpoint
- [ ] Scope selection for tokens
- [ ] 90% test coverage
- [ ] Security review

## Implementation Notes

```javascript
// Add /api/sso/token endpoint
// Enforce scope checks
```

### Risks

- Token misuse (medium)
- Scope escalation (low)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-014]: ./tickets/healthcare.frontend.patient-dashboard-014.md
[ad-integration-007]: ./tickets/healthcare.infrastructure.ad-integration-007.md
