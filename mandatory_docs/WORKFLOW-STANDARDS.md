# OpenCode Agent Workflow Sequences and Mandatory Calls

This document standardizes workflow sequences and mandatory calls across the OpenCode agent ecosystem to eliminate conflicts and ensure proper execution order.

## Standardized Workflow Sequences

### 1. New Project Initialization Sequence

This sequence runs when starting a new project:

1. **@web-dev-strategy-agent** - Check for existing roadmap/tasks.md
   - If exists: Continue from current state
   - If NOT exists: Create roadmap folder and initialize plan.md and tasks.md

2. **@web-dev-strategy-agent** - Check for existing roadmap/market-analysis.md
   - If exists: Continue with existing analysis
   - If NOT exists: Call @analyst-agent to create market-analysis.md

3. **@web-dev-strategy-agent** - Check for existing roadmap/PRD.md
   - If exists: Continue with existing PRD
   - If NOT exists: Call @prd-doc-agent to create PRD.md

4. **@web-dev-strategy-agent** - Call @plan-agent to create/update roadmap/plan.md
   - @plan-agent automatically calls @trends-agent first for market/tech insights

5. **@web-dev-strategy-agent** - Call @tasks-agent to create/update roadmap/tasks.md

6. **@web-dev-strategy-agent** - Proceed with implementation based on roadmap/tasks.md

### 2. Feature Implementation Sequence

This sequence runs when implementing a new feature:

1. **@web-dev-strategy-agent** - Analyze request and validate prerequisites
   - Ensure roadmap/tasks.md exists and is current
   - Verify required templates and skills are available

2. **@web-dev-strategy-agent** - If complex feature, call @proposal-agent
   - @proposal-agent calls @trends-agent first for current insights

3. **@web-dev-strategy-agent** - Update roadmap/plan.md and roadmap/tasks.md if needed

4. **@code-generation-agent** - Begin implementation following roadmap/tasks.md
   - If UI/UX involved: Call @uiux-agent first for design specifications
   - If prototyping needed: Call @prototyper-agent for visual prototypes

5. **Quality agents** - Validate implementation (can run in parallel)
   - @testing-agent - Functional and unit testing
   - @security-agent - Security validation
   - @performance-agent - Performance validation
   - @accessibility-agent - Accessibility validation

6. **@accuracy-verification-agent** - Final accuracy validation

### 3. Issue Resolution Sequence

This sequence runs when addressing bugs or issues:

1. **@debugger-agent** - Identify and diagnose the issue
   - Perform root cause analysis
   - Create debugging report

2. **@web-dev-strategy-agent** - Create roadmap/debugging-tasks.md from report

3. **@code-generation-agent** - Implement fixes following debugging-tasks.md

4. **@testing-agent** - Validate that fixes resolve issues without introducing new ones

5. **@accuracy-verification-agent** - Final validation of fix completeness

### 4. Code Quality Improvement Sequence

This sequence runs when addressing code quality issues:

1. **@lint-agent** - Perform code quality analysis
   - Identify linting issues
   - Create quality report

2. **@web-dev-strategy-agent** - Create roadmap/lint-tasks.md from report

3. **@code-generation-agent** - Implement fixes following lint-tasks.md

4. **@improvement-agent** - Perform additional code quality analysis if needed

5. **@accuracy-verification-agent** - Final validation

### 5. Version Control Operations Sequence

This sequence runs for git operations:

1. **@git-master-agent** - Perform repository analysis and git operations
   - Analyze current repository state and staged changes
   - Review changes for quality and completeness
   - Commit with descriptive, conventional commit messages
   - Push changes to appropriate branch
   - Verify successful push and repository state
   - Handle branch operations and merges
   - Resolve merge conflicts when needed

2. **@web-dev-strategy-agent** - Update project documentation and roadmap
   - Ensure git operations are logged in coordination audit trail
   - Update project status after git operations
   - Coordinate with other agents as needed

## Mandatory Call Standards

### 1. Pre-Execution Checks (Required for all agents)

Every agent must perform these checks before beginning work:

1. **Validate Prerequisites**:
   - Check that required input files exist
   - Verify necessary templates and skills are available
   - Confirm no conflicting operations are in progress

2. **Coordinate with Orchestrator**:
   - Notify @web-dev-strategy-agent of intent to execute
   - Receive confirmation that it's safe to proceed
   - Log intent in coordination audit trail

3. **Resource Availability Check**:
   - Verify access to required tools and MCP services
   - Confirm sufficient system resources are available
   - Check that shared resources are not locked by other agents

### 2. Planning Agent Mandatory Calls

Agents in the planning category must follow these standards:

#### @plan-agent Mandatory Sequence

1. **ALWAYS** call @trends-agent first for current market/tech insights
2. **ALWAYS** verify @analyst-agent and @prd-doc-agent have completed their work
3. **ALWAYS** coordinate with @tasks-agent for task organization
4. **ALWAYS** update roadmap/plan.md with current trends information

#### @proposal-agent Mandatory Sequence

1. **ALWAYS** call @trends-agent first for current market/tech insights
2. **ALWAYS** reference existing market-analysis.md and PRD.md
3. **ALWAYS** coordinate with @plan-agent to ensure alignment
4. **ALWAYS** provide clear implementation path in proposal

### 3. Implementation Agent Mandatory Calls

Agents in the implementation category must follow these standards:

#### @code-generation-agent Mandatory Sequence

1. **ALWAYS** verify roadmap/tasks.md exists and is current
2. **IF** UI/UX work is involved, **ALWAYS** call @uiux-agent first
3. **ALWAYS** check templates/ directory for relevant patterns before implementation
4. **ALWAYS** follow established patterns from templates/
5. **ALWAYS** document code in .dev_notes/ folder

#### @prototyper-agent Mandatory Sequence

1. **ALWAYS** verify Google Stitch MCP is available
2. **ALWAYS** check skills/ and templates/ directories for relevant patterns
3. **ALWAYS** coordinate with @uiux-agent for design validation
4. **ALWAYS** transform prototypes to React components using skills/react-components/

#### @uiux-agent Mandatory Sequence

1. **ALWAYS** check templates/uiux-patterns/ directory for relevant patterns
2. **ALWAYS** check skills/design-md/ directory for design methodology
3. **ALWAYS** create detailed specifications for @code-generation-agent
4. **ALWAYS** ensure accessibility compliance using templates/accessibility-patterns.md

### 4. Quality Agent Mandatory Calls

Quality agents must follow these standards:

#### All Quality Agents

1. **ALWAYS** verify the target code/components exist and are accessible
2. **ALWAYS** reference relevant templates/ for quality standards
3. **ALWAYS** report findings to @web-dev-strategy-agent for task creation
4. **ALWAYS** coordinate with @code-generation-agent for fixes

#### @lint-agent Specific

1. **ALWAYS** run comprehensive linting analysis
2. **ALWAYS** create detailed lint-tasks.md for @web-dev-strategy-agent
3. **ALWAYS** validate fixes after @code-generation-agent implements them

#### @debugger-agent Specific

1. **ALWAYS** perform thorough root cause analysis
2. **ALWAYS** create detailed debugging-tasks.md for @web-dev-strategy-agent
3. **ALWAYS** validate fixes after @code-generation-agent implements them

## Exception Handling Standards

### 1. Resource Unavailability

If required resources (templates, skills, tools) are unavailable:

1. **Log the issue** in coordination audit trail
2. **Attempt fallback options** if available
3. **Escalate to @web-dev-strategy-agent** if no fallback available
4. **Wait for resolution** before proceeding

### 2. Dependency Failures

If mandatory dependencies fail:

1. **Document the failure** in audit trail
2. **Attempt retry** up to 3 times if appropriate
3. **Escalate to @web-dev-strategy-agent** if retries fail
4. **Follow fallback procedures** as directed

### 3. Coordination Conflicts

If coordination conflicts arise:

1. **Pause execution** immediately
2. **Notify @web-dev-strategy-agent** of conflict
3. **Wait for resolution** before proceeding
4. **Resume only with explicit authorization**

## Validation and Verification Standards

### 1. Pre-Execution Validation

Before executing, each agent must validate:

- Input requirements are met
- Prerequisites are satisfied
- Resources are available
- No conflicts exist with other operations

### 2. During Execution Monitoring

During execution, agents should monitor:

- Progress against expected milestones
- Resource utilization
- Potential conflicts with other agents
- Quality standards compliance

### 3. Post-Execution Verification

After execution, agents must verify:

- Outputs meet quality standards
- Files are properly saved and accessible
- Coordination logs are updated
- Next steps are properly handed off
