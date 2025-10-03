# Publishing Checklist for tea-rank-badge

## Prerequisites ✅
- [x] CLI implementation complete
- [x] Tests written and passing (integration tests)
- [x] GitHub Action wrapper created
- [x] Documentation complete
- [x] .npmignore configured
- [x] Build successful

## 1. NPM Publishing
```bash
# Login to npm (if not already)
npm login

# Publish the package
npm publish --access public

# Verify installation works
npm i -g tea-rank-badge
tea-rank-badge --help
tea-rank-badge --name curl --dry-run
```

## 2. GitHub Repository Setup
Since GitHub CLI is not installed, create the repository manually:

1. Go to https://github.com/new
2. Repository name: `tea-rank-badge`
3. Description: "Automatically update teaRank badges for your Tea Protocol OSS projects"
4. Public repository
5. Do NOT initialize with README, .gitignore, or license (we have them)
6. Create repository

Then push your local code:
```bash
# Add the remote (replace 'cryptoflops' with your GitHub username)
git remote add origin https://github.com/cryptoflops/tea-rank-badge.git

# Push all branches and tags
git push -u origin main
```

## 3. GitHub Repository Configuration

After pushing, on GitHub:

1. **Add Topics**: 
   - Go to repository Settings (gear icon on main page)
   - Add topics: `teaprotocol`, `tea`, `github-actions`, `badge`, `oss`, `npm`, `cli`

2. **Create Release**:
   ```bash
   # Create and push version tag
   git tag v0.1.0
   git push origin v0.1.0
   ```
   
   Then on GitHub:
   - Go to Releases → Create a new release
   - Choose tag: v0.1.0
   - Release title: "v0.1.0 - Initial Release"
   - Description: Include features, usage example, and link to npm package
   - Publish release

3. **Create v1 tag for Action users**:
   ```bash
   git tag v1
   git push origin v1
   ```

## 4. Update action.yml for Published Package

Once published to npm, update the action.yml to use the npm package:
```bash
# Edit action.yml to use tea-rank-badge@latest instead of tea-rank-badge@latest
# This is already correct in our implementation
```

## 5. Create Demo Repository

1. Create new repository: `tea-rank-badge-demo`
2. Add README.md with basic content
3. Copy the workflow from `.github/workflows/tea-rank-badge.yml.example`
4. Update workflow to use `cryptoflops/tea-rank-badge@v1`
5. Run workflow manually to test

## 6. Register with Tea Protocol

1. Go to https://app.tea.xyz/
2. Sign in / Create account
3. Link your GitHub account
4. Find and register `tea-rank-badge` repository
5. Accept and merge the constitution PR when it arrives
6. Wait for indexing (can take a few hours)

## 7. Final Verification

- [ ] Package visible on npm: https://www.npmjs.com/package/tea-rank-badge
- [ ] GitHub Action works in demo repo
- [ ] Badge updates correctly
- [ ] README markers work properly
- [ ] Dry-run mode works
- [ ] CI/CD passing

## 8. Announce!

Once everything is working:
1. Create a Twitter/X post with example badge
2. Post in Tea Protocol Discord/community
3. Update your own projects to use it
4. Consider writing a blog post/tutorial

## Quick Test Commands

After npm publish:
```bash
# Global install test
npm i -g tea-rank-badge
tea-rank-badge --version
tea-rank-badge --help

# npx test
npx tea-rank-badge@latest --name curl --dry-run

# In a test directory
mkdir test-tea-badge && cd test-tea-badge
echo "# Test Project" > README.md
npx tea-rank-badge@latest --name curl --insert
cat README.md
ls -la .github/
```