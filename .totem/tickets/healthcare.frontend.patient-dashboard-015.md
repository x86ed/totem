```yaml
id: healthcare.frontend.patient-dashboard-015
status: open
priority: medium
complexity: m
persona: Product-Proteus
blocks: [healthcare.mobile.app-sync-019]
blocked_by: []
```

# Dashboard Billing & Payments

Integrate billing summary and payment options into the dashboard. Support online payments and download of invoices.

## Acceptance Criteria

- [ ] Billing summary component
- [ ] Online payment integration
- [ ] Download invoice as PDF
- [ ] 90% test coverage

## Implementation Notes

```typescript
// Use /src/components/BillingSummary
// Integrate with /api/billing
// Use Stripe for payments
```

### Risks

- Payment failures (medium)
- Invoice generation errors (low)

---

[Product-Proteus]: ./personas/product-proteus.md
[healthcare.mobile.app-sync-019]: ./tickets/healthcare.mobile.app-sync-019.md
