# Dialecta — Workflow Reference
*Keep this open until the workflow is muscle memory.*

---

## The Core Rule

| If you are doing this... | Use this tool |
|---|---|
| Designing, deciding, prototyping, spec work | Claude.ai (chat) |
| Editing files, fixing bugs, running builds | Claude Code (terminal) |

---

## Starting Claude Code

Always `cd` to the right repo first. Claude Code reads from wherever you invoke it.

```powershell
# For theme work (JSX, Handlebars, build scripts)
cd C:\dialecta-local\versions\6.28.0\content\themes\dialecta
claude

# For API work (route files, Vercel config)
cd C:\dialecta-api
claude
```

Claude Code reads `CLAUDE.md` on startup automatically. No setup needed per session.

---

## Theme Workflow

### Daily development loop

```powershell
# 1. Start Ghost locally (run from Ghost root, not theme folder)
cd C:\dialecta-local
ghost start

# 2. Go to theme folder
cd C:\dialecta-local\versions\6.28.0\content\themes\dialecta

# 3. Start Claude Code (optional -- for file editing)
claude

# 4. Watch for changes while working on profile
npm run watch:profile

# 5. Preview in browser
# http://localhost:2368
```

### Build commands (from theme folder)

```powershell
npm run build           # build BOTH entry points -- always run before deploy
npm run build:profile   # build profile only (faster during profile work)
npm run watch           # watch index.jsx for changes
npm run watch:profile   # watch dialecta-profile-mount.jsx for changes
```

### Entry points

| Source file | Compiled to | Loaded by |
|---|---|---|
| `src/index.jsx` | `assets/js/bundle.js` | `default.hbs` (sitewide) |
| `src/dialecta-profile-mount.jsx` | `assets/js/profile.js` | `page-profile.hbs` (profile page) |

Never edit `assets/js/bundle.js` or `assets/js/profile.js` directly. They are overwritten on every build.

### Deploy to Magic Pages

```powershell
# Step 1: build everything (from theme folder)
cd C:\dialecta-local\versions\6.28.0\content\themes\dialecta
npm run build

# Step 2: ZIP the theme (from versioned themes folder)
cd C:\dialecta-local\versions\6.28.0\content\themes
Compress-Archive -Path dialecta\* -DestinationPath dialecta-theme.zip -Force

# Step 3: Upload
# Magic Pages dashboard > Design > Upload theme > dialecta-theme.zip
```

Never upload a ZIP without running `npm run build` first.

### Ghost server commands (from `C:\dialecta-local\` only)

```powershell
ghost start     # start local server
ghost stop      # stop
ghost status    # check if running
ghost log       # view logs if something breaks
```

Local URL: `http://localhost:2368`
Admin panel: `http://localhost:2368/ghost`

---

## API Workflow

### Daily development loop

```powershell
# 1. Go to API folder
cd C:\dialecta-api

# 2. Start local API server
vercel dev

# 3. In a second PowerShell window, test routes
# (see test commands below)
```

### Test commands

```powershell
# Test classify route (POST)
$body = @{
    body = "Your test comment here"
    author_id = "test-user"
    article_id = "test-article"
    article_claims = @("Claim one", "Claim two")
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/classify" -Method POST -Body $body -ContentType "application/json"

# Test profile GET (use a real UUID from Supabase)
Invoke-RestMethod -Uri "http://localhost:3000/api/profile/YOUR-UUID-HERE" -Method GET

# Test with dpennington's real UUID
Invoke-RestMethod -Uri "http://localhost:3000/api/profile/16d5b5b2-f9ee-4dda-bad1-949e46d01ff1" -Method GET
```

### Deploy to Vercel

```powershell
# Option 1: via Git (recommended -- auto-deploys on push)
git add .
git commit -m "describe what changed"
git push

# Option 2: manual production deploy
vercel --prod
```

### Environment variables

Stored in two places:
- `C:\dialecta-api\.env.local` -- local development only, never committed
- Vercel dashboard > Project > Settings > Environment Variables -- production

Required keys: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Moving a File from Claude.ai to Local

When Claude.ai produces a JSX artifact you want to use:

1. Download the file from the artifact panel in chat
2. Copy it to `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\`
3. Run `npm run build:profile` (or the relevant build command)
4. Refresh `http://localhost:2368` to preview

---

## File Locations Quick Reference

| What | Where |
|---|---|
| Theme source JSX | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\` |
| Compiled JS (do not edit) | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\assets\js\` |
| Handlebars templates | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\` |
| API route files | `C:\dialecta-api\api\` |
| API environment vars | `C:\dialecta-api\.env.local` |
| Ghost root | `C:\dialecta-local\` |
| Ghost content | `C:\dialecta-local\content\` |

---

## CLAUDE.md Locations

| File | Lives at | Covers |
|---|---|---|
| `CLAUDE.md` | `C:\dialecta-api\` | Full system reference, all constants, Supabase schema, design tokens |
| `CLAUDE.md` | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\` | Theme-specific: build commands, Ghost integration, entry points |

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Running `ghost start` from theme folder | Always run Ghost commands from `C:\dialecta-local\` |
| Running `vercel dev` from wrong directory | Always `cd C:\dialecta-api` first |
| Deploying theme without building first | Always `npm run build` before ZIP |
| Editing `assets/js/bundle.js` directly | Edit `src/` files, then build |
| ZIP uploaded includes stale compiled JS | Run `npm run build` immediately before ZIPping |

---

*For full system constants, tier definitions, archetype list, and design tokens: open `C:\dialecta-api\CLAUDE.md`*
