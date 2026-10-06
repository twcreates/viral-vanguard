// Reassembles the game from this folder: page.html with every <<path>> replaced by that file's contents
// (embedded images and sounds are re-encoded to base64). Writes rebuilt.html and checks it against ../index.html.
//   node rebuild.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fill = (text) => text.replace(/<<((?:assets|styles|scripts)\/[^<>]+)>>/g, (m, rel) => {
	const file = path.join(here, rel);
	if (rel.startsWith("assets/") && !rel.endsWith(".b64")) return fs.readFileSync(file).toString("base64");
	return fill(fs.readFileSync(file, "utf8"));
});
const out = fill(fs.readFileSync(path.join(here, "page.html"), "utf8"));
fs.writeFileSync(path.join(here, "rebuilt.html"), out);
const orig = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");
console.log(out === orig ? "rebuilt.html is identical to index.html" : "rebuilt.html DIFFERS from index.html");
process.exit(out === orig ? 0 : 1);
