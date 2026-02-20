# OpenCode Agent Hierarchical Coordination Protocol

This document establishes the hierarchical coordination protocols for the OpenCode agent ecosystem to ensure proper orchestration and eliminate conflicts.

## Hierarchy Structure

### Level 1: Primary Coordinator

- **@web-dev-strategy-agent** (Primary Orchestrator)
  - Responsible for overall project coordination
  - Makes high-level decisions about agent assignments
  - Ensures proper sequence of operations
  - Maintains coordination audit trails

### Level 2: Planning & Analysis Agents

- **@analyst-agent** (Market Analysis)
- **@prd-doc-agent** (Product Requirements)
- **@plan-agent** (Implementation Planning)
- **@trends-agent** (Trend Research)
- **@proposal-agent** (Solution Proposals)

### Level 3: Execution Agents

- **@tasks-agent** (Task Organization)
- **@uiux-agent** (UI/UX Design)
- **@prototyper-agent** (Prototyping)
- **@code-generation-agent** (Code Implementation)

### Level 4: Quality & Support Agents

- **@lint-agent** (Code Quality)
- **@debugger-agent** (Bug Detection)
- **@testing-agent** (Testing)
- **@improvement-agent** (Optimization)
- **@security-agent** (Security)
- **@performance-agent** (Performance)
- **@accessibility-agent** (Accessibility)
- **@accuracy-verification-agent** (Accuracy Validation)

### Level 5: Deployment & Management Agents

- **@deployment-agent** (Deployment)
- **@documentation-agent** (Documentation)
- **@git-master-agent** (Version Control)
- **@improver-agent** (Agent Improvement)

## Coordination Protocols

### 1. Command Chain Protocol

- All agents report to @web-dev-strategy-agent for major decisions
- @web-dev-strategy-agent delegates to appropriate level 2 agents first
- Level 2 agents coordinate with level 3 agents
- Level 3 agents execute and may call level 4 agents as needed
- Level 4 agents validate and report back through the chain

### 2. Mandatory Coordination Checks

Before any agent begins work, it must:

#### For All Agents

1. Check if @web-dev-strategy-agent has initialized the project
2. Verify required templates and skills are available
3. Confirm no conflicting operations are in progress

#### For Planning Agents (@plan-agent, @proposal-agent)

1. Call @trends-agent first for current market/tech insights
2. Ensure @analyst-agent and @prd-doc-agent have completed their work
3. Coordinate with @tasks-agent for task organization

#### For Implementation Agents (@code-generation-agent, @prototyper-agent)

1. Ensure @plan-agent has created roadmap/plan.md
2. Ensure @tasks-agent has created roadmap/tasks.md
3. Coordinate with @uiux-agent when UI/UX is involved

#### For Quality Agents (@lint-agent, @debugger-agent, etc.)

1. Wait for implementation to be complete
2. Report findings to @web-dev-strategy-agent for task creation
3. Coordinate with @code-generation-agent for fixes

### 3. Conflict Resolution Protocol

When conflicts arise between agents:

1. **Level 1**: @web-dev-strategy-agent makes final decisions
2. **Level 2**: Planning agents coordinate through @plan-agent as lead
3. **Level 3**: Implementation agents coordinate through @tasks-agent as lead
4. **Level 4**: Quality agents coordinate through @improvement-agent as lead

### 4. Communication Standards

- All agents must log their activities in coordination audit trail
- Major decisions must be confirmed with parent coordinator
- Status updates should be provided at defined intervals
- Errors or blockers must be escalated immediately

### 5. Resource Management Protocol

- Template and skill access must be coordinated to avoid conflicts
- File write operations must be sequenced to prevent collisions
- Shared resources (like roadmap/ files) must be locked during writes
- Concurrent read operations are permitted

### 6. Error Handling and Escalation

- Level 4 agents encountering persistent issues escalate to @improver-agent
- Implementation failures escalate to @web-dev-strategy-agent
- Planning conflicts escalate to @web-dev-strategy-agent
- Coordination failures escalate to @web-dev-strategy-agent

### 7. Workflow Sequences

#### New Project Sequence

1. @web-dev-strategy-agent initializes project
2. @analyst-agent creates market-analysis.md
3. @prd-doc-agent creates PRD.md
4. @plan-agent creates plan.md (calls @trends-agent first)
5. @tasks-agent creates tasks.md
6. Implementation agents begin work based on roadmap/tasks.md

#### Feature Implementation Sequence

1. @web-dev-strategy-agent validates requirements
2. @proposal-agent creates solution proposal if needed
3. @plan-agent updates plan.md if needed
4. @tasks-agent updates tasks.md if needed
5. @uiux-agent creates design specifications
6. @code-generation-agent implements feature
7. Quality agents validate implementation
8. @accuracy-verification-agent verifies completeness

#### Issue Resolution Sequence

1. @debugger-agent identifies and diagnoses issue
2. @web-dev-strategy-agent creates debugging-tasks.md
3. @code-generation-agent implements fix
4. Quality agents validate fix
5. @accuracy-verification-agent verifies resolution

## Agent Collaboration Guidelines

### When to Collaborate Directly

- Agents may collaborate directly for handoffs (e.g., @uiux-agent → @code-generation-agent)
- Quality agents may collaborate for comprehensive reviews
- @trends-agent may be called by multiple agents as needed

### When to Route Through Coordinator

- All major decisions affecting project direction
- Resource conflicts or access issues
- Disagreements between agents
- Error conditions requiring escalation

### Communication Channels

- Primary: Through @web-dev-strategy-agent for major coordination
- Secondary: Direct agent-to-agent for handoffs and technical collaboration
- Emergency: Direct escalation to @web-dev-strategy-agent for blockers
