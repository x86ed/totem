```yaml
id: healthcare.analytics.reporting-engine-030
status: in-progress
priority: low
complexity: l
persona: Product-Proteus
blocked_by:
  - healthcare.backend.api-gateway-027
start_time: -1
end_time: -1
```

# Report Scheduling UI

Add a user interface for managing scheduled report deliveries and notifications.

## Acceptance Criteria

- [ ] List and edit scheduled reports
- [ ] Notification preferences
- [ ] 90% test coverage

## Implementation Notes

- Use /src/components/ScheduleManager
- Integrate with scheduling backend

### Risks

- UI complexity (medium)
- Missed notifications (low)

---
