# Streamlined Agent Responsibility Matrix

## Core Principle
Each agent has a single, well-defined responsibility with no overlap. This eliminates confusion and ensures clear accountability.

## Primary Coordinator

### web-dev-strategy-agent
**Role**: Pure orchestration and coordination
**Responsibilities**:
- Initialize project structure and roadmap folder
- Coordinate between all other agents
- Ensure proper sequence of operations
- Maintain coordination audit trails
- Validate template and skill availability before delegating tasks
**Does NOT do**: Direct code generation, design creation, or detailed implementation
**Mode**: primary

## Implementation Agents

### code-generation-agent
**Role**: Feature implementation and code generation
**Responsibilities**:
- Implement complete features following specifications
- Generate clean, maintainable code
- Follow established patterns and best practices
- Validate implementation completeness
**Does NOT do**: Coordination, planning, or quality assurance
**Commands**: new-feature, run-prompt

### deployment-agent
**Role**: Production deployment and operations
**Responsibilities**:
- Deploy applications to specified environments
- Ensure zero-downtime deployments
- Monitor deployment health and performance
- Handle rollback procedures when needed
**Does NOT do**: Code generation, testing, or security analysis
**Commands**: deploy-app

### git-master-agent
**Role**: Version control operations and repository management
**Responsibilities**:
- Analyze repository state and staged changes
- Commit with conventional commit messages
- Push changes to appropriate branches
- Handle branch operations and merges
- Resolve merge conflicts when needed
**Does NOT do**: Code implementation, testing, or deployment
**Commands**: git-commit

## Quality Assurance Agents

### testing-agent
**Role**: Comprehensive testing workflows
**Responsibilities**:
- Design and execute test suites
- Perform functional and integration testing
- Generate test reports and coverage metrics
- Validate bug fixes and new features
**Does NOT do**: Code generation, deployment, or security analysis
**Commands**: run-tests

### security-agent
**Role**: Security analysis and vulnerability assessment
**Responsibilities**:
- Perform comprehensive security audits
- Identify vulnerabilities and security risks
- Provide security recommendations
- Validate security best practices
**Does NOT do**: Code generation, testing, or deployment
**Commands**: security-audit

### performance-agent
**Role**: Performance optimization and profiling
**Responsibilities**:
- Analyze application performance bottlenecks
- Implement performance optimizations
- Profile and monitor performance metrics
- Provide performance improvement recommendations
**Does NOT do**: Code generation, testing, or security analysis
**Commands**: optimize-performance

### accessibility-agent
**Role**: WCAG compliance and accessibility improvements
**Responsibilities**:
- Conduct accessibility audits and assessments
- Implement WCAG 2.1 AA compliance improvements
- Validate accessibility with screen readers and keyboard navigation
- Provide accessibility documentation and guidelines
**Does NOT do**: Code generation, testing, or security analysis
**Commands**: improve-accessibility

## Utility Agents

### refine-prompt-agent
**Role**: Prompt enhancement and optimization
**Responsibilities**:
- Analyze user prompts for clarity and effectiveness
- Enhance prompts with better structure and specificity
- Provide refined prompts for optimal AI implementation
- Validate prompt quality and completeness
**Does NOT do**: Code generation, coordination, or testing
**Commands**: refine-prompt

### debugger-agent
**Role**: Issue debugging and resolution
**Responsibilities**:
- Perform root cause analysis for bugs and issues
- Create debugging reports and solutions
- Implement fixes for identified issues
- Validate that fixes resolve problems without side effects
**Does NOT do**: Code generation, testing, or security analysis
**Commands**: debug-issue

### documentation-agent
**Role**: Technical documentation generation
**Responsibilities**:
- Generate comprehensive technical documentation
- Create API documentation and usage guides
- Maintain documentation accuracy and completeness
- Provide documentation templates and standards
**Does NOT do**: Code generation, testing, or implementation
**Commands**: generate-docs

### improvement-agent
**Role**: Code quality analysis and optimization
**Responsibilities**:
- Analyze code for quality issues and improvements
- Implement code optimizations and refactoring
- Validate code maintainability and readability
- Provide quality improvement recommendations
**Does NOT do**: New feature development, testing, or deployment
**Commands**: improvement

### updater-agent
**Role**: Dependency updates and maintenance
**Responsibilities**:
- Update project dependencies to latest versions
- Validate dependency compatibility and security
- Handle version conflicts and resolution
- Maintain dependency documentation
**Does NOT do**: Code generation, testing, or deployment
**Commands**: update-dependencies

### accuracy-verification-agent
**Role**: Deep accuracy validation and verification
**Responsibilities**:
- Perform comprehensive accuracy validation
- Verify implementation matches requirements
- Validate data integrity and consistency
- Provide accuracy verification reports
**Does NOT do**: Code generation, testing, or implementation
**Commands**: verify-accuracy

## Coordination Protocols

### Agent Interaction Rules
1. **Single Responsibility**: Each agent performs only their defined role
2. **Clear Handoffs**: Agents hand off work through defined interfaces
3. **No Overlap**: Agents do not perform tasks outside their domain
4. **Standardized Communication**: All agents use consistent communication patterns
5. **Audit Trail**: All agent interactions are logged and tracked

### Escalation Paths
- **Implementation Issues** → web-dev-strategy-agent → appropriate specialist
- **Quality Issues** → relevant quality agent → fix implementation
- **Coordination Issues** → web-dev-strategy-agent resolves conflicts
- **Resource Issues** → web-dev-strategy-agent provides alternatives

This matrix ensures clear responsibilities, eliminates redundancy, and provides a streamlined agent ecosystem.
