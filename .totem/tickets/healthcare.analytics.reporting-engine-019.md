```yaml
id: healthcare.analytics.reporting-engine-019
status: in-progress
priority: low
complexity: m
persona: Product-Proteus
blocked_by:
  - healthcare.backend.api-gateway-016
start_time: -1
end_time: -1
```

# Scheduled Report Delivery

Enable automated delivery of reports via email on a set schedule.

## Acceptance Criteria

- [ ] Schedule report delivery (daily/weekly/monthly)
- [ ] Email PDF/CSV attachments
- [ ] Manage delivery recipients
- [ ] 90% test coverage

## Implementation Notes

- Use cron jobs for scheduling
- Integrate with email service
- Add UI for managing schedules

### Risks

- Email deliverability (medium)
- Missed schedules (low)
- Attachment size limits (low)

---
