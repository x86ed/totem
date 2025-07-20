```yaml
id: healthcare.analytics.reporting-engine-018
status: in-progress
priority: medium
complexity: l
persona: Product-Proteus
blocked_by: [healthcare.backend.api-gateway-015]
scheduling:
  start_time: -1
  end_time: -1
```

# Custom Report Builder

Allow users to create custom reports with drag-and-drop fields and filters.

## Acceptance Criteria

- [ ] Drag-and-drop report builder UI
- [ ] Save and load custom reports
- [ ] Share reports with team
- [ ] 90% test coverage

## Implementation Notes

- Use react-beautiful-dnd for UI
- Store reports in user profile
- Add sharing via email

### Risks

- Complex UI logic (high)
- Data security (medium)
- Feature creep (medium)

---
