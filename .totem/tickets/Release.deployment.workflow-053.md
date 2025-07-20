```yaml
id: Release.deployment.workflow-053
status: in-progress
priority: medium
complexity: l
persona: Automation-Artemis
blocks:
  - Release.mobile.workflow-060
blocked_by:
  - healthcare.backend.api-gateway-019
start_time: -1
end_time: -1
```

# Major release

This is a major release marking the completion of the baseline stability work of the application

## Acceptance Criteria

- [ ] All blocking tasks are completed
- [ ] No lint or formatting warnings
- [ ] All tests pass
- [ ] Code coverage of all new features is above 90%
- [ ] Repositiory code coverage is above 80%
- [ ] Build completed without errors
- [ ] Major version is bumped and tagged

## Implementation Notes

- we want to be exhaustive
- this must go out before any new feature development stories

### Risks

- Breaking stuff (high)
- Coding for testing over function (medium)

---
