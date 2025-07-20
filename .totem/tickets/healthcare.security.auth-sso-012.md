
```yaml
id: healthcare.frontend.patient-dashboard-014
status: done
priority: medium
complexity: m
persona: Security-Sasha
blocks: []
blocked_by: [healthcare.infrastructure.ad-integration-007]
scheduling:
  start_time: -1
  end_time: -1
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
[healthcare.infrastructure.ad-integration-007]: ./tickets/healthcare.infrastructure.ad-integration-007.md
