import { CLIOptions } from './types.js';

export const DEFAULT_BASE_URL = 'https://api.sepolia.app.tea.xyz/';
export const DEFAULT_TIMEOUT_MS = 10000;
export const DEFAULT_RETRIES = 3;
export const DEFAULT_SVG_PATH = '.github/tea-rank-badge.svg';
export const DEFAULT_README_PATH = 'README.md';

export const getConfig = (options: Partial<CLIOptions>): CLIOptions => {
  return {
    projectId: options.projectId,
    name: options.name,
    svgPath: options.svgPath || DEFAULT_SVG_PATH,
    readmePath: options.readmePath || DEFAULT_README_PATH,
    noReadme: options.noReadme || false,
    label: options.label || 'teaRank',
    style: options.style || 'flat',
    precision: options.precision ?? 0,
    color: options.color,
    baseUrl: process.env.TEA_API_BASE || options.baseUrl || DEFAULT_BASE_URL,
    timeoutMs: parseInt(process.env.TEA_TIMEOUT_MS || '') || options.timeoutMs || DEFAULT_TIMEOUT_MS,
    retries: parseInt(process.env.TEA_RETRIES || '') || options.retries || DEFAULT_RETRIES,
    dryRun: options.dryRun || false,
    quiet: options.quiet || false,
    debug: options.debug || false,
    insert: options.insert ?? true,
  };
};