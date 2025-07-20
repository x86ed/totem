```yaml
id: healthcare.analytics.reporting-engine-031
status: open
priority: high
complexity: h
persona: Product-Proteus
blocked_by: [healthcare.backend.api-gateway-028]
scheduling:
  start_time: -1
  end_time: -1
```

# Data Retention Policy Reports

Generate reports on data retention, archival, and deletion compliance.

## Acceptance Criteria

- [ ] List data retention status by dataset
- [ ] Export retention compliance reports
- [ ] 95% test coverage

## Implementation Notes

- Integrate with data lifecycle management
- Add compliance widgets to dashboard

### Risks

- Missed retention deadlines (high)
- Regulatory penalties (high)
- Data loss (medium)

---
