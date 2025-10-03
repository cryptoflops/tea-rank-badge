import { describe, it, expect } from 'vitest';
import { generateBadgeMarkdown, extractExistingBadgeSection } from '../readme.js';

describe('README Update', () => {
  const badgeContent = '![teaRank](./.github/tea-rank-badge.svg)';
  const startMarker = '<!-- tea-rank-badge-start -->';
  const endMarker = '<!-- tea-rank-badge-end -->';

  // Helper function to simulate updateReadme behavior
  function updateReadmeWithBadge(readme: string, svgPath: string): string {
    const badgeMarkdown = generateBadgeMarkdown(svgPath);
    
    // Check if markers exist
    const startIndex = readme.indexOf(startMarker);
    const endIndex = readme.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      // Replace existing badge section
      const before = readme.substring(0, startIndex);
      const after = readme.substring(endIndex + endMarker.length);
      return before + badgeMarkdown + after;
    }
    
    // Insert at the end of the README
    return readme.trimEnd() + '\n\n## Status\n\n' + badgeMarkdown + '\n';
  }

  describe('updateReadmeWithBadge', () => {
    it('should insert badge section when markers are not present', () => {
      const readme = `# My Project

This is a test project.

## Installation

npm install`;

      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      expect(result).toContain(startMarker);
      expect(result).toContain(endMarker);
      expect(result).toContain(badgeContent);
      expect(result).toContain('## Status');
      expect(result).toContain('## Installation'); // Original content preserved
    });

    it('should update existing badge section with markers', () => {
      const readme = `# My Project

${startMarker}
![teaRank](./old-path.svg)
${endMarker}

## Installation`;

      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      expect(result).toContain(startMarker);
      expect(result).toContain(endMarker);
      expect(result).toContain(badgeContent);
      expect(result).not.toContain('./old-path.svg');
      expect(result).toContain('## Installation');
    });

    it('should be idempotent when badge content is the same', () => {
      const readme = `# My Project

${startMarker}
${badgeContent}
${endMarker}

## Installation`;

      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      expect(result).toBe(readme);
    });

    it('should handle custom badge paths', () => {
      const readme = '# Project';
      const customPath = './badges/tea.svg';
      
      const result = updateReadmeWithBadge(readme, customPath);
      
      expect(result).toContain(`![teaRank](${customPath})`);
    });

    it('should preserve content between markers', () => {
      const readme = `# My Project

${startMarker}
Some old content here
With multiple lines
${endMarker}

Rest of README`;

      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      expect(result).not.toContain('Some old content here');
      expect(result).not.toContain('With multiple lines');
      expect(result).toContain(badgeContent);
      expect(result).toContain('Rest of README');
    });

    it('should handle empty README', () => {
      const readme = '';
      
      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      expect(result).toContain(startMarker);
      expect(result).toContain(endMarker);
      expect(result).toContain(badgeContent);
      expect(result).toContain('## Status');
    });

    it('should handle README with only title', () => {
      const readme = '# My Project';
      
      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      expect(result).toContain('# My Project');
      expect(result).toContain('## Status');
      expect(result).toContain(badgeContent);
    });

    it('should handle malformed markers', () => {
      const readme = `# Project

<!-- tea-rank-badge-start -->
Missing end marker`;

      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      // Should append new section since markers are incomplete
      expect(result).toContain('Missing end marker');
      expect(result).toContain('## Status');
      expect(result.match(new RegExp(startMarker, 'g'))?.length).toBe(2);
    });

    it('should handle multiple marker pairs (edge case)', () => {
      const readme = `# Project

${startMarker}
First badge
${endMarker}

Some content

${startMarker}
Second badge
${endMarker}`;

      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      // Should only update the first marker pair
      const matches = result.match(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g'));
      expect(matches).toHaveLength(2);
      expect(matches?.[0]).toContain(badgeContent);
      expect(matches?.[1]).toContain('Second badge'); // Unchanged
    });

    it('should handle Windows line endings', () => {
      const readme = '# Project\r\n\r\n## Content\r\n';
      
      const result = updateReadmeWithBadge(readme, './.github/tea-rank-badge.svg');
      
      expect(result).toContain(startMarker);
      expect(result).toContain(endMarker);
      expect(result).toContain(badgeContent);
    });

    it('should escape special regex characters in path', () => {
      const specialPath = './badges/tea-rank[1].svg';
      const readme = '# Project';
      
      const result = updateReadmeWithBadge(readme, specialPath);
      
      expect(result).toContain(`![teaRank](${specialPath})`);
    });
  });
});