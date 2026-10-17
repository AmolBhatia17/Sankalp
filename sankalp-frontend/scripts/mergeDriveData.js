/**
 * Drive Data Ingestion & Integration Script
 *
 * Merges raw Google Drive links from drive_data.csv into:
 *   1. database/manifest_template.csv (Production Resource Manifest)
 *   2. src/data/mockCourses.js (Offline Fallback & Firebase Seed Source)
 *   3. database/seed_resources.sql (PostgreSQL Production Seed SQL)
 *   4. database/seed_resources_mysql.sql (MySQL Production Seed SQL)
 *
 * Usage:
 *   node scripts/mergeDriveData.js [--dry-run] [--write]
 *
 * Default is --dry-run. Pass --write to apply changes to files.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  extractDriveFileId,
  formatDrivePreviewUrl,
  KNOWN_COURSE_IDS,
} from '../src/lib/resourceValidator.js';
import { parseCsv } from '../database/importManifest.js';
import { mockCourses } from '../src/data/mockCourses.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const frontendDir = resolve(__dirname, '..');

// File paths
const driveCsvPath = resolve(rootDir, 'drive_data.csv');
const manifestPath = resolve(frontendDir, 'database/manifest_template.csv');
const mockCoursesPath = resolve(frontendDir, 'src/data/mockCourses.js');
const pgSeedPath = resolve(frontendDir, 'database/seed_resources.sql');
const mySqlSeedPath = resolve(frontendDir, 'database/seed_resources_mysql.sql');

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
        i++;
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

export function loadDriveLinks(csvPath) {
  if (!existsSync(csvPath)) {
    throw new Error(`drive_data.csv not found at ${csvPath}`);
  }
  const content = readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  let section = '';
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const [col0, col1] = parseCsvLine(lines[i]);
    const name = (col0 || '').trim();
    const link = (col1 || '').trim();
    if (name && !link) {
      section = name;
    } else if (name && link) {
      items.push({ section, name, link });
    }
  }
  return items;
}

function normalizeKey(str) {
  return str.toLowerCase().replace(/^copy of\s+/i, '').replace(/[^a-z0-9]/g, '');
}

export function buildResourceMapping(manifestRows, driveItems) {
  // Extract folder URLs
  const embeddedFolder = driveItems.find((d) => d.name.toLowerCase().includes('embeeded notes folder'))?.link || '';
  const cadFolder = driveItems.find((d) => d.name.toLowerCase().includes('cad design notes folder'))?.link || '';
  const rvFolder = driveItems.find((d) => d.name.toLowerCase().includes('robot vision note folder'))?.link || '';

  const mappedResources = [];

  for (const { data } of manifestRows) {
    const res = { ...data };
    const targetNorm = normalizeKey(res.file_name);

    // Specific matching
    let match = null;

    if (res.course_id === 'embedded-systems') {
      if (res.resource_id === 'ES-M5-P1') {
        match = driveItems.find((d) => d.name.includes('M10P1') && d.name.includes('Embbed'));
      } else if (res.section_type === 'lecture_note' && !match) {
        match = { link: embeddedFolder, name: 'Embeeded Notes Folder' };
      } else {
        match = driveItems.find((d) => d.section.includes('EMBEDDED') && normalizeKey(d.name) === targetNorm);
      }
    } else if (res.course_id === 'cad-designing') {
      if (res.resource_id === 'CAD-V-M0') {
        match = driveItems.find((d) => d.section.includes('CAD') && d.name.includes('solidworks project lab'));
      } else if (res.resource_id === 'CAD-M1B') {
        match = driveItems.find((d) => d.section.includes('CAD') && d.name.includes('M1-B.pdf'));
      } else if (res.resource_id === 'CAD-M6') {
        match = driveItems.find((d) => d.section.includes('CAD') && d.name.includes('M6 - Part.pdf'));
      } else if (res.resource_id === 'CAD-M2') {
        match = { link: cadFolder, name: 'CAD Design Notes Folder' };
      } else {
        match = driveItems.find((d) => d.section.includes('CAD') && normalizeKey(d.name) === targetNorm);
      }
    } else if (res.course_id === 'robot-vision') {
      if (res.section_type === 'lecture_note') {
        match = driveItems.find((d) => d.section.includes('Robot Vision Note') && normalizeKey(d.name) === targetNorm);
      } else {
        match = driveItems.find((d) => d.section.includes('rOBOT Vision VIDEO') && normalizeKey(d.name) === targetNorm);
      }
    }

    if (match && match.link) {
      res.drive_url = formatDrivePreviewUrl(match.link);
      res.drive_file_id = extractDriveFileId(match.link);
    }

    mappedResources.push(res);
  }

  return mappedResources;
}

export function generateUpdatedCsv(mappedResources) {
  const headers = [
    'course_id',
    'module_id',
    'module_number',
    'resource_id',
    'title',
    'file_name',
    'resource_type',
    'section_type',
    'duration',
    'drive_url',
  ];

  const escapeField = (val) => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [headers.join(',')];
  for (const r of mappedResources) {
    const line = headers.map((h) => escapeField(r[h])).join(',');
    rows.push(line);
  }
  return rows.join('\n') + '\n';
}

export function updateMockCoursesData(currentCourses, mappedResources) {
  const resourceMap = new Map();
  for (const r of mappedResources) {
    resourceMap.set(r.resource_id, r);
  }

  // Deep clone to safely manipulate
  const cloned = JSON.parse(JSON.stringify(currentCourses));

  for (const course of cloned) {
    if (!course.modules) continue;
    for (const mod of course.modules) {
      // Update parts
      if (mod.parts) {
        for (const part of mod.parts) {
          const match = resourceMap.get(part.id);
          if (match && match.drive_url) {
            part.url = match.drive_url;
            part.driveFileId = match.drive_file_id;
          }
        }
      }
      // Update videos
      if (mod.videos) {
        for (const vid of mod.videos) {
          const match = resourceMap.get(vid.id);
          if (match && match.drive_url) {
            vid.url = match.drive_url;
            vid.driveFileId = match.drive_file_id;
          }
        }
      }
    }
  }

  return `export const mockCourses = ${JSON.stringify(cloned, null, 2)};\n`;
}

export function generatePgSqlSeeds(mappedResources, courses) {
  const lines = [];
  lines.push('-- ====================================================================');
  lines.push('-- Sankalp Educational Platform — PostgreSQL Modules & Resources Seed');
  lines.push('-- Auto-generated from production Google Drive manifest');
  lines.push('-- ====================================================================');
  lines.push('');

  // 1. Seed Modules
  lines.push('-- 1. SEED MODULES');
  for (const course of courses) {
    if (!course.modules) continue;
    for (const mod of course.modules) {
      const escTitle = mod.title.replace(/'/g, "''");
      lines.push(
        `INSERT INTO modules (id, course_id, module_number, title, display_order) ` +
          `VALUES ('${mod.id}', '${course.id}', ${mod.number}, '${escTitle}', ${mod.number}) ` +
          `ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, display_order = EXCLUDED.display_order, updated_at = CURRENT_TIMESTAMP;`
      );
    }
  }
  lines.push('');

  // 2. Seed Resources
  lines.push('-- 2. SEED RESOURCES WITH GOOGLE DRIVE STREAMS & PREVIEWS');
  mappedResources.forEach((r, idx) => {
    const escTitle = r.title.replace(/'/g, "''");
    const escFile = r.file_name.replace(/'/g, "''");
    const durationVal = r.duration ? `'${r.duration.replace(/'/g, "''")}'` : 'NULL';
    const driveUrlVal = r.drive_url ? `'${r.drive_url.replace(/'/g, "''")}'` : 'NULL';
    const driveIdVal = r.drive_file_id ? `'${r.drive_file_id.replace(/'/g, "''")}'` : 'NULL';

    lines.push(
      `INSERT INTO resources (id, module_id, course_id, title, file_name, resource_type, section_type, duration, drive_url, drive_file_id, display_order) ` +
        `VALUES ('${r.resource_id}', '${r.module_id}', '${r.course_id}', '${escTitle}', '${escFile}', '${r.resource_type}', '${r.section_type}', ${durationVal}, ${driveUrlVal}, ${driveIdVal}, ${idx + 1}) ` +
        `ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, drive_url = EXCLUDED.drive_url, drive_file_id = EXCLUDED.drive_file_id, updated_at = CURRENT_TIMESTAMP;`
    );
  });

  return lines.join('\n') + '\n';
}

export function generateMySqlSeeds(mappedResources, courses) {
  const lines = [];
  lines.push('-- ====================================================================');
  lines.push('-- Sankalp Educational Platform — MySQL Modules & Resources Seed');
  lines.push('-- Auto-generated from production Google Drive manifest');
  lines.push('-- ====================================================================');
  lines.push('');

  // 1. Seed Modules
  lines.push('-- 1. SEED MODULES');
  for (const course of courses) {
    if (!course.modules) continue;
    for (const mod of course.modules) {
      const escTitle = mod.title.replace(/'/g, "''");
      lines.push(
        `INSERT INTO modules (id, course_id, module_number, title, display_order) ` +
          `VALUES ('${mod.id}', '${course.id}', ${mod.number}, '${escTitle}', ${mod.number}) ` +
          `ON DUPLICATE KEY UPDATE title = VALUES(title), display_order = VALUES(display_order), updated_at = CURRENT_TIMESTAMP;`
      );
    }
  }
  lines.push('');

  // 2. Seed Resources
  lines.push('-- 2. SEED RESOURCES WITH GOOGLE DRIVE STREAMS & PREVIEWS');
  mappedResources.forEach((r, idx) => {
    const escTitle = r.title.replace(/'/g, "''");
    const escFile = r.file_name.replace(/'/g, "''");
    const durationVal = r.duration ? `'${r.duration.replace(/'/g, "''")}'` : 'NULL';
    const driveUrlVal = r.drive_url ? `'${r.drive_url.replace(/'/g, "''")}'` : 'NULL';
    const driveIdVal = r.drive_file_id ? `'${r.drive_file_id.replace(/'/g, "''")}'` : 'NULL';

    lines.push(
      `INSERT INTO resources (id, module_id, course_id, title, file_name, resource_type, section_type, duration, drive_url, drive_file_id, display_order) ` +
        `VALUES ('${r.resource_id}', '${r.module_id}', '${r.course_id}', '${escTitle}', '${escFile}', '${r.resource_type}', '${r.section_type}', ${durationVal}, ${driveUrlVal}, ${driveIdVal}, ${idx + 1}) ` +
        `ON DUPLICATE KEY UPDATE title = VALUES(title), drive_url = VALUES(drive_url), drive_file_id = VALUES(drive_file_id), updated_at = CURRENT_TIMESTAMP;`
    );
  });

  return lines.join('\n') + '\n';
}

async function main() {
  const args = process.argv.slice(2);
  const isWrite = args.includes('--write');

  console.log(`======================================================`);
  console.log(`Sankalp Drive Data Ingestion & Integration Tool`);
  console.log(`Mode: ${isWrite ? 'WRITE MODE (Updating files)' : 'DRY-RUN (Safe preview)'}`);
  console.log(`Source: ${driveCsvPath}`);
  console.log(`======================================================\n`);

  const driveItems = loadDriveLinks(driveCsvPath);
  console.log(`✓ Loaded ${driveItems.length} items from drive_data.csv`);

  const manifestContent = readFileSync(manifestPath, 'utf8');
  const manifestRows = parseCsv(manifestContent);
  console.log(`✓ Loaded ${manifestRows.length} resource definitions from manifest_template.csv`);

  const mappedResources = buildResourceMapping(manifestRows, driveItems);
  const populatedCount = mappedResources.filter((r) => Boolean(r.drive_url)).length;
  console.log(`✓ Matched & Populated Drive URLs: ${populatedCount} / ${mappedResources.length}`);

  // Summary by course
  for (const cId of KNOWN_COURSE_IDS) {
    const list = mappedResources.filter((r) => r.course_id === cId);
    const withUrls = list.filter((r) => Boolean(r.drive_url));
    console.log(`   • ${cId}: ${withUrls.length}/${list.length} resources linked`);
  }

  if (isWrite) {
    console.log(`\nWriting updated manifest to: ${manifestPath}...`);
    const newManifestCsv = generateUpdatedCsv(mappedResources);
    writeFileSync(manifestPath, newManifestCsv, 'utf8');
    console.log(`✓ Successfully updated manifest_template.csv`);

    console.log(`Updating local fallback courses catalog: ${mockCoursesPath}...`);
    const newMockCoursesCode = updateMockCoursesData(mockCourses, mappedResources);
    writeFileSync(mockCoursesPath, newMockCoursesCode, 'utf8');
    console.log(`✓ Successfully updated src/data/mockCourses.js with live preview URLs`);

    console.log(`Writing PostgreSQL seed file: ${pgSeedPath}...`);
    const pgSql = generatePgSqlSeeds(mappedResources, mockCourses);
    writeFileSync(pgSeedPath, pgSql, 'utf8');
    console.log(`✓ Successfully wrote database/seed_resources.sql`);

    console.log(`Writing MySQL seed file: ${mySqlSeedPath}...`);
    const mySql = generateMySqlSeeds(mappedResources, mockCourses);
    writeFileSync(mySqlSeedPath, mySql, 'utf8');
    console.log(`✓ Successfully wrote database/seed_resources_mysql.sql`);

    console.log(`\n🎉 PRODUCTION DATA INTEGRATION COMPLETE.`);
  } else {
    console.log(`\n🔒 DRY RUN COMPLETE. Run with --write to apply changes.`);
  }

  return { total: mappedResources.length, populated: populatedCount };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
