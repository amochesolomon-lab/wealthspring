# WealthSpring Properties

Premium land investment website for FCT Abuja, Nigeria. Static HTML/CSS/JS site.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 3000
```

## Deploy to Vercel

This project is configured as a **static site** (`vercel.json`).

### Option A — Vercel Dashboard (recommended)

1. Push this repo to GitHub (already: `amochesolomon-lab/wealthspring`).
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. Leave **Framework Preset** as **Other** (no build command).
5. **Root Directory**: `.` (project root).
6. Click **Deploy**.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel          # preview
vercel --prod   # production
```

### Notes

- No build step is required.
- `.env` is ignored — do not commit API keys.
- `assets/videos/video4.mp4` is excluded (very large); hero uses videos 1–3 and 5.
- Property images are large (~250MB). If deploy fails on size limits, compress images under `assets/images/properties/` or host media on a CDN.
- SpringAI chat API (`/api/chat`) is not wired yet; the UI section is present but the standalone chat page is optional.
