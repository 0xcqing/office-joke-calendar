import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE = "My calendar auto-declines meetings on my behalf and sends the apology; it has better boundaries than I do, and HR has requested a meeting with it.";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const entryPath = join(outputDir, "entry.txt");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

type JokeFacts = {
  setupChars: number;
  punchChars: number;
  characters: number;
  bytes: number;
};

function jokeFacts(text: string): JokeFacts {
  const firstSemicolon = text.indexOf(";");
  const setup = firstSemicolon === -1 ? text : text.slice(0, firstSemicolon);
  const punch = firstSemicolon === -1 ? "" : text.slice(firstSemicolon + 1);

  return {
    setupChars: [...setup].length,
    punchChars: [...punch].length,
    characters: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
  };
}

const facts = jokeFacts(JOKE);

if (facts.characters < 1 || facts.characters > 200) {
  fail(`character count out of range: ${facts.characters}`);
}
if (facts.bytes < 1 || facts.bytes > 200) {
  fail(`byte count out of range: ${facts.bytes}`);
}
if (JOKE.trim().length === 0) {
  fail("text is empty after trim");
}
if (/[\r\n\u2028\u2029]/.test(JOKE)) {
  fail("text contains a newline character");
}
if (!JOKE.includes(";")) {
  fail("text does not contain a semicolon");
}
if (!JOKE.includes("meetings")) {
  fail("text does not mention meetings");
}
if (facts.setupChars < 1) {
  fail("setup before the first semicolon is empty");
}
if (facts.punchChars < 1) {
  fail("punch line after the first semicolon is empty");
}

mkdirSync(outputDir, { recursive: true });
const payload = JOKE + "\n";
writeFileSync(entryPath, payload, { encoding: "utf8" });

const readBack = readFileSync(entryPath);
if (!readBack.equals(Buffer.from(payload, "utf8"))) {
  fail("read-back mismatch: file bytes differ from the written text");
}

console.log(`path: ${entryPath}`);
console.log(`text: ${JOKE}`);
console.log(`characters: ${facts.characters}`);
console.log(`bytes: ${facts.bytes}`);
