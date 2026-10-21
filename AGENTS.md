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
- Frontend-only prototype: all data lives in `src/lib/store.tsx` (React Context + localStorage), seeded from `src/data/mock.ts`; no backend until requested.
- Derived values (current weight, attendance, balances, chart series, insights) are computed in `src/lib/calc.ts`, never stored — keeps all screens consistent.
- Create/edit forms for workouts, measurements and transactions open via the store's `openForm` and render once in `FormHost`, so any screen can trigger them.
- tsconfig has `exactOptionalPropertyTypes` and `noPropertyAccessFromIndexSignature` off to keep form/state code simple.
