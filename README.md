# tea-rank-badge

> Generate and display dynamic teaRank badges for your OSS projects

[![CI](https://github.com/cryptoflops/tea-rank-badge/actions/workflows/ci.yml/badge.svg)](https://github.com/cryptoflops/tea-rank-badge/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tea-rank-badge)](https://www.npmjs.com/package/tea-rank-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- tea-rank-badge-start -->

![teaRank](./.github/tea-rank-badge.svg)

<!-- tea-rank-badge-end -->

## What is tea-rank-badge?

`tea-rank-badge` is a CLI tool and GitHub Action that fetches your project's teaRank from the [Tea Protocol](https://tea.xyz) and generates a beautiful SVG badge. The badge updates automatically via GitHub Actions, with no external services required.

### Features

- 🚀 **Zero-config**: Works out of the box with sensible defaults
- 🎨 **Customizable**: Choose badge style, color, and label
- 🔄 **Automatic updates**: GitHub Action updates badge on schedule
- 🔒 **Secure**: No API keys or secrets required
- ⚡ **Fast**: Built-in retries and timeout handling
- 🧪 **Idempotent**: Only commits when teaRank actually changes

## Installation

### Global Installation

```bash
npm install -g tea-rank-badge
```

### Or use directly with npx

```bash
npx tea-rank-badge --name your-project
```

## CLI Usage

### Basic Usage

```bash
# Search by project name
tea-rank-badge --name curl

# Use specific project ID (more reliable)
tea-rank-badge --project-id 3a83ae3e-f34d-45ca-8dd2-ab4176fc74f2

# Dry run to preview changes
tea-rank-badge --name curl --dry-run

# Custom badge style
tea-rank-badge --name curl --style for-the-badge --label "Tea Rank"

# Skip README update, only generate SVG
tea-rank-badge --name curl --no-readme
```

### Commands

#### `update` (default)
Update or create teaRank badge for a project.

```bash
tea-rank-badge update --name curl
```

#### `print`
Output the current teaRank to stdout (useful for scripts).

```bash
tea-rank-badge print --name curl --quiet
# Output: 67.74
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--project-id <id>` | Tea project ID (preferred) | - |
| `--name <name>` | Project name to search | - |
| `--svg-path <path>` | Path to save SVG badge | `.github/tea-rank-badge.svg` |
| `--readme-path <path>` | Path to README file | `README.md` |
| `--no-readme` | Skip README update | `false` |
| `--label <label>` | Badge label | `teaRank` |
| `--style <style>` | Badge style: flat, flat-square, plastic, for-the-badge | `flat` |
| `--precision <n>` | Decimal precision for rank | `0` |
| `--color <color>` | Override badge color | Auto based on rank |
| `--dry-run` | Preview changes without writing | `false` |
| `--quiet` | Suppress output except errors | `false` |
| `--debug` | Enable debug output | `false` |

### Environment Variables

- `TEA_API_BASE`: Override Tea API base URL
- `TEA_TIMEOUT_MS`: Request timeout in milliseconds (default: 10000)
- `TEA_RETRIES`: Number of retries for failed requests (default: 3)

## GitHub Action Usage

### Quick Start

Create `.github/workflows/tea-rank-badge.yml`:

```yaml
name: Update teaRank Badge

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

permissions:
  contents: write

jobs:
  update-badge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: cryptoflops/tea-rank-badge@v1
        with:
          project_name: your-project-name
          # Or use project_id for exact match
          # project_id: 3a83ae3e-f34d-45ca-8dd2-ab4176fc74f2
```

### Action Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `project_id` | Tea project ID | No* | - |
| `project_name` | Project name to search | No* | - |
| `svg_path` | Path to save SVG | No | `.github/tea-rank-badge.svg` |
| `readme_path` | Path to README | No | `README.md` |
| `label` | Badge label | No | `teaRank` |
| `style` | Badge style | No | `flat` |
| `commit_message` | Git commit message | No | `chore: update teaRank badge [skip ci]` |

*Either `project_id` or `project_name` must be provided

## Badge Customization

### Badge Styles

- `flat` (default)
- `flat-square`
- `plastic`
- `for-the-badge`

### Color Thresholds

The badge color changes automatically based on teaRank:

- 🟢 **Bright Green**: ≥90
- 🟢 **Green**: 75-89
- 🟡 **Yellow-Green**: 60-74
- 🟡 **Yellow**: 40-59
- 🟠 **Orange**: 20-39
- 🔴 **Red**: <20

Override with `--color` option or `color` action input.

## Setup Guide

### 1. Add Badge to README

Add these markers to your README where you want the badge:

```markdown
<!-- tea-rank-badge-start -->

![teaRank](./.github/tea-rank-badge.svg)

<!-- tea-rank-badge-end -->
```

Or run the CLI with `--insert` to add automatically.

### 2. Create GitHub Workflow

Copy the workflow YAML above to `.github/workflows/tea-rank-badge.yml`

### 3. Find Your Project ID (Optional but Recommended)

```bash
# Search for your project
tea-rank-badge print --name your-project --debug

# Use the project ID from the output for more reliable updates
```

## Troubleshooting

### Project Not Found

- Ensure your project is indexed by Tea Protocol
- Try searching with different variations of the name
- Use `--debug` to see all matching projects

### Permission Denied on Push

Ensure your workflow has write permissions:

```yaml
permissions:
  contents: write
```

### Rate Limiting

The CLI automatically handles rate limits with exponential backoff. If you encounter persistent issues:

- Reduce update frequency in your schedule
- Set higher timeout: `--timeout-ms 30000`

### No Changes Detected

The tool is idempotent - it only commits when teaRank actually changes. This is expected behavior.

## Security

- ✅ No API keys or secrets required
- ✅ Read-only API access
- ✅ Commits include `[skip ci]` to prevent workflow loops
- ✅ User-agent identifies the tool for transparency

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © cryptoflops

## Disclaimer

This project fetches teaRank data from the Tea Protocol API (tea.xyz) but is not officially affiliated with or endorsed by Tea Protocol.

## Links

- [NPM Package](https://www.npmjs.com/package/tea-rank-badge)
- [Tea Protocol](https://tea.xyz)
- [Report Issues](https://github.com/cryptoflops/tea-rank-badge/issues)