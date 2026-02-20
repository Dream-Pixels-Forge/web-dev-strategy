# TOML Command Conversion

This document outlines the conversion of Web Development Strategy extension commands from markdown format to TOML format for QWEN CLI compatibility.

## Overview

All commands have been successfully converted from markdown frontmatter format to TOML configuration format to ensure compatibility with QWEN CLI.

## Files Created

### Main Configuration
- `commands.toml` - Central command registry with all command definitions
- `qwen-extension.json` - Updated to reference TOML configuration

### Individual Command Files
All command files in `commands/wds/` now have both `.md` and `.toml` versions:

| Command | Description | Agent | Category |
|---------|-------------|--------|----------|
| debug-issue | Debug and resolve issues | debugger-agent | debugging |
| deploy-app | Deploy application | deployment-agent | deployment |
| generate-docs | Generate documentation | documentation-agent | documentation |
| improve-accessibility | Improve accessibility | accessibility-agent | accessibility |
| improvement | Code quality improvement | improvement-agent | improvement |
| new-feature | Feature development | code-generation-agent | development |
| optimize-performance | Performance optimization | performance-agent | performance |
| refine-prompt | Prompt refinement | prompt-refiner-agent | utility |
| run-prompt | Execute refined prompts | web-dev-strategy-agent | development |
| run-tests | Comprehensive testing | testing-agent | testing |
| security-audit | Security analysis | security-agent | security |
| update-dependencies | Dependency updates | updater-agent | maintenance |
| verify-accuracy | Accuracy validation | accuracy-verification-agent | verification |
| web-dev-strategy-agent | Main orchestrator | web-dev-strategy-agent | orchestration |

## TOML Structure

Each command TOML file contains:

```toml
[command]
name = "command-name"
description = "Command description"
agent = "agent-name"
category = "category"
arguments = true

[content]
role = "Agent role description"
instructions = """
Detailed instructions for the agent
"""
```

## Configuration Updates

### qwen-extension.json
Updated to include TOML configuration references:
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

## Benefits

1. **QWEN CLI Compatibility**: Commands now work seamlessly with QWEN CLI
2. **Structured Configuration**: TOML provides better structure and validation
3. **Maintainability**: Easier to update and manage command configurations
4. **Backward Compatibility**: Original markdown files preserved for reference

## Usage

Commands can now be used with QWEN CLI using TOML configuration:

```bash
qwen wds new-feature "Add user authentication"
qwen wds deploy-app "production"
qwen wds run-tests
```

## Validation

All TOML files have been validated for:
- Correct syntax
- Required fields presence
- Proper data types
- Consistent structure

The conversion maintains full functionality while providing improved CLI compatibility.
