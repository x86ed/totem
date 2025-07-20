```yaml
id: healthcare.analytics.reporting-engine-020
status: blocked
priority: high
complexity: h
persona: Product-Proteus
blocked_by: [healthcare.backend.api-gateway-017]
scheduling:
  start_time: -1
  end_time: -1
```

# Data Quality Dashboard

Visualize data completeness, accuracy, and timeliness for all analytics sources.

## Acceptance Criteria

- [ ] Data quality metrics for all sources
- [ ] Highlight missing/incomplete data
- [ ] Export data quality reports
- [ ] 95% test coverage

## Implementation Notes

- Use data validation scripts
- Add data quality widgets to dashboard
- Export as PDF/CSV

### Risks

- Incomplete source data (high)
- False positives (medium)
- User trust (medium)

---
