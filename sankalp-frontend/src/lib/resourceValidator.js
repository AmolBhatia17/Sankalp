/**
 * Resource Validator & Google Drive Link Parser
 *
 * Ensures data integrity for courses, modules, lecture notes, and video lectures.
 * Rejects malformed links, missing parent IDs, and ambiguous mappings.
 */

export const ALLOWED_RESOURCE_TYPES = Object.freeze(['pptx', 'pdf', 'pcb', 'mp4']);
export const ALLOWED_SECTION_TYPES = Object.freeze(['lecture_note', 'video_lecture']);
export const KNOWN_COURSE_IDS = Object.freeze(['embedded-systems', 'cad-designing', 'robot-vision']);

/**
 * Extracts Google Drive file ID from various Drive URL formats.
 * Supports:
 * - https://drive.google.com/file/d/{FILE_ID}/view
 * - https://drive.google.com/file/d/{FILE_ID}/preview
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}
 * - https://docs.google.com/presentation/d/{FILE_ID}/...
 */
export function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    /\/folders\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Formats a Google Drive URL into an embeddable preview URL.
 */
export function formatDrivePreviewUrl(url) {
  if (url && (url.includes('/folders/') || url.includes('/drive/folders/'))) {
    return url;
  }
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Validates a single resource item against the schema requirements.
 */
export function validateResource(res, options = {}) {
  const errors = [];
  const warnings = [];

  if (!res || typeof res !== 'object') {
    return { valid: false, errors: ['Resource must be an object'], warnings };
  }

  // 1. Mandatory IDs
  if (!res.id || typeof res.id !== 'string' || !res.id.trim()) {
    errors.push('Missing or invalid resource id');
  }

  if (!res.course_id || typeof res.course_id !== 'string' || !res.course_id.trim()) {
    errors.push('Missing or invalid parent course_id');
  } else if (options.strictCourseIds && !KNOWN_COURSE_IDS.includes(res.course_id.trim())) {
    errors.push(`Unknown course_id "${res.course_id}". Expected one of: ${KNOWN_COURSE_IDS.join(', ')}`);
  }

  if (!res.module_id || typeof res.module_id !== 'string' || !res.module_id.trim()) {
    errors.push('Missing or invalid parent module_id');
  }

  // 2. Titles and Files
  if (!res.title || typeof res.title !== 'string' || !res.title.trim()) {
    errors.push('Resource title is required');
  }

  if (!res.file_name || typeof res.file_name !== 'string' || !res.file_name.trim()) {
    errors.push('File name is required');
  }

  // 3. Types
  if (!ALLOWED_RESOURCE_TYPES.includes(res.resource_type)) {
    errors.push(`Invalid resource_type "${res.resource_type}". Expected one of: ${ALLOWED_RESOURCE_TYPES.join(', ')}`);
  }

  if (!ALLOWED_SECTION_TYPES.includes(res.section_type)) {
    errors.push(`Invalid section_type "${res.section_type}". Expected one of: ${ALLOWED_SECTION_TYPES.join(', ')}`);
  }

  // Type consistency check
  if (res.section_type === 'video_lecture' && res.resource_type !== 'mp4') {
    warnings.push(`Video lecture with non-mp4 resource_type "${res.resource_type}"`);
  }

  if (res.section_type === 'video_lecture' && (!res.duration || !res.duration.trim())) {
    warnings.push(`Video lecture "${res.title}" is missing a duration specification`);
  }

  // 4. Drive Link Validation
  if (res.drive_url) {
    if (!res.drive_url.startsWith('https://') && !res.drive_url.startsWith('http://')) {
      errors.push(`Invalid drive_url format for "${res.title}". Must start with http:// or https://`);
    } else {
      const fileId = extractDriveFileId(res.drive_url);
      if (res.drive_url.includes('drive.google.com') && !fileId) {
        warnings.push(`Google Drive URL does not appear to contain a recognizable file ID: ${res.drive_url}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detects duplicate resource IDs and duplicate file names within a module.
 */
export function detectDuplicates(resources) {
  const duplicates = [];
  const seenIds = new Set();
  const seenModuleFiles = new Set();

  for (const res of resources) {
    if (!res || !res.id) continue;

    // Check duplicate resource ID
    if (seenIds.has(res.id)) {
      duplicates.push({
        type: 'DUPLICATE_RESOURCE_ID',
        id: res.id,
        message: `Duplicate resource ID detected: "${res.id}"`,
      });
    } else {
      seenIds.add(res.id);
    }

    // Check duplicate file within module
    if (res.module_id && res.file_name) {
      const key = `${res.module_id}::${res.file_name}`;
      if (seenModuleFiles.has(key)) {
        duplicates.push({
          type: 'DUPLICATE_MODULE_FILE',
          moduleId: res.module_id,
          fileName: res.file_name,
          message: `Duplicate file "${res.file_name}" in module "${res.module_id}"`,
        });
      } else {
        seenModuleFiles.add(key);
      }
    }
  }

  return duplicates;
}
