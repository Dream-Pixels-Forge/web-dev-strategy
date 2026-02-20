# OpenCode Agent Interaction Documentation

Comprehensive documentation of how agents interact with each other in the OpenCode ecosystem.

## Overview

The OpenCode agent ecosystem consists of a hierarchical structure where the @web-dev-strategy-agent orchestrates all other agents. Each agent has specific responsibilities and interaction patterns designed to work together seamlessly.

## Agent Categories and Interactions

### 1. Orchestration Agents

#### @web-dev-strategy-agent (Primary Orchestrator)

- **Role**: Central coordinator for all agent activities
- **Interactions**:
  - Initiates project workflows
  - Coordinates between all other agents
  - Maintains project state and roadmap files
  - Validates prerequisites before delegating tasks
  - Logs all coordination activities in audit trail

- **Communication Pattern**:
  - Receives requests from users or other agents
  - Delegates to appropriate specialized agents
  - Collects results and reports back
  - All documents except from roadmap one, are stored in .dev_notes/ on the root of the project, if this directory aren't existing create it

### 2. Planning and Analysis Agents

#### @analyst-agent ↔ @web-dev-strategy-agent

- **Direction**: @web-dev-strategy-agent → @analyst-agent
- **Purpose**: Create market analysis documentation
- **Output**: roadmap/market-analysis.md
- **Trigger**: When market analysis doesn't exist or needs updating

#### @prd-doc-agent ↔ @web-dev-strategy-agent

- **Direction**: @web-dev-strategy-agent → @prd-doc-agent
- **Purpose**: Create product requirements documentation
- **Output**: roadmap/PRD.md
- **Trigger**: When PRD doesn't exist or needs updating

#### @plan-agent ↔ @web-dev-strategy-agent

- **Direction**: @web-dev-strategy-agent → @plan-agent
- **Purpose**: Create implementation plans
- **Output**: roadmap/plan.md
- **Trigger**: When planning is needed or existing plan needs updates

#### @plan-agent → @trends-agent (Mandatory)

- **Direction**: @plan-agent → @trends-agent
- **Purpose**: Get current market/tech trends before planning
- **Output**: Trend analysis data
- **Trigger**: Always before beginning any planning work

#### @proposal-agent → @trends-agent (Mandatory)

- **Direction**: @proposal-agent → @trends-agent
- **Purpose**: Get current trends before creating proposals
- **Output**: Trend analysis data
- **Trigger**: Always before beginning any proposal work

#### @tasks-agent ↔ @web-dev-strategy-agent

- **Direction**: @web-dev-strategy-agent → @tasks-agent
- **Purpose**: Organize and track implementation tasks
- **Output**: roadmap/tasks.md
- **Trigger**: After planning is complete

### 3. Implementation Agents

#### @uiux-agent ↔ @code-generation-agent

- **Direction**: Bidirectional
- **Purpose**: Design specifications ↔ Implementation
- **Flow**:
  - @code-generation-agent requests @uiux-agent when UI/UX is involved
  - @uiux-agent provides design tokens, components, and interaction specs
  - @code-generation-agent implements based on specifications
- **Output**: Design specifications → React components

#### @prototyper-agent ↔ @uiux-agent

- **Direction**: Bidirectional
- **Purpose**: Prototype creation and validation
- **Flow**:
  - @prototyper-agent collaborates with @uiux-agent for design validation
  - @uiux-agent provides design guidance and feedback
  - @prototyper-agent creates visual prototypes and transforms to React
- **Output**: Visual prototypes → React components

#### @prototyper-agent → @code-generation-agent

- **Direction**: @prototyper-agent → @code-generation-agent
- **Purpose**: Hand off transformed React components for integration
- **Output**: React components for project integration

#### @code-generation-agent ↔ @web-dev-strategy-agent

- **Direction**: @web-dev-strategy-agent → @code-generation-agent
- **Purpose**: Feature implementation based on roadmap/tasks.md
- **Output**: Implemented features and code
- **Trigger**: When tasks are ready for implementation

### 4. Quality and Support Agents

#### @lint-agent ↔ @web-dev-strategy-agent

- **Direction**: Bidirectional
- **Flow**:
  - @lint-agent performs analysis and reports to @web-dev-strategy-agent
  - @web-dev-strategy-agent creates roadmap/lint-tasks.md
  - @code-generation-agent implements fixes based on lint-tasks.md
- **Output**: Code quality improvements

#### @debugger-agent ↔ @web-dev-strategy-agent

- **Direction**: Bidirectional
- **Flow**:
  - @debugger-agent identifies issues and reports to @web-dev-strategy-agent
  - @web-dev-strategy-agent creates roadmap/debugging-tasks.md
  - @code-generation-agent implements fixes based on debugging-tasks.md
- **Output**: Bug fixes and issue resolution

#### @testing-agent, @security-agent, @performance-agent, @accessibility-agent ↔ @web-dev-strategy-agent

- **Direction**: Results reported to @web-dev-strategy-agent
- **Purpose**: Quality validation and reporting
- **Output**: Quality reports and recommendations

#### @accuracy-verification-agent ↔ All Implementation Agents

- **Direction**: @accuracy-verification-agent validates outputs from all implementation agents
- **Purpose**: Final accuracy validation
- **Output**: Verification reports

### 5. Management Agents

#### @improver-agent ↔ All Agents

- **Direction**: Monitors all agents
- **Purpose**: Quality monitoring and improvement
- **Trigger**: When issues persist after multiple attempts or accuracy is below 8/10
- **Output**: Agent improvements and corrections

## Interaction Protocols

### 1. Request-Response Pattern

Most agent interactions follow a request-response pattern:

- Requesting agent sends specific request to target agent
- Target agent processes request and returns response
- Requesting agent continues based on response

### 2. Handoff Pattern

Some interactions involve complete handoffs:

- One agent completes its work and hands off to next agent
- Handoff includes all necessary context and data
- Receiving agent continues workflow from handoff point

### 3. Reporting Pattern

Quality and analysis agents use reporting pattern:

- Agent performs analysis/quality check
- Agent reports findings to @web-dev-strategy-agent
- @web-dev-strategy-agent creates tasks based on report
- Implementation agents work on created tasks

## Coordination Mechanisms

### 1. Roadmap Files

Agents coordinate through shared roadmap files:

- roadmap/tasks.md: Task organization and tracking
- roadmap/plan.md: Implementation plans
- roadmap/market-analysis.md: Market analysis
- roadmap/PRD.md: Product requirements
- roadmap/lint-tasks.md: Code quality tasks
- roadmap/debugging-tasks.md: Bug fixing tasks

### 2. Audit Trails

All coordination activities are logged in audit trails for transparency and debugging.

### 3. State Management

@web-dev-strategy-agent maintains project state and ensures agents work from current state.

## Error Handling in Interactions

### 1. Failed Agent Communications

- If communication fails, requesting agent retries up to 3 times
- If retries fail, issue escalates to @web-dev-strategy-agent
- @web-dev-strategy-agent determines fallback approach

### 2. Resource Unavailability

- If required resources (templates, skills) are unavailable, agent reports to @web-dev-strategy-agent
- @web-dev-strategy-agent coordinates resource availability or provides alternatives

### 3. Conflicting Operations

- If agents detect conflicting operations, they pause and notify @web-dev-strategy-agent
- @web-dev-strategy-agent resolves conflicts before agents resume

## Best Practices for Agent Interactions

### 1. Clear Communication

- Always provide specific, actionable requests
- Include all necessary context in communications
- Return clear, structured responses

### 2. Proper Sequencing

- Follow established workflow sequences
- Respect mandatory call requirements
- Wait for prerequisite completion before starting

### 3. Error Prevention

- Validate prerequisites before beginning work
- Check resource availability beforehand
- Confirm no conflicting operations are in progress

### 4. Documentation

- Log all interactions in audit trails
- Document decisions and rationales
- Maintain clear handoff documentation

## Common Interaction Scenarios

### Scenario 1: New Feature Implementation

1. User requests new feature
2. @web-dev-strategy-agent validates project state
3. @proposal-agent creates solution proposal (calls @trends-agent first)
4. @plan-agent updates roadmap/plan.md (calls @trends-agent first)
5. @tasks-agent updates roadmap/tasks.md
6. @uiux-agent creates design specifications
7. @code-generation-agent implements feature
8. Quality agents validate implementation
9. @accuracy-verification-agent provides final validation

### Scenario 2: Bug Fix

1. Bug is identified
2. @debugger-agent performs root cause analysis
3. @web-dev-strategy-agent creates roadmap/debugging-tasks.md
4. @code-generation-agent implements fix
5. @testing-agent validates fix
6. @accuracy-verification-agent provides final validation

### Scenario 3: Code Quality Improvement

1. Quality issue is identified
2. @lint-agent performs analysis
3. @web-dev-strategy-agent creates roadmap/lint-tasks.md
4. @code-generation-agent implements improvements
5. Quality agents validate improvements
6. @accuracy-verification-agent provides final validation
