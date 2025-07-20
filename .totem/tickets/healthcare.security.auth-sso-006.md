
```yaml
id: healthcare.frontend.patient-dashboard-006
status: open
priority: medium
complexity: m
persona: Security-Sasha
blocks: []
blocked_by: []
scheduling:
  start_time: -1
  end_time: -1
```


# SSO User Deactivation Sync

Automatically deactivate SSO accounts when users are removed from Active Directory.

## Acceptance Criteria

- [ ] Detect AD removals
- [ ] Sync deactivation to SSO
- [ ] 90% test coverage
- [ ] Security review

## Implementation Notes

```javascript
// Poll AD for user removals
// Sync with SSO user DB
```

### Risks

- Delay in deactivation (medium)
- False positives (low)

---

[Security-Sasha]: ./personas/security-sasha.md
[patient-dashboard-008]: ./tickets/healthcare.frontend.patient-dashboard-008.md
