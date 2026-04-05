# Repository Agent Rules

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Vendor / Synced Files — Do Not Edit

- `src/components/ui/` contains shadcn-generated component code only (no business logic files).
- **MUST NOT** edit shadcn-generated files manually (`src/components/ui/**`, `src/hooks/use-mobile.ts`). Update `src/components/ui/` only via `npx shadcn@latest add ...` (including `--diff` / `--overwrite`).
- `src/lib/themes/tweakcn-presets.ts` is synced from
  [tweakcn](https://github.com/jnsahaj/tweakcn/blob/main/utils/theme-presets.ts).
  Local edits will be overwritten on next sync.
