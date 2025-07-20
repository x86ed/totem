```yaml
id: healthcare.security.auth-sso-003
status: todo
priority: medium
complexity: m
persona: Security-Sasha
blocks:
  - patient-dashboard-005
blocked_by:
  - ad-integration-003
start_time: -1
end_time: -1
```

# Multi-Factor Authentication (MFA) for Staff Portal

Add TOTP-based MFA for all staff logins. Must support backup codes and enforce on all privileged actions.

## Acceptance Criteria

- [ ] TOTP MFA setup and validation
- [ ] Backup code generation and usage
- [ ] MFA required for privileged actions
- [ ] 90% test coverage
- [ ] Security audit approval

## Implementation Notes

```javascript
// Integrate with /src/auth/mfa/
// Use speakeasy for TOTP
// Store backup codes securely
```

### Risks

- MFA device loss (medium)
- User lockout (low)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-005]: ./tickets/healthcare.frontend.patient-dashboard-005.md
[ad-integration-003]: ./tickets/healthcare.infrastructure.ad-integration-003.md
