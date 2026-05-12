---
name: wastegrab-zard-ui
description: "Use when updating WasteGrab frontend UI. Prefer existing Zard UI components over custom CSS for shared shells, navbars, buttons, badges, and cards."
---

# WasteGrab Zard UI

- Prefer Zard UI components for shared frontend surfaces, especially shell navigation and user status areas.
- Avoid adding custom CSS for layout when the existing Zard components and utility classes are enough.
- Check the local component APIs before editing UI code so the selected `z-*` variants stay valid.
- If a needed UI pattern is missing from Zard, add a repo note and keep the implementation minimal.
