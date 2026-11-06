import { test, describe } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseCsv, validateManifestRows } from '../database/importManifest.js';
import { mockCourses } from '../src/data/mockCourses.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Manifest Parser and Integrity Verification', () => {
  const manifestPath = resolve(__dirname, '../database/manifest_template.csv');
  const csvContent = readFileSync(manifestPath, 'utf8');

  test('parses CSV correctly and matches expected row count', () => {
    const rows = parseCsv(csvContent);
    assert.strictEqual(rows.length, 63);
  });

  test('validates all 63 resources with zero schema errors', () => {
    const rows = parseCsv(csvContent);
    const results = validateManifestRows(rows);
    assert.strictEqual(results.validationErrors.length, 0);
    assert.strictEqual(results.validResources.length, 63);
    assert.strictEqual(results.duplicates.length, 0);
  });

  test('verifies all 3 core subjects exist and have correct resource counts', () => {
    const rows = parseCsv(csvContent);
    const { validResources } = validateManifestRows(rows);

    const es = validResources.filter((r) => r.course_id === 'embedded-systems');
    const cad = validResources.filter((r) => r.course_id === 'cad-designing');
    const rv = validResources.filter((r) => r.course_id === 'robot-vision');

    assert.strictEqual(es.length, 10);
    assert.strictEqual(cad.length, 20);
    assert.strictEqual(rv.length, 33);
  });

  test('keeps public mockCourses metadata-only', () => {
    assert.strictEqual(mockCourses.length, 3);

    const expectedIds = ['embedded-systems', 'cad-designing', 'robot-vision'];
    assert.deepStrictEqual(
      mockCourses.map((course) => course.id).sort(),
      expectedIds.sort()
    );

    for (const course of mockCourses) {
      assert.strictEqual(
        Object.hasOwn(course, 'modules'),
        false,
        `Public course ${course.id} must not contain modules`
      );
    }

    const publicCatalog = JSON.stringify(mockCourses);
    assert.doesNotMatch(
      publicCatalog,
      /https:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|drive\/u\/\d+\/folders\/)/
    );
    assert.doesNotMatch(publicCatalog, /driveFileId|drive_file_id/);
  });
});
