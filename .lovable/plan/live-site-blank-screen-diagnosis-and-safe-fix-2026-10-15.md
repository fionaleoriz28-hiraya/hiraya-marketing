# Live site blank screen: diagnosis and safe fix

## Root cause (confirmed by inspection)

The live site's browser code was built **without** the backend address and public key. Your app code is fine.

Evidence:
- The live script bundle (index + client chunk) contains no backend project reference and no publishable key. The browser console on the live site shows the "Missing ... environment variable" error from the client setup code.
- The browser setup code (auto-generated, unchanged) reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`. Vite bakes these in **at build time**. In the browser the fallback to server-side values is always empty, so a build without the VITE values always goes blank.
- In the preview, the values come from the local `.env` file. That file is ignored by git (`.gitignore` lists `.env`), so it is never part of what the publish build or GitHub sees.
- The live build is meant to get these values from the Lovable Cloud connection. That binding is not reaching the publish build. Refreshing the connection only updated the preview workspace, and two publishes after the refresh (Oct 14) still produced bundles with no backend values.
- Your backend itself is healthy (database and auth reachable). No data or database problem is involved.
- Contributing risk: `.env.example` and `render.yaml` in the repo point at a **different** backend project. Earlier GitHub commits deleted or replaced the env setup. This suggests the GitHub sync once changed how the project's environment was set up.

Newer features are live (the specialist dashboard, booking dialog, welcome tour and reply alerts are all in the live bundle). Only the backend settings are missing.

## Can it be fixed without code changes?

Probably yes, but only from Lovable's side. You cannot set these values yourself: names starting with `VITE_` and `SUPABASE_` are reserved, and attempts to set them are refused. A fix with no code change needs the managed Cloud binding to reach the publish build again.

## Safe steps (no code, no database changes, no publishing)

1. Open Connectors, then Lovable Cloud, and check that this project shows as connected to its existing backend. Do not disconnect or recreate anything.
2. Contact Lovable support with: "Published build of hiraya-marketing.lovable.app is missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY at build time. Preview is fine, the Cloud backend is healthy, and rebinding refreshed only the sandbox." Ask them to rebind the managed build environment to the existing backend.
3. After they confirm, publish once (only when you approve). Then I check the live bundle for the backend values and confirm the home page loads.

## Fallback if support can't fix it (needs your approval, code change)

The goal is to keep keys out of source code. Instead of reading the values at build time, the browser would get them **at runtime**: a small server function reads the server-side values from the managed environment and hands the browser only the public address and public key. Rules for this fallback:
- Done on an isolated draft/branch first, never on your GitHub main.
- No keys or URLs written into any file.
- The generated backend client file is not edited. Instead, a thin wrapper is added and checked in the draft preview before anything merges.

I'll wait for your go-ahead before taking any action.

## Also recommended (separate, your call)
- Remove or correct `.env.example` and `render.yaml`, which point at a different backend project, so future GitHub commits don't reintroduce wrong settings.
