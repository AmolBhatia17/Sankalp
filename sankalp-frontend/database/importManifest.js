/**
 * CSV Manifest Importer & Validator for Sankalp Course Resources
 *
 * Supports idempotent dry-run validation, duplicate detection, and schema verification.
 *
 * Usage:
 *   node database/importManifest.js [--manifest=path/to/manifest.csv] [--dry-run] [--commit]
 *
 * Default is ALWAYS --dry-run. No database writes happen unless --commit is explicitly passed.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  validateResource,
  detectDuplicates,
  extractDriveFileId,
  formatDrivePreviewUrl,
  KNOWN_COURSE_IDS,
} from '../src/lib/resourceValidator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Robust CSV parser that handles quoted strings with embedded commas and escaped quotes.
 */
export function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
    });
    rows.push({ lineNumber: i + 1, data: row });
  }

  return rows;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Validates an array of manifest rows.
 */
export function validateManifestRows(rows) {
  const validResources = [];
  const validationErrors = [];
  const validationWarnings = [];

  for (const { lineNumber, data } of rows) {
    const resource = {
      id: data.resource_id,
      course_id: data.course_id,
      module_id: data.module_id,
      module_number: data.module_number ? parseInt(data.module_number, 10) : undefined,
      title: data.title,
      file_name: data.file_name,
      resource_type: data.resource_type,
      section_type: data.section_type,
      duration: data.duration || undefined,
      drive_url: data.drive_url || undefined,
      drive_file_id: data.drive_url ? extractDriveFileId(data.drive_url) : undefined,
    };

    const validation = validateResource(resource, { strictCourseIds: true });

    if (!validation.valid) {
      validationErrors.push({
        lineNumber,
        resourceId: data.resource_id || '(missing id)',
        errors: validation.errors,
      });
    } else {
      if (validation.warnings.length > 0) {
        validationWarnings.push({
          lineNumber,
          resourceId: data.resource_id,
          warnings: validation.warnings,
        });
      }
      validResources.push({ ...resource, lineNumber });
    }
  }

  const duplicates = detectDuplicates(validResources);

  return {
    totalRows: rows.length,
    validResources,
    validationErrors,
    validationWarnings,
    duplicates,
  };
}

/**
 * CLI Entry point
 */
export async function runImporter(args = process.argv.slice(2)) {
  const isCommit = args.includes('--commit');
  const isDryRun = !isCommit || args.includes('--dry-run');

  const manifestArg = args.find((a) => a.startsWith('--manifest='));
  const manifestPath = manifestArg
    ? resolve(process.cwd(), manifestArg.split('=')[1])
    : resolve(__dirname, 'manifest_template.csv');

  console.log(`\n======================================================`);
  console.log(`Sankalp Resource Manifest Importer & Validator`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Safe, no database writes)' : 'COMMIT MODE'}`);
  console.log(`Manifest Path: ${manifestPath}`);
  console.log(`======================================================\n`);

  if (!existsSync(manifestPath)) {
    console.error(`❌ Manifest file not found at: ${manifestPath}`);
    return { success: false, error: 'Manifest not found' };
  }

  const fileContent = readFileSync(manifestPath, 'utf8');
  const rows = parseCsv(fileContent);
  console.log(`📄 Parsed ${rows.length} rows from CSV.`);

  const results = validateManifestRows(rows);

  console.log(`\n--- Validation Report ---`);
  console.log(`✓ Valid Resource Definitions: ${results.validResources.length} / ${results.totalRows}`);

  if (results.validationErrors.length > 0) {
    console.log(`❌ Validation Errors Found (${results.validationErrors.length}):`);
    results.validationErrors.forEach((err) => {
      console.log(`   [Line ${err.lineNumber}] ID: ${err.resourceId} => ${err.errors.join('; ')}`);
    });
  }

  if (results.duplicates.length > 0) {
    console.log(`⚠️  Duplicates Detected (${results.duplicates.length}):`);
    results.duplicates.forEach((dup) => {
      console.log(`   ${dup.type}: ${dup.message}`);
    });
  }

  if (results.validationWarnings.length > 0) {
    console.log(`ℹ️  Warnings (${results.validationWarnings.length}):`);
    results.validationWarnings.slice(0, 5).forEach((w) => {
      console.log(`   [Line ${w.lineNumber}] ID: ${w.resourceId} => ${w.warnings.join('; ')}`);
    });
    if (results.validationWarnings.length > 5) {
      console.log(`   ...and ${results.validationWarnings.length - 5} more warnings.`);
    }
  }

  // Summary by course
  console.log(`\n--- Breakdown by Course ---`);
  for (const courseId of KNOWN_COURSE_IDS) {
    const courseRes = results.validResources.filter((r) => r.course_id === courseId);
    const notesCount = courseRes.filter((r) => r.section_type === 'lecture_note').length;
    const videosCount = courseRes.filter((r) => r.section_type === 'video_lecture').length;
    console.log(`  • ${courseId}: ${courseRes.length} resources (${notesCount} lecture notes, ${videosCount} video lectures)`);
  }

  if (isDryRun) {
    console.log(`\n🔒 DRY RUN COMPLETE. No database connection or writes were performed.`);
    console.log(`To commit to a team-approved database, ensure credentials are set and pass --commit.`);
    return { success: results.validationErrors.length === 0, ...results };
  }

  console.log(`\n⚠️  Database commit requested. Verifying team database environment...`);
  console.log(`Notice: Target relational database connection must be provided by the team.`);
  return { success: false, reason: 'Relational database environment pending team provisioning' };
}

// Execute directly if run via node
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runImporter().catch((err) => {
    console.error('Fatal importer error:', err);
    process.exit(1);
  });
}
