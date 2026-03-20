# AGENTS.md — Guidelines for Coding Agents

## Project Overview

Vanilla Web Components app built with **Vite 5** and **TypeScript 5** (strict mode). No framework — uses native `HTMLElement` + Shadow DOM. Fetches data from the PokeAPI.

## Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc`) then bundle (`vite build`) |
| `npm run preview` | Preview production build locally |
| `npx eslint src/` | Lint source files (no npm script — run directly) |
| `npx tsc --noEmit` | Type-check without emitting |

**Testing:** No test framework is installed. If you add tests, prefer Vitest (Vite-native) and add a `"test": "vitest"` script to `package.json`. Run a single test with `npx vitest run path/to/file.test.ts`.

## Project Structure

```
src/
  main.ts              Entry point — fetches data, assigns to component
  style.css            Global styles
  vite-env.d.ts        Vite client types
  components/
    PokeList.ts        The sole Web Component + exported types
index.html             HTML shell, loads script modules
vite.config.ts         Vite config (enables top-level await)
tsconfig.json          TypeScript strict config (ESNext target, noEmit)
.eslintrc.json         ESLint with @typescript-eslint/recommended
```

## Architecture

### Data Flow
1. `main.ts` fetches data from the PokeAPI using `fetchPokemonPage()`
2. Fetched data is typed via `PokemonList` interface (defined in `PokeList.ts`)
3. Data is assigned to the `<poke-list>` component via its `data` setter
4. The setter triggers `render()`, which re-creates `shadowRoot.innerHTML`

### Vite Configuration
- `vite.config.ts` enables top-level `await` via `esbuild.supported`
- Top-level `await` is used in `main.ts` to fetch data at module scope
- `tsc` is used only for type-checking (`noEmit: true`); Vite handles bundling

### Adding New Components
1. Create a new `.ts` file in `src/components/`
2. Define types for the component's data in the same file (exported)
3. Extend `HTMLElement`, attach Shadow DOM in constructor
4. Use getter properties for styles and template (`get styles()`, `get template()`)
5. Register with `customElements.define()` at module scope
6. Add a `<script type="module">` tag in `index.html`
7. Use the custom element tag in `index.html`

## Code Style

### General
- **2-space indentation** throughout (TS, CSS, HTML)
- **Double quotes** for strings (no single quotes)
- **Trailing commas** in multi-line objects, arrays, and parameter lists
- **Semicolons** always required
- No auto-formatter is configured — match existing style manually

### TypeScript
- `strict: true` is enabled — all strict checks are on (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`)
- Target is `ESNext`; use modern JS/TS features freely (top-level `await`, `#` private fields, etc.)
- Include `.ts` extensions in import paths: `import { PokeList } from "./components/PokeList.ts"`
- Use **named exports** exclusively — no default exports
- Define types/interfaces in the same file as the component that uses them; export them for reuse
- Use `export type` for pure type definitions, `export class` for classes
- Prefer **`#` private class fields** over `_` prefixed properties
- Use **getter properties** for computed template/style strings (`get styles()`, `get template()`)
- Generic functions use explicit type parameters: `fetchPokemonList<TResponse>(page: number)`
- Type assertions with `as` are acceptable (e.g., `as PokeList`)

### Naming Conventions
| Kind | Convention | Example |
|------|-----------|---------|
| Component classes | PascalCase | `PokeList` |
| Type aliases / interfaces | PascalCase | `PokemonList`, `NamedEntry` |
| Variables, functions, methods | camelCase | `fetchPokemonPage`, `pokemonList` |
| Private class fields | `#` + camelCase | `#page`, `#data` |
| Custom element tags | kebab-case | `"poke-list"` |
| CSS classes (in Shadow DOM) | snake_case | `button_container`, `list_item` |

### Web Components
- Extend `HTMLElement` directly — no base class wrappers
- Attach Shadow DOM in constructor: `this.attachShadow({ mode: "open" })`
- Inline CSS as a string returned by a `get styles()` getter
- Inline HTML as a string returned by a `get template()` getter
- Render via `shadowRoot.innerHTML = \`${this.styles}${this.template}\``
- Register elements at module scope: `customElements.define("poke-list", PokeList)`
- Use `/*css*/` and `/*html*/` tagged-comment prefixes for syntax highlighting in template literals

### CSS (Shadow DOM)
- All component styles live inside Shadow DOM (in `get styles()` getter)
- Global styles go in `src/style.css` and are imported in `main.ts`
- Use relative units (`em`, `rem`, `vh`, `vw`) over fixed `px` where practical
- CSS classes use snake_case: `button_container`, `list_item`
- Prefix related classes: `navigation_button`, `button_previous`, `button_next`

### Error Handling
- Wrap async fetch calls in `try/catch`
- Log errors with `console.error(\`Error: ${error}\`)` then re-throw
- Null-check shadow root before rendering: `if (this.shadowRoot != null)`

### Imports & Modules
- Import from relative paths with `.ts` extension
- Group imports: project imports first, then CSS/assets
- Scripts in `index.html` use `type="module"`

### HTML (`index.html`)
- Use `<!doctype html>` (lowercase `doctype`)
- 4-space indentation in HTML
- Script tags at end of `<body>`

## ESLint

Configured in `.eslintrc.json` (legacy format). Extends `eslint:recommended` and `@typescript-eslint/recommended` with no custom rule overrides. Run with `npx eslint src/`.

## Notes for Agents

- Always run `npm run build` (which includes `tsc`) after making changes to verify type correctness.
- Run `npx eslint src/` to check for lint issues before considering work complete.
- The project has no CI, no pre-commit hooks, and no formatter — be disciplined about style.
- When adding new components, follow the pattern in `PokeList.ts`: types in the same file, Shadow DOM, getter-based templates/styles, module-level `customElements.define`.
- Do not introduce runtime dependencies without discussion — the project currently has zero.
- Do not install a framework (React, Vue, Lit, etc.) — this is a vanilla Web Components project.
