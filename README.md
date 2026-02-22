# Web Development Strategy Extension

A comprehensive QWEN CLI extension for orchestrating web development workflows with multi-agent coordination, accuracy verification, and MCP server support.

## Overview

The Web Development Strategy Extension provides a complete ecosystem of specialized agents for web development, from initial planning through deployment and maintenance. Built for QWEN CLI with Markdown-based commands and comprehensive agent orchestration.

## Features

### 🚀 Core Capabilities

- **Multi-Agent Orchestration**: Coordinate 25+ specialized agents for comprehensive development workflows
- **Project Management**: Automated roadmap creation, task tracking, and progress monitoring
- **Quality Assurance**: Built-in accuracy verification, security auditing, and performance optimization
- **Template-Driven**: Leverage extensive template library for consistent, high-quality outputs
- **MCP Server**: Access all skills, agents, and commands programmatically
- **QWEN CLI Compatible**: Full Markdown command format with {{args}} parameter injection

### 🎯 Command Categories

| Category | Commands | Purpose |
|----------|----------|---------|
| **Development** | `new-feature`, `run-prompt` | Feature implementation and prompt execution |
| **Testing** | `run-tests` | Comprehensive testing workflows |
| **Deployment** | `deploy-app`, `run-pipeline`, `rollback-deployment`, `monitor-system` | Production deployment and operations |
| **Version Control** | `git-commit` | Git operations and version control |
| **Security** | `security-audit` | Security analysis and vulnerability assessment |
| **Performance** | `optimize-performance` | Performance optimization and profiling |
| **Accessibility** | `improve-accessibility` | WCAG compliance and accessibility improvements |
| **Documentation** | `generate-docs` | Technical documentation generation |
| **Debugging** | `debug-issue` | Issue debugging and resolution |
| **Improvement** | `improvement` | Code quality analysis and optimization |
| **Maintenance** | `update-dependencies` | Dependency updates and maintenance |
| **Verification** | `verify-accuracy` | Accuracy validation and verification |
| **Orchestration** | `web-dev-strategy-agent` | Main workflow coordination |
| **Utility** | `refine-prompt` | Prompt enhancement and optimization |

## Quick Start

### Installation

1. Ensure QWEN CLI is installed
2. Clone this extension to your QWEN extensions directory
3. The extension will be automatically detected and loaded

**Alternative Installation (Auto-Update):**

```bash
# Install extension with auto-update from GitHub
qwen extensions install https://github.com/Dream-Pixels-Forge/web-dev-strategy --auto-update
```

### Basic Usage

```bash
# Start a new feature development workflow
qwen wds new-feature "Add user authentication system"

# Deploy to production
qwen wds deploy-app "production"

# Commit and push changes
qwen wds git-commit "feat: add new authentication system"

# Run comprehensive tests
qwen wds run-tests

# Generate documentation
qwen wds generate-docs

# Performance optimization
qwen wds optimize-performance

# Security audit
qwen wds security-audit
```

### Advanced Workflows

#### Complete Feature Development

```bash
# 1. Refine your requirements (optional)
qwen wds refine-prompt "Add user login with social auth"

# 2. Execute the refined prompt
qwen wds run-prompt "Refined prompt from roadmap/prompt.md"

# 3. The orchestrator will automatically:
#    - Check project status
#    - Create/update roadmap files
#    - Coordinate with planning agents
#    - Execute implementation through specialized agents
#    - Ensure quality and accuracy
```

#### Quality Assurance Pipeline

```bash
# Run complete QA pipeline
qwen wds run-tests
qwen wds security-audit
qwen wds optimize-performance
qwen wds improve-accessibility
qwen wds verify-accuracy
```

## Architecture

### Agent Ecosystem

The extension orchestrates a comprehensive agent ecosystem:

#### Core Agents

- **Web Development Strategy Agent**: Main orchestrator and project manager
- **Plan Agent**: Creates detailed implementation plans
- **Tasks Agent**: Organizes and tracks implementation tasks
- **Code Generation Agent**: Full-stack feature implementation

#### Development Agents

- **UI/UX Agent**: User experience design and implementation
- **Prototyper Agent**: UI prototyping with Google Stitch
- **Grid Master Agent**: Grid layout calculations
- **Debugger Agent**: Issue debugging and resolution

#### Quality-Security Agents

- **Testing Agent**: Comprehensive testing workflows
- **Security Agent**: Security analysis and vulnerability assessment
- **Performance Agent**: Performance optimization and profiling
- **Accessibility Agent**: WCAG compliance and accessibility improvements
- **Accuracy Verification Agent**: Deep accuracy validation
- **Lint Agent**: Code linting and formatting

#### Planning-Docs Agents

- **Analyst Agent**: Market analysis and research
- **PRD Agent**: Product requirements documentation
- **Trends Agent**: Technology and design trend research
- **Proposal Agent**: Research-backed solution proposals

#### Deployment Agents

- **Deployment Agent**: Production deployment workflows
- **CI/CD Agent**: Pipeline automation
- **Rollback Agent**: Automated rollback procedures
- **Monitoring Agent**: Production monitoring and observability

#### Support-Improvements Agents

- **Documentation Agent**: Technical documentation generation
- **Prompt Refiner Agent**: Prompt enhancement
- **Improvement Agent**: Code quality improvements
- **Updater Agent**: Dependency management
- **Improver Agent**: Subagent performance monitoring

#### Git Master Agent

- **Git Master Agent**: Version control with branch-based workflow (main, devs, features)

### Workflow Process

1. **Project Status Check**: Analyze existing project state and roadmap
2. **Market & Requirements Analysis**: Research and document requirements
3. **Planning & Task Organization**: Create detailed plans and task lists
4. **Implementation**: Execute through specialized agents
5. **Quality Assurance**: Multi-layered verification and testing
6. **Documentation**: Generate comprehensive documentation

## Configuration

### Markdown Command Format

The extension uses Markdown format for commands with YAML frontmatter:

```markdown
---
description: Create a complete feature implementation. Use {{args}} to specify the feature request.
---

# new-feature

Call @code-generation-agent to implement the following feature request:

**Feature Request:** {{args}}
```

### Extension Configuration

`qwen-extension.json`:

```json
{
  "name": "web-dev-strategy",
  "version": "0.3.1",
  "contextFileName": "QWEN.md",
  "commands": "commands/wds"
}
```

## Project Structure

```
web-dev-strategy/
├── qwen-extension.json         # Extension configuration (v0.3.1)
├── QWEN.md                    # Context and documentation
├── commands/wds/              # Command files (Markdown format)
│   ├── new-feature.md
│   ├── deploy-app.md
│   ├── git-commit.md
│   ├── run-tests.md
│   └── ... (18 command files)
├── agents/                    # Agent definitions
│   ├── Development/
│   ├── Quality-Security/
│   ├── Planning-Docs/
│   ├── Deployment/
│   ├── Support-Improvements/
│   └── Git master/
├── templates/                 # Template library
├── skills/                   # Extension skills
│   ├── shadcn-ui/
│   ├── remotion/
│   ├── stitch-loop/
│   ├── design-md/
│   ├── react-components/
│   └── ... (search skills)
└── mcp-server/              # MCP server for programmatic access
    ├── src/index.js
    └── package.json
```

## MCP Server

The extension includes an MCP server for programmatic access to all skills, agents, and commands:

### Features

- **Auto-Path Detection**: Automatically finds the extension installation
- **Utility Tools**: List skills, agents, and commands
- **Skill Tools**: Use any of 13 skills directly
- **Agent Tools**: Delegate to any of 25+ agents
- **Command Tools**: Execute any of 18 commands

### Installation

```bash
cd mcp-server
npm install

# Linux/macOS
qwen mcp add web-dev-strategy node ~/.qwen/extensions/web-dev-strategy/mcp-server/src/index.js

# Windows
qwen mcp add web-dev-strategy node "%USERPROFILE%\.qwen\extensions\web-dev-strategy\mcp-server\src\index.js"
```

### Usage

```json
{"name": "list_skills", "arguments": {}}
{"name": "skill_shadcn-ui", "arguments": {"task": "Add a data table"}}
{"name": "agent_code-generation", "arguments": {"task": "Implement user auth"}}
{"name": "command_new-feature", "arguments": {"args": "User dashboard"}}
```

The extension includes a comprehensive template library:

- **Feature Templates**: Common feature patterns and implementations
- **Testing Templates**: Test structures and coverage patterns
- **Security Templates**: Security best practices and checklists
- **Documentation Templates**: Documentation structures and formats
- **Deployment Templates**: Deployment patterns and checklists

## Quality Standards

### Code Quality

- **Zero Tolerance**: No mockups, placeholders, or incomplete implementations
- **Type Safety**: Full TypeScript support and type checking
- **Error Handling**: Comprehensive error handling and validation
- **Performance**: Optimized for speed and efficiency

### Testing Standards

- **Coverage**: >80% code coverage with meaningful tests
- **Reliability**: Deterministic, non-flaky tests
- **Performance**: Test suites execute efficiently (<10 minutes for CI)

### Security Standards

- **OWASP Top 10**: Protection against critical web security risks
- **Secure Coding**: Follow secure coding practices
- **Principle of Least Privilege**: Minimal necessary permissions

### Accessibility Standards

- **WCAG 2.1 AA**: Meet accessibility guidelines
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Proper content announcements

## Integration

### QWEN CLI Integration

Full integration with QWEN CLI features:

- **Command Discovery**: Automatic command registration and discovery
- **Argument Handling**: Flexible argument parsing and validation
- **Help System**: Integrated help and documentation
- **Error Handling**: Comprehensive error reporting and recovery

### External Tool Integration

- **Git Integration**: Version control operations through GitKraken MCP
- **Netlify Integration**: Deployment and hosting through Netlify MCP
- **Supabase Integration**: Database and backend services through Supabase MCP

## Contributing

### Development Setup

1. Clone the repository
2. Ensure QWEN CLI is installed
3. Test commands with `qwen wds <command>`
4. Follow Markdown command format with YAML frontmatter

### Adding New Commands

1. Create command file in `commands/wds/` with `.md` extension
2. Follow the established Markdown format:

   ```markdown
   ---
   description: Command description. Use {{args}} to specify the input.
   ---

   # command-name

   Call @agent-name to perform the action:

   **Input:** {{args}}
   ```

3. Commands should delegate to agents using `@agent-name` syntax

## Support

### Documentation

- **TOML-CONVERSION.md**: Details about TOML conversion
- **QWEN.md**: Complete context and agent documentation
- **mandatory_docs/**: Core workflow and coordination documents

### Troubleshooting

Common issues and solutions:

1. **Command not found**: Verify Markdown syntax in command files
2. **Agent not responding**: Check agent configuration and dependencies
3. **Template missing**: Ensure templates directory is populated
4. **Permission errors**: Verify file permissions and access rights
5. **MCP server not working**: Ensure Node.js is installed and dependencies are installed (`cd mcp-server && npm install`)

## License

See LICENSE file for details.

## Version History

### v0.1.0

- Initial release with TOML configuration
- 15 specialized commands
- Full QWEN CLI compatibility
- Multi-agent orchestration system
- Comprehensive template library

### v0.1.1

- Added git-commit command for version control operations
- Git Master Agent integration
- Updated documentation and examples

### v0.2.0

- Removed all markdown command files (converted to TOML)
- Updated project structure documentation
- Streamlined command configuration to TOML-only format
- Updated all documentation to reflect TOML conversion

### v0.2.1

- Added installation command for auto-update from GitHub
- Updated README with alternative installation method
- Enhanced setup instructions for easier deployment

### v0.3.0

- **MAJOR ARCHITECTURAL IMPROVEMENTS**
- Fixed TOML inconsistencies (standardized unquoted keys)
- Eliminated agent responsibility overlaps
- Streamlined command structure (removed redundancy)
- Created clear agent responsibility matrix
- Updated run-prompt to use code-generation-agent directly
- Enhanced version management and documentation consistency
- Improved maintainability and user experience

### v0.3.1

- **Subagent Improvements**: Updated all 25+ subagents with Qwen best practices
  - Added "USE PROACTIVELY" hints for proactive delegation
  - Standardized YAML frontmatter format
  - Added structured "When to Use This Agent" sections with use case examples
- **Git Master Restructured**: Converted from folder-based to branch-based workflow
  - Uses 3 git branches: main, devs, features
  - Updated all references and workflow diagrams
- **Command Updates**: Converted all 18 commands to new format
  - Use {{args}} parameter injection syntax
  - Call corresponding agents using @agent-name
  - Simplified YAML frontmatter
- **MCP Server**: Added new MCP server for programmatic access
  - Auto-path detection for extension location
  - Utility, skill, agent, and command tools
  - Full documentation in mcp-server/README.md
