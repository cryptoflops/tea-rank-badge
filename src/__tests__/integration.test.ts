import { describe, it, expect } from 'vitest';
import { getColorForRank } from '../badge.js';
import { generateBadgeMarkdown } from '../readme.js';

describe('Integration Tests', () => {
  describe('Badge Color Logic', () => {
    it('should assign correct colors for different rank ranges', () => {
      // Test color thresholds
      expect(getColorForRank(100)).toBe('brightgreen');
      expect(getColorForRank(90)).toBe('brightgreen');
      expect(getColorForRank(89)).toBe('green');
      expect(getColorForRank(75)).toBe('green');
      expect(getColorForRank(74)).toBe('yellowgreen');
      expect(getColorForRank(60)).toBe('yellowgreen');
      expect(getColorForRank(59)).toBe('yellow');
      expect(getColorForRank(40)).toBe('yellow');
      expect(getColorForRank(39)).toBe('orange');
      expect(getColorForRank(20)).toBe('orange');
      expect(getColorForRank(19)).toBe('red');
      expect(getColorForRank(0)).toBe('red');
    });
  });

  describe('Badge Markdown Generation', () => {
    it('should generate correct markdown with markers', () => {
      const markdown = generateBadgeMarkdown('.github/tea-rank-badge.svg');
      
      expect(markdown).toContain('<!-- tea-rank-badge-start -->');
      expect(markdown).toContain('<!-- tea-rank-badge-end -->');
      expect(markdown).toContain('![teaRank](./.github/tea-rank-badge.svg)');
    });

    it('should handle paths that already start with ./', () => {
      const markdown = generateBadgeMarkdown('./badges/tea.svg');
      
      expect(markdown).toContain('![teaRank](./badges/tea.svg)');
    });

    it('should normalize paths without ./', () => {
      const markdown = generateBadgeMarkdown('assets/badge.svg');
      
      expect(markdown).toContain('![teaRank](./assets/badge.svg)');
    });
  });
});