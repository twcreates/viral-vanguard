# Viral Vanguard (v77)

## ▶ [Play in your browser](https://twcreates.github.io/viral-vanguard/)

Works on desktop and on phones (landscape). The game is the v77 build exactly as published in the Viral Vanguard
artifact: one self-contained file, [`index.html`](index.html), served unchanged by GitHub Pages.

## Reading the game file

`index.html` is 13.9 MB because every image, sound and model is embedded in it, so GitHub's file viewer won't
display it. To read it:

- **Whole file, as text:** [raw index.html](https://raw.githubusercontent.com/twcreates/viral-vanguard/main/index.html)
- **Whole file, in an editor:** [open in github.dev](https://github.dev/twcreates/viral-vanguard/blob/main/index.html) (or press `.` on this page)
- **Split into readable parts, in [`source/`](source):**
  - [`page.html`](source/page.html): the page markup
  - [`styles/`](source/styles): the stylesheets
  - [`scripts/`](source/scripts): the game code, in parts small enough for GitHub to display
  - [`assets/`](source/assets): every embedded image and sound as a real file, plus the long data strings (models,
    packed meshes) as `.b64` text, listed in [`assets/INDEX.md`](source/assets/INDEX.md)

  The split copy is for reading only; the game you play is `index.html`. Each piece is referenced from its place
  in the page as `<<path>>`, and `node source/rebuild.mjs` puts them back together and checks the result is
  byte-for-byte identical to `index.html`. After replacing `index.html` with a new build, run
  `node source/split.mjs` to refresh the split copy.
