# Install the Cosmic Atlas update

Apply this patch to your **existing working project where Solar System, Milky Way, Black hole, and Hercules Cluster already work**. The result has eleven Deep Space destinations. There are no new npm packages to install.

## Copy into the right folder

1. Stop the running dev server with **Ctrl+C**.
2. Extract **Solar-Explorer-Cosmic-Atlas-Update.zip** into a temporary folder.
3. Copy **all extracted contents**: the `src` folder, `verification` folder, and four Markdown files.
4. Paste them into your **existing project folder containing `package.json`**. Allow Windows to merge the folders and replace matching files. Do not delete your existing `src` folder.
5. Open a terminal in that same project folder and run:

```powershell
npm run dev
```

Open **http://127.0.0.1:5173/**, select **Deep space**, then **All destinations**. The count should be **11**. Refresh the page if an older tab was already open.

This ZIP contains only changed/new files. Keep your existing project and its `.git` folder. Do not run npm inside the extracted patch folder: it has no `package.json` and cannot run independently.

## Your earlier nested Downloads folder

If you are still using the same location as before, the terminal command is:

```powershell
cd "C:\Users\Rakesh Rajput\Downloads\Solar-System-Explorer-Local-Rebuild\Solar-System-Explorer-Local-Rebuild"
Test-Path .\package.json
npm run dev
```

`Test-Path` should print **True**. If it prints False, use File Explorer to locate your working `package.json` and open the terminal in its folder. The extra nested folder caused the earlier ENOENT error; pasting into the outer Downloads folder will not update the app.

If port 5173 is busy, stop the earlier server with Ctrl+C, or use `npm run dev -- --port 5174` and open `http://127.0.0.1:5174/`.

## What this patch adds

- Orion Nebula and a pulsar.
- Crab Nebula, Andromeda, and the seven-world TRAPPIST-1 system.
- A comet with two tails, plus a separate asteroid/Kuiper Belt scene.
- A wormhole diagram clearly marked hypothetical.
- A searchable atlas with categories, an eleven-destination strip, field notes, and model limitations.

`verification/` contains optional offscreen model-check images; it is not loaded by the app. See `DEEP_SPACE_REVIEW.md` for the 50 passing tests, build/shader checks, and the short localhost review still needed on your laptop.

This update makes no Git commit, push, or deployment.
