#!/usr/bin/env node

import { Command } from 'commander';
import { log, setLogLevel } from './log.js';
import { TeaAPIClient } from './api/tea.js';
import { createTeaRankBadge } from './badge.js';
import { updateReadme } from './readme.js';
import { writeIfChanged } from './io.js';
import { getConfig } from './config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { CLIOptions } from './types.js';

// Get package version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);
const VERSION = packageJson.version;

const program = new Command();

program
  .name('tea-rank-badge')
  .description('Generate and update teaRank badges for Tea Protocol projects')
  .version(VERSION);

// Main update command (default)
program
  .command('update', { isDefault: true })
  .description('Update teaRank badge for a project')
  .option('--project-id <id>', 'Tea project ID (preferred over name)')
  .option('--name <name>', 'Project name to search for')
  .option('--svg-path <path>', 'Path to save SVG badge', '.github/tea-rank-badge.svg')
  .option('--readme-path <path>', 'Path to README file', 'README.md')
  .option('--no-readme', 'Skip README update')
  .option('--label <label>', 'Badge label', 'teaRank')
  .option('--style <style>', 'Badge style', 'flat')
  .option('--precision <number>', 'Decimal precision for rank', '0')
  .option('--color <color>', 'Override badge color')
  .option('--base-url <url>', 'Tea API base URL')
  .option('--timeout-ms <ms>', 'Request timeout in milliseconds', '10000')
  .option('--retries <count>', 'Number of retries', '3')
  .option('--dry-run', 'Preview changes without writing files')
  .option('--no-insert', 'Do not insert badge if markers not found')
  .option('--quiet', 'Suppress output except errors')
  .option('--debug', 'Enable debug output')
  .action(async (options: Partial<CLIOptions>) => {
    try {
      const config = getConfig(options);
      setLogLevel({ quiet: config.quiet, debug: config.debug });
      
      // Validate input
      if (!config.projectId && !config.name) {
        log.error('Either --project-id or --name must be specified');
        process.exit(1);
      }
      
      // Create API client
      const api = new TeaAPIClient(config.baseUrl, config.timeoutMs, config.retries);
      
      // Fetch project info
      log.info('Fetching project information...');
      const project = config.projectId 
        ? await api.getProjectInfo(config.projectId)
        : await api.searchProject(config.name!);
      
      if (!project) {
        log.error('Project not found');
        process.exit(1);
      }
      
      log.success(`Found project: ${project.name} (teaRank: ${project.teaRank})`);
      
      // Generate badge SVG
      const svg = createTeaRankBadge(
        project.teaRank,
        config.label,
        config.style,
        parseInt(config.precision.toString()),
        config.color
      );
      
      // Write SVG
      const svgChanged = await writeIfChanged(config.svgPath, svg, config.dryRun);
      
      // Update README if needed
      let readmeChanged = false;
      if (!config.noReadme) {
        const updatedReadme = await updateReadme(
          config.readmePath,
          config.svgPath,
          config.insert
        );
        readmeChanged = await writeIfChanged(config.readmePath, updatedReadme, config.dryRun);
      }
      
      // Report status
      const anyChanges = svgChanged || readmeChanged;
      
      if (config.dryRun) {
        if (anyChanges) {
          log.info('[DRY RUN] Changes would be made');
          process.exit(2); // Exit code 2 for dry-run with changes
        } else {
          log.info('[DRY RUN] No changes needed');
        }
      } else {
        if (anyChanges) {
          log.success('Badge updated successfully');
        } else {
          log.info('Badge already up to date');
        }
      }
      
    } catch (error) {
      log.error(`Error: ${error}`);
      process.exit(1);
    }
  });

// Print command - just output the teaRank to stdout
program
  .command('print')
  .description('Print the current teaRank to stdout')
  .option('--project-id <id>', 'Tea project ID')
  .option('--name <name>', 'Project name to search for')
  .option('--base-url <url>', 'Tea API base URL')
  .option('--timeout-ms <ms>', 'Request timeout in milliseconds', '10000')
  .option('--retries <count>', 'Number of retries', '3')
  .option('--quiet', 'Suppress all output except rank value')
  .option('--debug', 'Enable debug output')
  .action(async (options: Partial<CLIOptions>) => {
    try {
      const config = getConfig(options);
      setLogLevel({ quiet: config.quiet, debug: config.debug });
      
      if (!config.projectId && !config.name) {
        if (!config.quiet) {
          log.error('Either --project-id or --name must be specified');
        }
        process.exit(1);
      }
      
      const api = new TeaAPIClient(config.baseUrl, config.timeoutMs, config.retries);
      
      const project = config.projectId 
        ? await api.getProjectInfo(config.projectId)
        : await api.searchProject(config.name!);
      
      if (!project) {
        if (!config.quiet) {
          log.error('Project not found');
        }
        process.exit(1);
      }
      
      // In quiet mode, only output the rank
      if (config.quiet) {
        console.log(project.teaRank);
      } else {
        console.log(`${project.name}: ${project.teaRank}`);
      }
      
    } catch (error) {
      if (!options.quiet) {
        log.error(`Error: ${error}`);
      }
      process.exit(1);
    }
  });

program.parse();