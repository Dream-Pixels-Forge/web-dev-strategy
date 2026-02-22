import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getExtensionPath() {
  const mcpServerDir = path.join(__dirname, "..");
  
  const isWindows = process.platform === "win32";
  const homeDir = os.homedir();
  
  const possiblePaths = [
    path.join(homeDir, ".qwen", "extensions", "web-dev-strategy"),
    path.join(homeDir, "AppData", "Roaming", "qwen", "extensions", "web-dev-strategy"),
    mcpServerDir,
    path.join(__dirname, "..", "..", ".."),
  ];

  for (const p of possiblePaths) {
    const skillsPath = path.join(p, "skills");
    const agentsPath = path.join(p, "agents");
    if (fs.existsSync(skillsPath) && fs.existsSync(agentsPath)) {
      return p;
    }
  }

  return mcpServerDir;
}

const EXTENSION_PATH = getExtensionPath();

class WebDevStrategyServer {
  constructor() {
    this.server = new Server(
      {
        name: "web-dev-strategy",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.skills = this.loadSkills();
    this.agents = this.loadAgents();
    this.commands = this.loadCommands();

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          ...this.getSkillTools(),
          ...this.getAgentTools(),
          ...this.getCommandTools(),
          ...this.getUtilityTools(),
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        return await this.handleToolCall(name, args);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  loadSkills() {
    const skillsPath = path.join(EXTENSION_PATH, "skills");
    const skills = {};

    if (!fs.existsSync(skillsPath)) {
      return skills;
    }

    const skillDirs = fs.readdirSync(skillsPath, { withFileTypes: true });
    
    for (const dir of skillDirs) {
      if (dir.isDirectory()) {
        const skillFile = path.join(skillsPath, dir.name, "SKILL.md");
        if (fs.existsSync(skillFile)) {
          const content = fs.readFileSync(skillFile, "utf-8");
          const frontmatter = this.parseFrontmatter(content);
          skills[dir.name] = {
            name: frontmatter.name || dir.name,
            description: frontmatter.description || "",
            content: content,
          };
        }
      }
    }

    return skills;
  }

  loadAgents() {
    const agentsPath = path.join(EXTENSION_PATH, "agents");
    const agents = {};

    if (!fs.existsSync(agentsPath)) {
      return agents;
    }

    const categories = fs.readdirSync(agentsPath, { withFileTypes: true });

    for (const category of categories) {
      if (category.isDirectory()) {
        const agentFiles = fs.readdirSync(path.join(agentsPath, category.name));
        
        for (const file of agentFiles) {
          if (file.endsWith(".md")) {
            const agentPath = path.join(agentsPath, category.name, file);
            const content = fs.readFileSync(agentPath, "utf-8");
            const frontmatter = this.parseFrontmatter(content);
            const agentName = file.replace(".md", "");
            
            agents[agentName] = {
              name: frontmatter.name || agentName,
              description: frontmatter.description || "",
              content: content,
              category: category.name,
            };
          }
        }
      }
    }

    return agents;
  }

  loadCommands() {
    const commandsPath = path.join(EXTENSION_PATH, "commands", "wds");
    const commands = {};

    if (!fs.existsSync(commandsPath)) {
      return commands;
    }

    const commandFiles = fs.readdirSync(commandsPath);

    for (const file of commandFiles) {
      if (file.endsWith(".md")) {
        const commandPath = path.join(commandsPath, file);
        const content = fs.readFileSync(commandPath, "utf-8");
        const frontmatter = this.parseFrontmatter(content);
        const commandName = file.replace(".md", "");
        
        commands[commandName] = {
          name: frontmatter.name || commandName,
          description: frontmatter.description || "",
          content: content,
        };
      }
    }
  }

  parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return {};
    }

    const frontmatter = {};
    const lines = match[1].split("\n");

    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        frontmatter[key] = value;
      }
    }

    return frontmatter;
  }

  getSkillTools() {
    const tools = [];

    for (const [key, skill] of Object.entries(this.skills)) {
      tools.push({
        name: `skill_${key}`,
        description: skill.description || `Use ${skill.name} skill`,
        inputSchema: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: `Task to perform using the ${skill.name} skill`,
            },
          },
          required: ["task"],
        },
      });
    }

    return tools;
  }

  getAgentTools() {
    const tools = [];

    for (const [key, agent] of Object.entries(this.agents)) {
      tools.push({
        name: `agent_${key}`,
        description: agent.description || `Delegate to ${agent.name} agent`,
        inputSchema: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: `Task to delegate to ${agent.name} agent`,
            },
          },
          required: ["task"],
        },
      });
    }

    return tools;
  }

  getCommandTools() {
    const tools = [];

    for (const [key, command] of Object.entries(this.commands)) {
      tools.push({
        name: `command_${key}`,
        description: command.description || `Execute ${command.name} command`,
        inputSchema: {
          type: "object",
          properties: {
            args: {
              type: "string",
              description: `Arguments for ${command.name} command`,
            },
          },
        },
      });
    }

    return tools;
  }

  getUtilityTools() {
    return [
      {
        name: "list_skills",
        description: "List all available skills in web-dev-strategy",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_agents",
        description: "List all available agents in web-dev-strategy",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Filter agents by category (Development, Quality-Security, Planning-Docs, Deployment, Support-Improvements, Git master)",
            },
          },
        },
      },
      {
        name: "list_commands",
        description: "List all available commands in web-dev-strategy",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_skill_content",
        description: "Get the full content of a skill",
        inputSchema: {
          type: "object",
          properties: {
            skill_name: {
              type: "string",
              description: "Name of the skill to retrieve",
            },
          },
          required: ["skill_name"],
        },
      },
      {
        name: "get_agent_content",
        description: "Get the full content of an agent",
        inputSchema: {
          type: "object",
          properties: {
            agent_name: {
              type: "string",
              description: "Name of the agent to retrieve",
            },
          },
          required: ["agent_name"],
        },
      },
      {
        name: "get_command_content",
        description: "Get the full content of a command",
        inputSchema: {
          type: "object",
          properties: {
            command_name: {
              type: "string",
              description: "Name of the command to retrieve",
            },
          },
          required: ["command_name"],
        },
      },
    ];
  }

  async handleToolCall(toolName, args) {
    if (toolName === "list_skills") {
      const skillList = Object.entries(this.skills).map(([key, skill]) => ({
        name: key,
        description: skill.description,
      }));
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(skillList, null, 2),
          },
        ],
      };
    }

    if (toolName === "list_agents") {
      let agentsList = Object.entries(this.agents).map(([key, agent]) => ({
        name: key,
        category: agent.category,
        description: agent.description,
      }));

      if (args?.category) {
        agentsList = agentsList.filter(
          (a) => a.category.toLowerCase() === args.category.toLowerCase()
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(agentsList, null, 2),
          },
        ],
      };
    }

    if (toolName === "list_commands") {
      const commandList = Object.entries(this.commands).map(([key, command]) => ({
        name: key,
        description: command.description,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(commandList, null, 2),
          },
        ],
      };
    }

    if (toolName === "get_skill_content") {
      const skill = this.skills[args.skill_name];
      
      if (!skill) {
        return {
          content: [
            {
              type: "text",
              text: `Skill '${args.skill_name}' not found. Available skills: ${Object.keys(this.skills).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: skill.content,
          },
        ],
      };
    }

    if (toolName === "get_agent_content") {
      const agent = this.agents[args.agent_name];
      
      if (!agent) {
        return {
          content: [
            {
              type: "text",
              text: `Agent '${args.agent_name}' not found. Available agents: ${Object.keys(this.agents).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: agent.content,
          },
        ],
      };
    }

    if (toolName === "get_command_content") {
      const command = this.commands[args.command_name];
      
      if (!command) {
        return {
          content: [
            {
              type: "text",
              text: `Command '${args.command_name}' not found. Available commands: ${Object.keys(this.commands).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: command.content,
          },
        ],
      };
    }

    if (toolName.startsWith("skill_")) {
      const skillKey = toolName.replace("skill_", "");
      const skill = this.skills[skillKey];
      
      if (!skill) {
        return {
          content: [
            {
              type: "text",
              text: `Skill '${skillKey}' not found. Available skills: ${Object.keys(this.skills).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `# ${skill.name}\n\n${skill.content}\n\n---\n\n**Task:** ${args.task}\n\nUse this skill to complete the task above.`,
          },
        ],
      };
    }

    if (toolName.startsWith("agent_")) {
      const agentKey = toolName.replace("agent_", "");
      const agent = this.agents[agentKey];
      
      if (!agent) {
        return {
          content: [
            {
              type: "text",
              text: `Agent '${agentKey}' not found. Available agents: ${Object.keys(this.agents).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `# ${agent.name}\n\n${agent.content}\n\n---\n\n**Task:** ${args.task}\n\nDelegate this task to the agent above.`,
          },
        ],
      };
    }

    if (toolName.startsWith("command_")) {
      const commandKey = toolName.replace("command_", "");
      const command = this.commands[commandKey];
      
      if (!command) {
        return {
          content: [
            {
              type: "text",
              text: `Command '${commandKey}' not found. Available commands: ${Object.keys(this.commands).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      const promptWithArgs = command.content.replace(
        "{{args}}",
        args.args || ""
      );

      return {
        content: [
          {
            type: "text",
            text: promptWithArgs,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${toolName}`,
        },
      ],
      isError: true,
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Web Dev Strategy MCP Server started");
    console.error(`Extension path: ${EXTENSION_PATH}`);
    console.error(`Loaded: ${Object.keys(this.skills).length} skills, ${Object.keys(this.agents).length} agents, ${Object.keys(this.commands).length} commands`);
  }
}

const server = new WebDevStrategyServer();
server.start().catch(console.error);
