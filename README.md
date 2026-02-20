# Web Development Strategy Extension

A comprehensive QWEN CLI extension for orchestrating web development workflows with multi-agent coordination and accuracy verification.

## Overview

The Web Development Strategy Extension provides a complete ecosystem of specialized agents for web development, from initial planning through deployment and maintenance. Built for QWEN CLI with TOML-based configuration for maximum compatibility and performance.

## Features

### 🚀 Core Capabilities

- **Multi-Agent Orchestration**: Coordinate 15+ specialized agents for comprehensive development workflows
- **Project Management**: Automated roadmap creation, task tracking, and progress monitoring
- **Quality Assurance**: Built-in accuracy verification, security auditing, and performance optimization
- **Template-Driven**: Leverage extensive template library for consistent, high-quality outputs
- **QWEN CLI Compatible**: Full TOML configuration support for seamless CLI integration

### 🎯 Command Categories

| Category      | Commands               | Purpose                                           |
|---------------|------------------------|---------------------------------------------------|
| **Development** | `new-feature`, `run-prompt` | Feature implementation and prompt execution |
| **Testing** | `run-tests` | Comprehensive testing workflows |
| **Deployment** | `deploy-app` | Production deployment and operations |
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

#### Quality Agents

- **Testing Agent**: Comprehensive testing workflows
- **Security Agent**: Security analysis and vulnerability assessment
- **Performance Agent**: Performance optimization and profiling
- **Accessibility Agent**: WCAG compliance and accessibility improvements
- **Accuracy Verification Agent**: Deep accuracy validation

#### Specialized Agents

- **UI/UX Agent**: User experience design and implementation
- **Prototyper Agent**: UI prototyping with Google Stitch
- **Debugger Agent**: Issue debugging and resolution
- **Documentation Agent**: Technical documentation generation
- **Deployment Agent**: Production deployment workflows
- **Git Master Agent**: Version control operations and repository management

#### Analysis Agents

- **Analyst Agent**: Market analysis and research
- **PRD Agent**: Product requirements documentation
- **Trends Agent**: Technology and design trend research

### Workflow Process

1. **Project Status Check**: Analyze existing project state and roadmap
2. **Market & Requirements Analysis**: Research and document requirements
3. **Planning & Task Organization**: Create detailed plans and task lists
4. **Implementation**: Execute through specialized agents
5. **Quality Assurance**: Multi-layered verification and testing
6. **Documentation**: Generate comprehensive documentation

## Configuration

### TOML Structure

The extension uses TOML configuration for QWEN CLI compatibility:

```toml
[commands]
[commands.new-feature]
name = "new-feature"
description = "Create complete feature implementation"
agent = "code-generation-agent"
category = "development"
arguments = true
```

### Extension Configuration

`qwen-extension.json`:

```json
{
  "name": "web-dev-strategy",
  "version": "0.1.0",
  "contextFileName": "QWEN.md",
  "commandsConfig": "commands.toml",
  "commandsPath": "commands/wds",
  "format": "toml"
}
```

## Project Structure

```
web-dev-strategy/
├── commands.toml              # Main command registry
├── qwen-extension.json         # Extension configuration
├── QWEN.md                   # Context and documentation
├── commands/wds/              # Individual command files (TOML format)
│   ├── new-feature.toml
│   ├── deploy-app.toml
│   ├── git-commit.toml
│   ├── run-tests.toml
│   └── ... (15 total TOML files)
├── agents/                    # Agent definitions
├── templates/                 # Template library
├── mandatory_docs/            # Core documentation
└── skills/                   # Extension skills
```

## Templates and Patterns

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
4. Follow TOML configuration standards

### Adding New Commands

1. Create command file in `commands/wds/` with `.toml` extension (markdown files no longer supported)
2. Add command to `commands.toml` registry
3. Follow the established TOML structure:

   ```toml
   [command]
   name = "command-name"
   description = "Command description"
   agent = "agent-name"
   category = "category"
   arguments = true

   [content]
   role = "Agent role description"
   instructions = "Detailed instructions"
   ```

## Support

### Documentation

- **TOML-CONVERSION.md**: Details about TOML conversion
- **QWEN.md**: Complete context and agent documentation
- **mandatory_docs/**: Core workflow and coordination documents

### Troubleshooting

Common issues and solutions:

1. **Command not found**: Verify TOML syntax in commands.toml
2. **Agent not responding**: Check agent configuration and dependencies
3. **Template missing**: Ensure templates directory is populated
4. **Permission errors**: Verify file permissions and access rights

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
