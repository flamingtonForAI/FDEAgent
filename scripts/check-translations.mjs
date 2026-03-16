#!/usr/bin/env node

/**
 * Translation completeness checker.
 * Compares all locale directories against en/ (source of truth).
 * Reports missing keys and coverage percentage per language.
 * Exit code 0 — warning level only, does not block build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, '..', 'locales');
const SOURCE_LANG = 'en';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively flatten a nested object into dot-notation keys. */
function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/** Read and parse a JSON file, returning {} on failure. */
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

/** Collect all flattened keys from every JSON file in a locale directory. */
function collectKeys(langDir) {
  if (!fs.existsSync(langDir)) return new Set();
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
  const allKeys = new Set();
  for (const file of files) {
    const namespace = path.basename(file, '.json');
    const data = readJSON(path.join(langDir, file));
    for (const key of flattenKeys(data)) {
      allKeys.add(`${namespace}:${key}`);
    }
  }
  return allKeys;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const sourceDir = path.join(LOCALES_DIR, SOURCE_LANG);
if (!fs.existsSync(sourceDir)) {
  console.error(`Source locale directory not found: ${sourceDir}`);
  process.exit(0);
}

const sourceKeys = collectKeys(sourceDir);
const totalKeys = sourceKeys.size;

if (totalKeys === 0) {
  console.log('No translation keys found in source locale (en/).');
  process.exit(0);
}

// Discover other language directories
const langDirs = fs.readdirSync(LOCALES_DIR).filter(entry => {
  if (entry === SOURCE_LANG) return false;
  const full = path.join(LOCALES_DIR, entry);
  return fs.statSync(full).isDirectory();
});

if (langDirs.length === 0) {
  console.log('No target language directories found.');
  process.exit(0);
}

const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

console.log(`\nTranslation Completeness Check`);
console.log(`Source: en/ (${totalKeys.toLocaleString()} keys)\n`);

const summaryParts = [];

for (const lang of langDirs.sort()) {
  const langKeys = collectKeys(path.join(LOCALES_DIR, lang));
  const presentCount = [...sourceKeys].filter(k => langKeys.has(k)).length;
  const missingKeys = [...sourceKeys].filter(k => !langKeys.has(k));
  const pct = Math.round((presentCount / totalKeys) * 100);

  summaryParts.push(
    `${lang}: ${pct}% (${presentCount.toLocaleString()}/${totalKeys.toLocaleString()})`
  );

  if (VERBOSE && missingKeys.length > 0) {
    console.log(`[${lang}] Missing ${missingKeys.length} key(s):`);
    for (const k of missingKeys.slice(0, 20)) {
      console.log(`  - ${k}`);
    }
    if (missingKeys.length > 20) {
      console.log(`  ... and ${missingKeys.length - 20} more`);
    }
    console.log();
  }
}

console.log(summaryParts.join(' | '));

const incomplete = summaryParts.filter(s => !s.includes('100%'));
if (incomplete.length > 0) {
  console.log(`\nRun with --verbose to see missing keys.`);
}

console.log();
process.exit(0);
