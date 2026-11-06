<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- This app is the isolated `platform-admin` (JURIDO SuperAdmin) frontend; never import code from other JURIDO apps. Why: each app ships with its own version and deploy.
- All data comes from typed fixtures + the mock store in `src/features/demo/`; screens never call providers directly. Why: the mock adapter will be swapped for a real versioned API later without rewriting screens.
- Role gating in `src/features/demo/roles.ts` is demo-only, not security. Why: real auth/authorization is a later server-side phase.
- Keep shared table search and CSV transformation helpers browser-safe in the demo feature and export explicit column values when provided. Why: every screen should have consistent filtering and faithful, spreadsheet-safe exports.
