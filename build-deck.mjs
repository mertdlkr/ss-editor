// Deck-as-code entry point. Customize examples/starter.json for your own app.
// This explicitly overwrites the current editor project; autosave does not call it.
import { readFile, writeFile } from "node:fs/promises";

const template = new URL("./examples/starter.json", import.meta.url);
const destination = new URL("./app-store-screenshots.json", import.meta.url);
const project = JSON.parse(await readFile(template, "utf8"));
await writeFile(destination, JSON.stringify(project, null, 2) + "\n");
console.log("Starter deck written to app-store-screenshots.json");
