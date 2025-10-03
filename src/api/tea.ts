import { fetch } from 'undici';
import { TeaSearchResponseSchema, TeaInfoResponseSchema, type TeaInfoResponse } from '../types.js';
import { log } from '../log.js';

const VERSION = '0.1.0'; // Will be updated from package.json

export class TeaAPIClient {
  private baseUrl: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(baseUrl: string, timeoutMs: number, maxRetries: number) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    this.timeoutMs = timeoutMs;
    this.maxRetries = maxRetries;
  }

  private async fetchWithRetry(url: string, retryCount = 0): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      log.debug(`Fetching: ${url}`);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': `tea-rank-badge/${VERSION} (+https://github.com/cryptoflops/tea-rank-badge)`,
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeout);

      if (response.status === 429 && retryCount < this.maxRetries) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000;
        
        log.warn(`Rate limited. Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, retryCount + 1);
      }

      if (response.status >= 500 && retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
        log.warn(`Server error (${response.status}). Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, retryCount + 1);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      log.debug('Response received', data);
      return data;
    } catch (error: any) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeoutMs}ms`);
      }
      
      throw error;
    }
  }

  async searchProject(name: string): Promise<TeaInfoResponse | null> {
    const url = `${this.baseUrl}projects/search?text=${encodeURIComponent(name)}`;
    
    try {
      const data = await this.fetchWithRetry(url);
      const parsed = TeaSearchResponseSchema.parse(data);
      
      if (parsed.projects.length === 0) {
        log.warn(`No projects found matching "${name}"`);
        return null;
      }
      
      // Look for exact match first
      const exactMatch = parsed.projects.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (exactMatch) {
        return await this.getProjectInfo(exactMatch.projectId);
      }
      
      // If multiple results and no exact match, warn about ambiguity
      if (parsed.projects.length > 1) {
        log.warn(`Multiple projects found matching "${name}":`);
        parsed.projects.forEach(p => {
          log.warn(`  - ${p.name} (ID: ${p.projectId})`);
        });
        log.info('Using first result. Specify --project-id for exact match.');
      }
      
      return await this.getProjectInfo(parsed.projects[0].projectId);
    } catch (error) {
      log.error(`Failed to search project: ${error}`);
      throw error;
    }
  }

  async getProjectInfo(projectId: string): Promise<TeaInfoResponse> {
    const url = `${this.baseUrl}projects/info?id=${encodeURIComponent(projectId)}`;
    
    try {
      const data = await this.fetchWithRetry(url);
      return TeaInfoResponseSchema.parse(data);
    } catch (error) {
      log.error(`Failed to get project info: ${error}`);
      throw error;
    }
  }
}