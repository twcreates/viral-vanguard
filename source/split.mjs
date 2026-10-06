// Splits ../index.html (the game, untouched) into a readable copy in this folder:
//   page.html        the markup, with each <style> / <script> body replaced by a pointer to its file
//   styles/*.css     the stylesheets
//   scripts/*.js     the code, in parts small enough for GitHub's file viewer
//   assets/*         every embedded image / sound, and the long data strings (models etc.) as .b64 text
// Every replacement is written as <<path>>, so `node rebuild.mjs` reassembles index.html byte for byte.
//   node split.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");
const PART = 300_000;                       // characters per code file (GitHub shows files up to ~1 MB)
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "audio/mpeg": "mp3", "audio/ogg": "ogg", "audio/wav": "wav", "font/woff2": "woff2" };

for (const d of ["styles", "scripts", "assets"]) {
	fs.rmSync(path.join(here, d), { recursive: true, force: true });
	fs.mkdirSync(path.join(here, d));
}
if (src.includes("<<")) {
	// placeholders are written as <<path>>; make sure the game never contains that sequence on its own
	const n = (src.match(/<<(assets|styles|scripts)\//g) || []).length;
	if (n) throw new Error("index.html already contains <<…>> placeholders; refusing to split");
}
const write = (rel, data) => fs.writeFileSync(path.join(here, rel), data);
const list = [];

// 1. embedded files (data: URIs): decoded to real images / sounds
let n = 0;
let slim = src.replace(/data:([a-z0-9.+\/-]+);base64,([A-Za-z0-9+\/=]+)/gi, (m, mime, b64) => {
	const buf = Buffer.from(b64, "base64");
	if (buf.toString("base64") !== b64) return m;          // not canonical base64: leave it inline
	const rel = `assets/file_${String(++n).padStart(2, "0")}.${EXT[mime.toLowerCase()] || "bin"}`;
	write(rel, buf);
	list.push([rel, mime, buf.length]);
	return `data:${mime};base64,<<${rel}>>`;
});

// 2. long data strings inside the code (packed meshes, textures...): kept as base64 text
let b = 0;
slim = slim.replace(/(["'`])([A-Za-z0-9+\/=]{2000,})\1/g, (m, q, b64) => {
	const rel = `assets/data_${String(++b).padStart(2, "0")}.b64`;
	write(rel, b64);
	list.push([rel, "base64 data string", b64.length]);
	return `${q}<<${rel}>>${q}`;
});

// 3. stylesheets and scripts out of the page; long scripts in parts, cut at line ends
let s = 0, j = 0;
slim = slim.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (m, open, body, close) => {
	const rel = `styles/style_${++s}.css`;
	write(rel, body);
	return `${open}<<${rel}>>${close}`;
});
slim = slim.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, (m, open, body, close) => {
	j++;
	const parts = [];
	let rest = body;
	while (rest.length) {
		let cut = rest.length;
		if (cut > PART) {
			cut = rest.lastIndexOf("\n", PART);
			if (cut <= 0) cut = PART;                       // a single huge line: hard cut
			else cut += 1;
		}
		const rel = `scripts/script_${j}_part_${String(parts.length + 1).padStart(2, "0")}.js`;
		write(rel, rest.slice(0, cut));
		parts.push(`<<${rel}>>`);
		rest = rest.slice(cut);
	}
	return open + parts.join("") + close;
});
write("page.html", slim);
console.log(`page.html, ${s} stylesheets, ${j} scripts, ${n} embedded files, ${b} data strings`);
write("assets/INDEX.md", "# Embedded assets\n\n| File | Type | Bytes |\n|---|---|---|\n" + list.map(([r, t, z]) => `| [${r.slice(7)}](${r.slice(7)}) | ${t} | ${z} |`).join("\n") + "\n");
