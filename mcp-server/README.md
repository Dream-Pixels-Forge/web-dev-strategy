# Web Dev Strategy MCP Server

This MCP server provides access to all skills, agents, and commands from the web-dev-strategy extension.

## Auto-Path Detection

The MCP server automatically detects the extension path by searching in:
1. `~/.qwen/extensions/web-dev-strategy/` (Linux/macOS)
2. `%USERPROFILE%\.qwen\extensions\web-dev-strategy\` (Windows)
3. Current directory (fallback)

The server will output the detected path on startup so you can verify it found the correct location.

## Installation

1. Navigate to the mcp-server directory:
   ```bash
   cd ~/.qwen/extensions/web-dev-strategy/mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Option 1: Using qwen CLI (Recommended)

Add the MCP server to your Qwen Code configuration:

**Project scope (default):**
```bash
qwen mcp add web-dev-strategy node ~/.qwen/extensions/web-dev-strategy/mcp-server/src/index.js
```

**User scope (available across all projects):**
```bash
qwen mcp add --scope user web-dev-strategy node ~/.qwen/extensions/web-dev-strategy/mcp-server/src/index.js
```

**With description:**
```bash
qwen mcp add --description "Web Dev Strategy - Skills, Agents, Commands" web-dev-strategy node ~/.qwen/extensions/web-dev-strategy/mcp-server/src/index.js
```

**With trust (skip confirmations):**
```bash
qwen mcp add --trust web-dev-strategy node ~/.qwen/extensions/web-dev-strategy/mcp-server/src/index.js
```

### Option 2: Manual Configuration

Add to your `.qwen/settings.json`:

```json
{
  "mcpServers": {
    "web-dev-strategy": {
      "command": "node",
      "args": ["{{PATH_TO}}/mcp-server/src/index.js"],
      "description": "Web Dev Strategy - Skills, Agents, and Commands",
      "trust": true,
      "timeout": 300000
    }
  }
}
```

Replace `{{PATH_TO}}` with:
- Linux/macOS: `/home/<username>` or `$HOME`
- Windows: `%USERPROFILE%`

## Management Commands

### List installed MCP servers
```bash
qwen mcp list
```

### Remove MCP server
```bash
qwen mcp remove web-dev-strategy
```

### Verify installation

After adding the server, restart Qwen Code and verify it's connected:
```bash
qwen mcp list
```

You should see `web-dev-strategy` in the list with status "Connected".

## Available Tools

### Utility Tools

| Tool | Description |
|------|-------------|
| `list_skills` | List all available skills |
| `list_agents` | List all available agents (optionally filter by category) |
| `list_commands` | List all available commands |
| `get_skill_content` | Get full content of a specific skill |
| `get_agent_content` | Get full content of a specific agent |
| `get_command_content` | Get full content of a specific command |

### Skill Tools

Use skills directly with tasks:

| Tool | Description |
|------|-------------|
| `skill_shadcn-ui` | Use shadcn/ui components |
| `skill_remotion` | Create videos with Remotion |
| `skill_enhance-prompt` | Enhance prompts for better results |
| `skill_stitch-loop` | Build websites with Stitch |
| `skill_design-md` | Create design system documents |
| `skill_react-components` | Generate React components |
| `skill_code-search` | Search for code patterns |
| `skill_people-search` | Search for people information |
| `skill_company-search` | Search for company information |
| And more... |

### Agent Tools

Delegate tasks to specialized agents:

| Tool | Description |
|------|-------------|
| `agent_code-generation` | Feature implementation |
| `agent_debugger` | Debugging and issue resolution |
| `agent_testing` | Testing workflows |
| `agent_deployment` | Production deployment |
| `agent_security` | Security analysis |
| `agent_uiux` | UI/UX design |
| And more... |

### Command Tools

Execute commands:

| Tool | Description |
|------|-------------|
| `command_new-feature` | Create new feature |
| `command_deploy-app` | Deploy application |
| `command_run-tests` | Run tests |
| `command_debug-issue` | Debug issues |
| And more... |

## Usage Examples

### List all skills
```json
{
  "name": "list_skills",
  "arguments": {}
}
```

### Get a specific skill
```json
{
  "name": "get_skill_content",
  "arguments": {
    "skill_name": "shadcn-ui"
  }
}
```

### Use a skill with a task
```json
{
  "name": "skill_shadcn-ui",
  "arguments": {
    "task": "Add a data table component with sorting and pagination"
  }
}
```

### Use an agent
```json
{
  "name": "agent_code-generation",
  "arguments": {
    "task": "Implement a user authentication module with login and registration"
  }
}
```

### Execute a command
```json
{
  "name": "command_new-feature",
  "arguments": {
    "args": "User dashboard with charts and analytics"
  }
}
```

## Available Skills

- `x-search` - Search functionality
- `research-paper-search` - Research paper search
- `personal-site-search` - Personal website search
- `people-search` - People search
- `company-search` - Company search
- `financial-report-search` - Financial report search
- `code-search` - Code search
- `shadcn-ui` - shadcn/ui components
- `remotion` - Video generation
- `enhance-prompt` - Prompt enhancement
- `stitch-loop` - Website building
- `design-md` - Design documentation
- `react-components` - React components

## Available Agents

### Development
- code-generation
- debugger
- uiux
- prototyper
- grid-master

### Quality-Security
- testing
- security
- lint
- performance
- accessibility
- accuracy-verification

### Planning-Docs
- plan
- tasks
- proposal
- prd-doc
- analyst
- trends

### Deployment
- deployment
- ci-cd
- rollback
- monitoring

### Support-Improvements
- documentation
- prompt-refiner
- improvement
- updater
- improver

### Git
- git-master

## Available Commands

- new-feature
- deploy-app
- debug-issue
- run-tests
- security-audit
- update-dependencies
- verify-accuracy
- rollback-deployment
- run-pipeline
- refine-prompt
- run-prompt
- monitor-system
- improvement
- optimize-performance
- improve-accessibility
- generate-docs
- git-commit
- web-dev-strategy-agent
