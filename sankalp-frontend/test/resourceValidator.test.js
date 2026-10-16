import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  extractDriveFileId,
  formatDrivePreviewUrl,
  validateResource,
  detectDuplicates,
  KNOWN_COURSE_IDS,
} from '../src/lib/resourceValidator.js';

describe('Google Drive URL Parser & Formatter', () => {
  test('extracts file ID from standard /file/d/{id}/view URLs', () => {
    const url = 'https://drive.google.com/file/d/1EX-AE58aj8nca_SWwprAcbE4av1RkSv4/view?usp=sharing';
    const id = extractDriveFileId(url);
    assert.strictEqual(id, '1EX-AE58aj8nca_SWwprAcbE4av1RkSv4');
  });

  test('extracts file ID from id parameter URLs', () => {
    const url = 'https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQrStUv';
    const id = extractDriveFileId(url);
    assert.strictEqual(id, '1AbCdEfGhIjKlMnOpQrStUv');
  });

  test('returns null for invalid or non-drive URLs', () => {
    assert.strictEqual(extractDriveFileId(''), null);
    assert.strictEqual(extractDriveFileId(null), null);
    assert.strictEqual(extractDriveFileId('https://example.com/video.mp4'), null);
  });

  test('formats preview URL correctly', () => {
    const url = 'https://drive.google.com/file/d/1EX-AE58aj8nca_SWwprAcbE4av1RkSv4/view?usp=sharing';
    const preview = formatDrivePreviewUrl(url);
    assert.strictEqual(preview, 'https://drive.google.com/file/d/1EX-AE58aj8nca_SWwprAcbE4av1RkSv4/preview');
  });
});

describe('Resource Schema Validation', () => {
  const validItem = {
    id: 'ES-M1',
    course_id: 'embedded-systems',
    module_id: 'es-m1',
    title: 'IDE Setup & Toolchain',
    file_name: 'M1 - Setup.pptx',
    resource_type: 'pptx',
    section_type: 'lecture_note',
  };

  test('accepts a completely valid lecture note', () => {
    const res = validateResource(validItem, { strictCourseIds: true });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
  });

  test('rejects missing parent course_id or module_id', () => {
    const withoutCourse = { ...validItem, course_id: '' };
    const res1 = validateResource(withoutCourse);
    assert.strictEqual(res1.valid, false);
    assert.ok(res1.errors.some((e) => e.includes('course_id')));

    const withoutModule = { ...validItem, module_id: '' };
    const res2 = validateResource(withoutModule);
    assert.strictEqual(res2.valid, false);
    assert.ok(res2.errors.some((e) => e.includes('module_id')));
  });

  test('rejects unknown course_id under strict mode', () => {
    const badCourse = { ...validItem, course_id: 'quantum-computing' };
    const res = validateResource(badCourse, { strictCourseIds: true });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('Unknown course_id')));
  });

  test('rejects invalid resource_type and invalid section_type', () => {
    const badType = { ...validItem, resource_type: 'exe', section_type: 'exam' };
    const res = validateResource(badType);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('resource_type')));
    assert.ok(res.errors.some((e) => e.includes('section_type')));
  });

  test('rejects invalid drive_url protocol', () => {
    const badUrl = { ...validItem, drive_url: 'ftp://drive.google.com/file' };
    const res = validateResource(badUrl);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('drive_url format')));
  });
});

describe('Duplicate Detection', () => {
  test('flags duplicate resource IDs', () => {
    const items = [
      { id: 'RES-01', module_id: 'm1', file_name: 'f1.pptx' },
      { id: 'RES-01', module_id: 'm2', file_name: 'f2.pptx' },
    ];
    const dups = detectDuplicates(items);
    assert.strictEqual(dups.length, 1);
    assert.strictEqual(dups[0].type, 'DUPLICATE_RESOURCE_ID');
    assert.strictEqual(dups[0].id, 'RES-01');
  });

  test('flags duplicate file names within the same module', () => {
    const items = [
      { id: 'RES-01', module_id: 'm1', file_name: 'same_file.pdf' },
      { id: 'RES-02', module_id: 'm1', file_name: 'same_file.pdf' },
    ];
    const dups = detectDuplicates(items);
    assert.strictEqual(dups.length, 1);
    assert.strictEqual(dups[0].type, 'DUPLICATE_MODULE_FILE');
    assert.strictEqual(dups[0].fileName, 'same_file.pdf');
  });

  test('allows same file name across different modules', () => {
    const items = [
      { id: 'RES-01', module_id: 'm1', file_name: 'overview.pdf' },
      { id: 'RES-02', module_id: 'm2', file_name: 'overview.pdf' },
    ];
    const dups = detectDuplicates(items);
    assert.strictEqual(dups.length, 0);
  });
});
