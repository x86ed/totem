```yaml
id: healthcare.frontend.patient-dashboard-011
status: open
priority: low
complexity: l
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-015]
blocked_by: [healthcare.security.auth-sso-006]
```

# Dashboard User Feedback Widget

Add a feedback widget for users to submit comments and bug reports directly from the dashboard.

## Acceptance Criteria

- [ ] Feedback form UI
- [ ] Submit feedback to backend
- [ ] Confirmation message on submit
- [ ] 90% test coverage

## Implementation Notes

```typescript
// Use /src/components/FeedbackWidget
// Store feedback in /api/feedback
// Notify support team on new feedback
```

### Risks

- Spam/abuse (medium)
- Low response rate (low)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.security.auth-sso-006]: ./tickets/healthcare.security.auth-sso-006.md
[healthcare.mobile.app-sync-015]: ./tickets/healthcare.mobile.app-sync-015.md
