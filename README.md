# Bromcom-style School System (Demo)

This repository contains a small React demo `school-system.jsx` that mimics Bromcom-like UI behaviour and includes a basic PA system using the Web Speech API.

Files added/updated:
- `school-system.jsx` - main app component (already in repo)
- `index.css` - basic styles and font import to approximate Bromcom look
- `public/logo.svg` - placeholder logo used by the header

Quick start (development):

1. If you don't have a React project, create one (Vite recommended):

```bash
npm create vite@latest my-school-app -- --template react
cd my-school-app
npm install
```

2. Copy `school-system.jsx` into `src/` (replace default App) and copy the `public` folder to the project root so `/logo.svg` is served.

3. Ensure `index.css` is imported by `school-system.jsx` or in your `main.jsx`.

4. Run the dev server:

```bash
npm run dev
```

Notes:
- The PA System uses the browser's Web Speech Synthesis API. Available voices vary by browser and OS.
- For a pixel-perfect Bromcom theme you can provide official brand assets (fonts, logo, CSS tokens).

If you want, I can push a ready Vite scaffold with this app wired in and runnable immediately — tell me if you'd like that.
