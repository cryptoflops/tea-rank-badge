import { z } from 'zod';

// Tea API Response Schemas
export const TeaProjectSchema = z.object({
  projectId: z.string(),
  name: z.string(),
  teaRank: z.number(),
  teaRankCalculatedAt: z.string(),
  status: z.string(),
  homepage: z.string().optional(),
  source: z.string().optional(),
  packageManagers: z.array(z.string()),
  numberOfSigners: z.number().optional(),
  registrationDate: z.string().optional(),
  quorum: z.number().optional(),
  dependents: z.number().optional(),
  dependencies: z.number().optional(),
});

export const TeaSearchResponseSchema = z.object({
  projects: z.array(TeaProjectSchema),
});

export const TeaInfoResponseSchema = TeaProjectSchema.extend({
  dependenciesCount: z.number().optional(),
  dependentsCount: z.number().optional(),
});

export type TeaProject = z.infer<typeof TeaProjectSchema>;
export type TeaSearchResponse = z.infer<typeof TeaSearchResponseSchema>;
export type TeaInfoResponse = z.infer<typeof TeaInfoResponseSchema>;

// CLI Configuration
export interface CLIOptions {
  projectId?: string;
  name?: string;
  svgPath: string;
  readmePath: string;
  noReadme: boolean;
  label: string;
  style: 'flat' | 'flat-square' | 'plastic' | 'for-the-badge';
  precision: number;
  color?: string;
  baseUrl: string;
  timeoutMs: number;
  retries: number;
  dryRun: boolean;
  quiet: boolean;
  debug: boolean;
  insert: boolean;
}

// Badge Generation
export interface BadgeOptions {
  label: string;
  message: string;
  color: string;
  style: 'flat' | 'flat-square' | 'plastic' | 'for-the-badge';
}

// README Update
export interface ReadmeUpdate {
  path: string;
  content: string;
  changed: boolean;
}