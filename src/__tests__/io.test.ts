import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { writeIfChanged } from '../io.js';
import path from 'path';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

describe('IO Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('writeIfChanged', () => {
    const testPath = '/test/file.txt';
    const testContent = 'Hello, World!';

    it('should write new file when it does not exist', async () => {
      (fs.readFile as any).mockRejectedValueOnce({ code: 'ENOENT' });
      (fs.mkdir as any).mockResolvedValueOnce(undefined);
      (fs.writeFile as any).mockResolvedValueOnce(undefined);

      const result = await writeIfChanged(testPath, testContent);

      expect(result).toBe(true);
      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(testPath), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(testPath, testContent, 'utf-8');
    });

    it('should not write when content is unchanged', async () => {
      (fs.readFile as any).mockResolvedValueOnce(testContent);

      const result = await writeIfChanged(testPath, testContent);

      expect(result).toBe(false);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should write when content is different', async () => {
      (fs.readFile as any).mockResolvedValueOnce('Old content');
      (fs.mkdir as any).mockResolvedValueOnce(undefined);
      (fs.writeFile as any).mockResolvedValueOnce(undefined);

      const result = await writeIfChanged(testPath, testContent);

      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledWith(testPath, testContent, 'utf-8');
    });

    it('should not write in dry-run mode when file does not exist', async () => {
      (fs.readFile as any).mockRejectedValueOnce({ code: 'ENOENT' });

      const result = await writeIfChanged(testPath, testContent, true);

      expect(result).toBe(true);
      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should not write in dry-run mode when content differs', async () => {
      (fs.readFile as any).mockResolvedValueOnce('Old content');

      const result = await writeIfChanged(testPath, testContent, true);

      expect(result).toBe(true);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should return false in dry-run when content is same', async () => {
      // Mock readFileSafe to return the same content
      (fs.readFile as any).mockResolvedValueOnce(testContent);

      const result = await writeIfChanged(testPath, testContent, true);

      expect(result).toBe(false);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle read errors other than ENOENT', async () => {
      const error = new Error('Permission denied');
      (fs.readFile as any).mockRejectedValueOnce(error);

      await expect(writeIfChanged(testPath, testContent)).rejects.toThrow('Permission denied');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle write errors', async () => {
      (fs.readFile as any).mockRejectedValueOnce({ code: 'ENOENT' });
      (fs.mkdir as any).mockResolvedValueOnce(undefined);
      (fs.writeFile as any).mockRejectedValueOnce(new Error('Disk full'));

      await expect(writeIfChanged(testPath, testContent)).rejects.toThrow('Disk full');
    });

    it('should handle mkdir errors', async () => {
      (fs.readFile as any).mockRejectedValueOnce({ code: 'ENOENT' });
      (fs.mkdir as any).mockRejectedValueOnce(new Error('Permission denied'));

      await expect(writeIfChanged(testPath, testContent)).rejects.toThrow('Permission denied');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle binary content correctly', async () => {
      const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG header
      (fs.readFile as any).mockResolvedValueOnce(Buffer.from([0x00, 0x00, 0x00, 0x00]));
      (fs.mkdir as any).mockResolvedValueOnce(undefined);
      (fs.writeFile as any).mockResolvedValueOnce(undefined);

      const result = await writeIfChanged(testPath, binaryContent);

      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledWith(testPath, binaryContent, 'utf-8');
    });

    it('should handle empty content', async () => {
      (fs.readFile as any).mockResolvedValueOnce('Some content');
      (fs.mkdir as any).mockResolvedValueOnce(undefined);
      (fs.writeFile as any).mockResolvedValueOnce(undefined);

      const result = await writeIfChanged(testPath, '');

      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledWith(testPath, '', 'utf-8');
    });

    it('should handle very large content', async () => {
      const largeContent = 'x'.repeat(1024 * 1024); // 1MB of 'x'
      (fs.readFile as any).mockResolvedValueOnce('Small content');
      (fs.mkdir as any).mockResolvedValueOnce(undefined);
      (fs.writeFile as any).mockResolvedValueOnce(undefined);

      const result = await writeIfChanged(testPath, largeContent);

      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledWith(testPath, largeContent, 'utf-8');
    });

    it('should handle paths with special characters', async () => {
      const specialPath = '/test/file with spaces & [brackets].txt';
      (fs.readFile as any).mockRejectedValueOnce({ code: 'ENOENT' });
      (fs.mkdir as any).mockResolvedValueOnce(undefined);
      (fs.writeFile as any).mockResolvedValueOnce(undefined);

      const result = await writeIfChanged(specialPath, testContent);

      expect(result).toBe(true);
      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(specialPath), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(specialPath, testContent, 'utf-8');
    });

    it('should handle relative paths', async () => {
      const relativePath = './output/badge.svg';
      (fs.readFile as any).mockRejectedValueOnce({ code: 'ENOENT' });
      (fs.mkdir as any).mockResolvedValueOnce(undefined);
      (fs.writeFile as any).mockResolvedValueOnce(undefined);

      const result = await writeIfChanged(relativePath, testContent);

      expect(result).toBe(true);
      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(relativePath), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(relativePath, testContent, 'utf-8');
    });
  });
});