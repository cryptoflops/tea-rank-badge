import { readFileSafe } from './io.js';
import { log } from './log.js';

const START_MARKER = '<!-- tea-rank-badge-start -->';
const END_MARKER = '<!-- tea-rank-badge-end -->';

export function generateBadgeMarkdown(svgPath: string): string {
  // Normalize path for README relative reference
  const relativePath = svgPath.startsWith('./') ? svgPath : `./${svgPath}`;
  
  return [
    START_MARKER,
    '',
    `![teaRank](${relativePath})`,
    '',
    END_MARKER
  ].join('\n');
}

export async function updateReadme(
  readmePath: string,
  svgPath: string,
  insert: boolean
): Promise<string> {
  const content = await readFileSafe(readmePath);
  const badgeMarkdown = generateBadgeMarkdown(svgPath);
  
  if (!content) {
    if (!insert) {
      throw new Error(`README not found at ${readmePath}`);
    }
    
    // Create new README with badge
    return [
      '# Project',
      '',
      '## Status',
      '',
      badgeMarkdown,
      '',
    ].join('\n');
  }
  
  // Check if markers exist
  const startIndex = content.indexOf(START_MARKER);
  const endIndex = content.indexOf(END_MARKER);
  
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    // Replace existing badge section
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex + END_MARKER.length);
    
    return before + badgeMarkdown + after;
  }
  
  if (!insert) {
    log.warn('Badge markers not found in README. Use --insert to add them.');
    return content;
  }
  
  // Insert at the end of the README
  return content.trimEnd() + '\n\n## Status\n\n' + badgeMarkdown + '\n';
}

export function extractExistingBadgeSection(content: string): string | null {
  const startIndex = content.indexOf(START_MARKER);
  const endIndex = content.indexOf(END_MARKER);
  
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }
  
  return content.substring(startIndex, endIndex + END_MARKER.length);
}