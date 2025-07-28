```yaml
id: healthcare.analytics.reporting-engine-016
status: in-progress
priority: medium
complexity: m
persona: Product-Proteus
blocked_by: [healthcare.backend.api-gateway-013]
scheduling:
  start_time: -1
  end_time: -1
```

# Real-Time Patient Flow Analytics

Dashboard for monitoring patient admissions, discharges, and transfers in real time.

## Acceptance Criteria

- [ ] Live update of patient flow metrics
- [ ] Filter by department and time range
- [ ] Export to CSV
- [ ] 90% test coverage

## Implementation Notes

- Use WebSocket for real-time updates
- Integrate with EHR API
- Add export button to dashboard

### Risks

- Data latency (medium)
- API rate limits (low)
- UI performance (medium)

---
