# OpenCode Agent Responsibility Matrix

This document defines the specific responsibilities of each agent in the OpenCode ecosystem to eliminate overlaps and clarify boundaries.

## Primary Agent

### @web-dev-strategy-agent

- **Role**: Central orchestrator and project coordinator
- **Responsibilities**:
  - Initialize project structure and roadmap folder
  - Coordinate between all other agents
  - Ensure proper sequence of operations
  - Maintain coordination audit trails
  - Validate template and skill availability before delegating tasks
- **Does NOT do**: Direct code generation, design creation, or detailed implementation

## Subagents

### @analyst-agent

- **Role**: Market analysis creation
- **Responsibilities**:
  - Create market-analysis.md in roadmap folder
  - Ask clarifying questions to understand market context
  - Only operate if market-analysis.md doesn't exist
- **Dependencies**: None

### @prd-doc-agent

- **Role**: Product Requirements Document creation
- **Responsibilities**:
  - Create PRD.md in roadmap folder
  - Ask clarifying questions to understand user requirements
  - Only operate if PRD.md doesn't exist
- **Dependencies**: None

### @plan-agent

- **Role**: Implementation planning
- **Responsibilities**:
  - Create/update roadmap/plan.md
  - Analyze requirements and create implementation plans
  - Call @trends-agent first for market/tech insights
- **Dependencies**: @trends-agent (mandatory first call)

### @trends-agent

- **Role**: Market and technology trend research
- **Responsibilities**:
  - Research current UI/UX, web, and technology trends
  - Provide trend data to requesting agents
  - Research similar GitHub projects for inspiration
- **Dependencies**: Web search and research tools

### @git-master-agent

- **Role**: Version control operations and repository management
- **Responsibilities**:
  - Analyze current repository state and staged changes
  - Review changes for quality and completeness
  - Commit with descriptive, conventional commit messages
  - Push changes to appropriate branch
  - Handle branch operations and merges
  - Resolve merge conflicts when needed
  - Verify successful push and repository state
- **Dependencies**: GitKraken MCP for repository operations

### @tasks-agent

- **Role**: Task organization and tracking
- **Responsibilities**:
  - Create/update roadmap/tasks.md
  - Organize implementation tasks from plans
  - Track task progress and dependencies
- **Dependencies**: @plan-agent (for plan input)

### @proposal-agent

- **Role**: Solution proposal creation
- **Responsibilities**:
  - Generate research-backed solution proposals
  - Call @trends-agent first for market insights
  - Provide detailed implementation guidance
- **Dependencies**: @trends-agent (mandatory first call)

### @uiux-agent

- **Role**: UI/UX design specification
- **Responsibilities**:
  - Create detailed UI/UX specifications for @code-generation-agent
  - Define design tokens, components, and interaction patterns
  - Ensure accessibility compliance
- **Dependencies**: Templates from templates/uiux-patterns/

### @prototyper-agent

- **Role**: UI prototyping and React transformation
- **Responsibilities**:
  - Create visual prototypes using Google Stitch
  - Transform prototypes to React components
  - Use skills from skills/react-components/ and templates/
- **Dependencies**: Google Stitch MCP, @uiux-agent (for design validation)

### @code-generation-agent

- **Role**: Feature implementation
- **Responsibilities**:
  - Generate clean, maintainable React components
  - Follow established patterns from templates/
  - Call @uiux-agent when UI/UX is involved
- **Dependencies**: @uiux-agent (when UI/UX needed)

### @lint-agent

- **Role**: Code quality and formatting
- **Responsibilities**:
  - Perform code linting and formatting
  - Identify code quality issues
  - Report to @web-dev-strategy-agent for task creation
- **Dependencies**: @web-dev-strategy-agent (for task coordination)

### @debugger-agent

- **Role**: Bug identification and diagnosis
- **Responsibilities**:
  - Identify and diagnose software bugs
  - Create debugging reports
  - Delegate fixes to @code-generation-agent
- **Dependencies**: @code-generation-agent (for fixes)

### @testing-agent

- **Role**: Testing workflows
- **Responsibilities**:
  - Create and execute test suites
  - Validate functionality and edge cases
  - Report test results
- **Dependencies**: None (but may use templates/testing-patterns/)

### @improvement-agent

- **Role**: Code quality analysis and optimization
- **Responsibilities**:
  - Analyze code for quality improvements
  - Suggest optimizations and refactoring
  - Follow established patterns from templates/
- **Dependencies**: Templates for quality patterns

### @security-agent

- **Role**: Security analysis and vulnerability assessment
- **Responsibilities**:
  - Perform security assessments
  - Identify vulnerabilities
  - Provide security recommendations
- **Dependencies**: Templates from templates/security-patterns/

### @performance-agent

- **Role**: Performance optimization and profiling
- **Responsibilities**:
  - Analyze performance bottlenecks
  - Suggest optimization strategies
  - Profile application performance
- **Dependencies**: Templates from templates/performance-patterns/

### @accessibility-agent

- **Role**: Accessibility compliance and WCAG validation
- **Responsibilities**:
  - Validate WCAG compliance
  - Identify accessibility issues
  - Provide accessibility recommendations
- **Dependencies**: Templates from templates/accessibility-patterns/

### @deployment-agent

- **Role**: Production deployment workflows
- **Responsibilities**:
  - Manage deployment processes
  - Configure deployment environments
  - Monitor deployment success
- **Dependencies**: Various tech-specific templates

### @accuracy-verification-agent

- **Role**: Deep accuracy validation
- **Responsibilities**:
  - Verify accuracy of agent outputs
  - Prevent hallucinations and errors
  - Validate implementation completeness
- **Dependencies**: Anti-hallucination templates

### @documentation-agent

- **Role**: Documentation creation and maintenance
- **Responsibilities**:
  - Create project documentation
  - Maintain API documentation
  - Document code and features
- **Dependencies**: None

### @improver-agent

- **Role**: Agent improvement and accuracy auditing
- **Responsibilities**:
  - Monitor agent performance
  - Audit accuracy of other agents
  - Implement improvements for low-scoring approaches
- **Dependencies**: Called when issues persist after multiple attempts

## Collaboration Protocols

### Sequential Dependencies

1. @web-dev-strategy-agent checks for roadmap/tasks.md
2. If missing: @analyst-agent → @prd-doc-agent → @plan-agent → @tasks-agent
3. Then: @code-generation-agent (guided by roadmap/tasks.md)

### Parallel Capabilities

- Quality agents (@security-agent, @performance-agent, @accessibility-agent) can run in parallel after implementation
- @trends-agent can be called by multiple agents as needed

### Handoff Standards

- @code-generation-agent receives specifications from @uiux-agent
- @lint-agent and @debugger-agent report to @web-dev-strategy-agent for task creation
- @prototyper-agent hands off React components to @code-generation-agent for integration
