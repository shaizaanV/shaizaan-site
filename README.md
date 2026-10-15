# shaizaan.com

My portfolio, built as a retro desktop OS called **Shaizintosh**. Vite + React + TypeScript, deployed to GitHub Pages on every push to `main`.

## Run it

```sh
npm install
npm run dev      # local dev server (draft projects show up here)
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

## Adding content

Everything you'd normally edit lives in `src/content/`. Each file has comments explaining its fields.

| To add…                      | Edit                          | Notes |
| ---------------------------- | ----------------------------- | ----- |
| A project                    | `src/content/projects.ts`     | Copy a sample, fill it in, delete `draft: true`. Screenshots go in `public/` (`image: "/shot.png"` + `imageAlt`). Shareable at `shaizaan.com/#projects/<slug>`. |
| A YouTube video              | `src/content/videos.ts`       | Just the id from `watch?v=…` and a title. ShaizTV switches from "compiling" to the full TV page automatically. |
| A Spotify link / new song    | `src/content/tracks.ts`       | Paste a link into `spotify` and a button appears. |
| Bio text                     | `src/content/about.ts`        | One string per paragraph. |
| A skill                      | `src/content/skills.ts`       | `icon` is the short code shown in the slot. |
| Interests                    | `src/content/interests.ts`    | One log per tab. |
| Socials / email              | `src/content/socials.ts`      | Used by the socials island, Mail and ShaizTV. |
| Boot screen jokes            | `src/os/BootScreen.tsx`       | `JOKES` list near the top. |
| Chiptune songs               | `src/os/songs.ts`             | Notes are `[step, note, length]` in 16th-note steps. |

## How it's put together

- `src/os/` is the operating system: window manager (`windowStore.tsx`, `Window.tsx`), desktop, taskbar, boot screen, sound engine, desk chicken, and `eggs/` (easter eggs).
- `src/apps/` holds one component per app. `registry.ts` lists every app (icon, window size, desktop/Start menu visibility). To add an app, add its id to `AppId` and an entry to `apps`.
- `src/theme/` holds the Matcha palette (`tokens.css`) and the OS styles.
- Pixel icons are 12×12 text grids in `src/os/icons.ts`.

## Easter eggs

Konami code · type "matcha" · backtick (\`) terminal · old_site.zip in the Trash · drag a window onto the Trash · wait a minute · a broken `#link`.
