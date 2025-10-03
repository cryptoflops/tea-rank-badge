import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TeaAPIClient } from '../api/tea.js';
import { fixtures } from './fixtures.js';

// Mock undici fetch
vi.mock('undici', () => ({
  fetch: vi.fn(),
}));

import { fetch } from 'undici';
const mockFetch = fetch as ReturnType<typeof vi.fn>;

describe('TeaAPI', () => {
  let api: TeaAPIClient;

  beforeEach(() => {
    api = new TeaAPIClient(
      'https://api.test.tea.xyz/',
      1000,
      2
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchProject', () => {
    it('should search projects successfully', async () => {
      // First mock for search
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ projects: fixtures.searchSuccess.results, totalCount: 1 }),
      } as any);
      // Second mock for getProjectInfo
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => fixtures.infoSuccess,
      } as any);

      const result = await api.searchProject('curl');
      
      expect(result).toEqual(fixtures.infoSuccess);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.tea.xyz/projects/search?text=curl',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'test/1.0.0',
          }),
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should handle empty search results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ projects: [], totalCount: 0 }),
      } as any);

      const result = await api.searchProject('nonexistent');
      
      expect(result).toBeNull();
    });

    it('should handle 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as any);

      await expect(api.searchProject('test')).rejects.toThrow('HTTP 404');
    });

    it('should retry on 429 with exponential backoff', async () => {
      const retryAfter = '1';
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            get: (key: string) => key === 'retry-after' ? retryAfter : undefined,
          },
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => fixtures.searchSuccess,
        } as any);

      const start = Date.now();
      const result = await api.searchProject('curl');
      const duration = Date.now() - start;

      expect(result).toEqual(fixtures.searchSuccess);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      // Should wait at least the retry-after duration (converted to ms)
      expect(duration).toBeGreaterThanOrEqual(900); // Allow some tolerance
    });

    it('should retry on 5xx errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => fixtures.searchSuccess,
        } as any);

      const result = await api.searchProject('curl');

      expect(result).toEqual(fixtures.searchSuccess);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as any);

      await expect(api.searchProject('test')).rejects.toThrow('HTTP 500');
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should timeout on slow requests', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 2000))
      );

      await expect(api.searchProject('test')).rejects.toThrow();
    }, 3000);
  });

  describe('getProjectInfo', () => {
    it('should get project info successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => fixtures.infoSuccess,
      } as any);

      const result = await api.getProjectInfo('123456');
      
      expect(result).toEqual(fixtures.infoSuccess);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.tea.xyz/projects/info?id=123456',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'test/1.0.0',
          }),
        })
      );
    });

    it('should handle project not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as any);

      await expect(api.getProjectInfo('999999')).rejects.toThrow('HTTP 404');
    });

    it('should validate response schema', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          // Missing required fields
          projectId: '123456',
        }),
      } as any);

      await expect(api.getProjectInfo('123456')).rejects.toThrow();
    });
  });

});