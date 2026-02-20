# OpenCode Skills and Templates Registry

This registry documents all available skills and templates in the OpenCode ecosystem for standardized reference by agents.

## Command Configuration

### TOML-Based Command Structure

The extension uses TOML configuration for QWEN CLI compatibility:

- **Main Registry**: `commands.toml` - Central command registry with all 16 commands
- **Individual Commands**: `commands/wds/*.toml` - Individual command configurations
- **Extension Config**: `qwen-extension.json` - Extension metadata and TOML reference

### Available Commands

#### Development Commands

- `new-feature` - Feature implementation and development
- `run-prompt` - Execute refined prompts and generate implementations

#### Quality Commands

- `run-tests` - Comprehensive testing workflows
- `security-audit` - Security analysis and vulnerability assessment
- `optimize-performance` - Performance optimization and profiling
- `improve-accessibility` - WCAG compliance and accessibility improvements
- `verify-accuracy` - Accuracy validation and verification

#### Operations Commands

- `deploy-app` - Production deployment and operations
- `git-commit` - Git operations and version control
- `update-dependencies` - Dependency updates and maintenance

#### Utility Commands

- `generate-docs` - Technical documentation generation
- `debug-issue` - Issue debugging and resolution
- `improvement` - Code quality analysis and optimization
- `refine-prompt` - Prompt enhancement and optimization

#### Orchestration Commands

- `web-dev-strategy-agent` - Main workflow coordination and project management

## Available Skills

### Current Skills Structure

- `skills/react-components/` - React component generation and validation
- `skills/stitch-loop/` - Iterative website building with Stitch
- `skills/design-md/` - Design system documentation generation
- `skills/enhance-prompt/` - Prompt enhancement and optimization
- `skills/remotion/` - Video and animation generation
- `skills/shadcn-ui/` - Shadcn UI component integration

### Skill Categories

- **Frontend Skills**: `react-components`, `stitch-loop`, `shadcn-ui`
- **Design Skills**: `design-md`, `stitch-loop`
- **Utility Skills**: `enhance-prompt`, `remotion`

## Available Templates

### Template Categories

- **UI/UX Templates**: `uiux-patterns/`, `button-patterns.md`, `form-patterns.md`, `modal-patterns.md`
- **Backend Templates**: `api-integration-patterns.md`, `authentication-patterns.md`, `database-patterns.md`
- **Quality Templates**: `security-patterns.md`, `performance-patterns.md`, `accessibility-patterns.md`
- **Process Templates**: `project-structure-patterns.md`, `testing-patterns.md`, `deployment-patterns.md`
- **Specialized Templates**: `anti-hallucination-patterns.md`, `error-handling-patterns.md`, `state-management-patterns.md`

## Standardized Path References

### For Windows Systems

- Skills: `%USERPROFILE%\.qwen\commands\wds\skills\`
- Templates: `%USERPROFILE%\.qwen\commands\wds\templates\`

### For Linux/macOS Systems

- Skills: `~/.qwen/commands/wds/skills/`
- Templates: `~/.qwen/commands/wds/templates/`

## Agent Integration Guidelines

### Skills Usage

Agents should reference skills by category rather than specific directories that may not exist:

- Instead of: `skills/react/` (doesn't exist)
- Use: `skills/react-components/` (exists)

### Template Usage

Agents should reference template categories rather than assuming specific subdirectories:

- Instead of: `templates/uiux-patterns/components/` (may not exist)
- Use: `templates/uiux-patterns/` (exists)

## Validation Checklist for Agents

Before referencing any skill or template, agents should verify:

1. The path exists in the local environment
2. The referenced files are available
3. The content matches expected format
4. Fallback options are available if primary resources are missing
