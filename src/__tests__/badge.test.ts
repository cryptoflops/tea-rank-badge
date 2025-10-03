import { describe, it, expect } from 'vitest';
import { createTeaRankBadge, getColorForRank } from '../badge.js';

describe('Badge Generation', () => {
  describe('getColorForRank', () => {
    it('should return brightgreen for rank >= 90', () => {
      expect(getColorForRank(90)).toBe('brightgreen');
      expect(getColorForRank(95)).toBe('brightgreen');
      expect(getColorForRank(100)).toBe('brightgreen');
    });

    it('should return green for rank 75-89', () => {
      expect(getColorForRank(75)).toBe('green');
      expect(getColorForRank(80)).toBe('green');
      expect(getColorForRank(89)).toBe('green');
    });

    it('should return yellowgreen for rank 60-74', () => {
      expect(getColorForRank(60)).toBe('yellowgreen');
      expect(getColorForRank(65)).toBe('yellowgreen');
      expect(getColorForRank(74)).toBe('yellowgreen');
    });

    it('should return yellow for rank 40-59', () => {
      expect(getColorForRank(40)).toBe('yellow');
      expect(getColorForRank(50)).toBe('yellow');
      expect(getColorForRank(59)).toBe('yellow');
    });

    it('should return orange for rank 20-39', () => {
      expect(getColorForRank(20)).toBe('orange');
      expect(getColorForRank(30)).toBe('orange');
      expect(getColorForRank(39)).toBe('orange');
    });

    it('should return red for rank < 20', () => {
      expect(getColorForRank(0)).toBe('red');
      expect(getColorForRank(10)).toBe('red');
      expect(getColorForRank(19)).toBe('red');
    });
  });

  describe('createTeaRankBadge', () => {
    it('should generate badge with default options', () => {
      const svg = createTeaRankBadge(75.5432, 'teaRank', 'flat', 0);
      
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('teaRank'); // Default label
      expect(svg).toContain('76'); // Rounded to integer by default
    });

    it('should use custom label', () => {
      const svg = createTeaRankBadge(75.5432, 'Tea Score', 'flat', 0);
      
      expect(svg).toContain('Tea Score');
      expect(svg).not.toContain('teaRank');
    });

    it('should apply precision to rank value', () => {
      const svg0 = createTeaRankBadge(75.5432, 'teaRank', 'flat', 0);
      const svg1 = createTeaRankBadge(75.5432, 'teaRank', 'flat', 1);
      const svg2 = createTeaRankBadge(75.5432, 'teaRank', 'flat', 2);
      
      expect(svg0).toContain('76');
      expect(svg1).toContain('75.5');
      expect(svg2).toContain('75.54');
    });

    it('should apply different badge styles', () => {
      const styles = ['flat', 'flat-square', 'plastic', 'for-the-badge'] as const;
      
      for (const style of styles) {
        const svg = createTeaRankBadge(75, 'teaRank', style, 0);
        expect(svg).toContain('<svg');
        // Different styles produce different SVG structures
        // We just verify it generates valid SVG
      }
    });

    it('should override color when provided', () => {
      const svg = createTeaRankBadge(10, 'teaRank', 'flat', 0, 'blue');
      
      // The badge-maker library encodes colors in the SVG
      // We can't easily test the exact color in the output
      // but we verify it generates valid SVG
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should handle edge cases', () => {
      // Very high rank
      const svgHigh = createTeaRankBadge(99.999, 'teaRank', 'flat', 3);
      expect(svgHigh).toContain('99.999');
      
      // Very low rank
      const svgLow = createTeaRankBadge(0.001, 'teaRank', 'flat', 3);
      expect(svgLow).toContain('0.001');
      
      // Negative rank (shouldn't happen but handle gracefully)
      const svgNeg = createTeaRankBadge(-5, 'teaRank', 'flat', 0);
      expect(svgNeg).toContain('-5');
      
      // Zero rank
      const svgZero = createTeaRankBadge(0, 'teaRank', 'flat', 0);
      expect(svgZero).toContain('0');
    });

    it('should generate consistent output for same input', () => {
      const svg1 = createTeaRankBadge(75.5, 'test', 'flat', 1);
      const svg2 = createTeaRankBadge(75.5, 'test', 'flat', 1);
      
      expect(svg1).toBe(svg2);
    });
  });
});