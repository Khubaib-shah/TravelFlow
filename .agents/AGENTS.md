# UI Component Rules for This Project

This project uses shadcn/ui as the design system.

## Mandatory Rules

1. NEVER create custom Button, Input, Select, Dialog, Sheet, Card, Table, Tabs, DropdownMenu, Form, Checkbox, RadioGroup, Popover, Command, Calendar, Badge, Avatar, Alert, Accordion, Breadcrumb, Pagination, Skeleton, Separator, Tooltip, ScrollArea, or any other UI primitives if an equivalent shadcn/ui component exists.

2. ALWAYS import and use components from:

```tsx
@/components/ui/*
```

3. Before creating any new component, check whether shadcn/ui already provides it.

4. Do not write raw HTML elements such as `<button>`, `<input>`, `<select>`, `<textarea>` unless there is a strong technical reason and it is explicitly documented.

5. For forms, use:
* shadcn Form
* React Hook Form
* Zod validation

6. For data tables, use:
* shadcn Table
* TanStack Table when advanced functionality is needed

7. For modals and drawers, use:
* Dialog
* Sheet
* AlertDialog

8. For navigation and actions, use:
* DropdownMenu
* Menubar
* NavigationMenu
* ContextMenu

9. For feedback states, use:
* Toast/Sonner
* Alert
* Skeleton
* Progress

10. For layout and styling:
* Use Tailwind CSS utilities.
* Do not create custom UI libraries.
* Follow shadcn/ui patterns consistently.

## Component Extraction Rule

If the same UI pattern appears **more than 3 times** across the codebase, extract it into a reusable component under `/components` (not `/components/ui`). Compose it from shadcn primitives — do not rebuild UI from scratch.

Examples: icon buttons, filter selects, table entity links, empty states.

## ERP Project Requirement

This ERP must maintain a single, consistent design system.
Whenever generating code:
* Reuse existing shadcn components.
* Reuse existing project components when available.
* Prefer composition over creating new UI primitives.
* If a component already exists in `/components/ui` or `/components`, use it instead of rebuilding it.

Before outputting code, verify:
"Am I reusing an existing shadcn component rather than creating a new one?"
If yes, proceed. If no, explain why a custom component is required.
