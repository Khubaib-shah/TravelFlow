# Travelflow TODO

## Quotations UI + routing fixes

- [x] Fix quotation detail navigation (“Route not found”) by aligning push URL with Next.js app router paths.

- [ ] Implement quotations _view mode_ drawer
  - [ ] Update `components/quotations/QuotationDrawer.tsx` to support `mode="view"` (read-only, cross + Edit + Create actions)
  - [ ] Update `app/(dashboard)/quotations/page.tsx` to open the view-mode drawer when clicking row **View** action (instead of routing)
  - [ ] Ensure **Edit** opens edit mode prefilled, **Create** opens create mode blank

- [ ] Run quick manual test for: create quotation, view in drawer, edit from drawer, create from drawer.
