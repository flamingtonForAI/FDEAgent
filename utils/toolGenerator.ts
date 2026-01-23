
import { AIPAction, OntologyObject, ActionParameter } from '../types';

// ============= Tool Format Types =============

// OpenAI Function Calling Format
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, OpenAIParameter>;
      required: string[];
    };
  };
}

interface OpenAIParameter {
  type: string;
  description?: string;
  enum?: string[];
  items?: { type: string };
}

// LangChain Tool Format
export interface LangChainTool {
  name: string;
  description: string;
  args_schema: {
    title: string;
    type: 'object';
    properties: Record<string, LangChainParameter>;
    required: string[];
  };
  return_direct?: boolean;
  verbose?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface LangChainParameter {
  title?: string;
  type: string;
  description?: string;
  default?: any;
  enum?: string[];
}

// Anthropic Claude Tool Format
export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, ClaudeParameter>;
    required: string[];
  };
}

interface ClaudeParameter {
  type: string;
  description?: string;
  enum?: string[];
  items?: { type: string };
}

// MCP (Model Context Protocol) Tool Format
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPParameter>;
    required: string[];
  };
}

interface MCPParameter {
  type: string;
  description?: string;
  enum?: string[];
}

// Universal Tool Spec (internal representation)
export interface UniversalToolSpec {
  name: string;
  description: string;
  parameters: ToolParameter[];
  governance?: {
    permissionTier: number;
    requiresHumanApproval: boolean;
    riskLevel?: string;
  };
  metadata?: {
    objectName: string;
    actionType: string;
    apiEndpoint?: string;
  };
}

interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
}

// ============= Type Mapping =============

function mapActionParamType(type: ActionParameter['type']): string {
  switch (type) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'date': return 'string'; // ISO date string
    case 'object': return 'object';
    case 'array': return 'array';
    default: return 'string';
  }
}

// Generate snake_case name from action name
function toSnakeCase(name: string): string {
  return name
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/^_/, '')
    .replace(/_+/g, '_');
}

// ============= Universal Spec Generator =============

export function generateUniversalToolSpec(
  action: AIPAction,
  objectName: string
): UniversalToolSpec {
  const impl = action.implementationLayer;
  const logic = action.logicLayer;
  const business = action.businessLayer;
  const governance = action.governance;

  // Use existing tool spec name or generate one
  const toolName = impl?.agentToolSpec?.name || toSnakeCase(`${objectName}_${action.name}`);

  // Build description with context
  let description = impl?.agentToolSpec?.description || business?.description || action.description || action.name;

  // Add preconditions to description if available
  if (logic?.preconditions && logic.preconditions.length > 0) {
    description += `\n\nPreconditions: ${logic.preconditions.join('; ')}`;
  }

  // Add trigger condition if available
  if (business?.triggerCondition) {
    description += `\n\nUse when: ${business.triggerCondition}`;
  }

  // Build parameters
  const parameters: ToolParameter[] = [];

  if (logic?.parameters) {
    logic.parameters.forEach(param => {
      parameters.push({
        name: param.name,
        type: mapActionParamType(param.type),
        description: param.description || `${param.name} parameter`,
        required: param.required
      });
    });
  }

  // Extract parameters from requestPayload if no logic parameters defined
  if (parameters.length === 0 && impl?.requestPayload) {
    Object.entries(impl.requestPayload).forEach(([key, value]) => {
      parameters.push({
        name: key,
        type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
        description: `${key} parameter`,
        required: true
      });
    });
  }

  return {
    name: toolName,
    description,
    parameters,
    governance: governance ? {
      permissionTier: governance.permissionTier,
      requiresHumanApproval: governance.requiresHumanApproval,
      riskLevel: governance.riskLevel
    } : undefined,
    metadata: {
      objectName,
      actionType: action.type,
      apiEndpoint: impl?.apiEndpoint
    }
  };
}

// ============= Format Converters =============

// Convert to OpenAI Function Calling Format
export function toOpenAITool(spec: UniversalToolSpec): OpenAITool {
  const properties: Record<string, OpenAIParameter> = {};
  const required: string[] = [];

  spec.parameters.forEach(param => {
    properties[param.name] = {
      type: param.type === 'array' ? 'array' : param.type,
      description: param.description
    };
    if (param.type === 'array') {
      properties[param.name].items = { type: 'string' };
    }
    if (param.enum) {
      properties[param.name].enum = param.enum;
    }
    if (param.required) {
      required.push(param.name);
    }
  });

  return {
    type: 'function',
    function: {
      name: spec.name,
      description: spec.description,
      parameters: {
        type: 'object',
        properties,
        required
      }
    }
  };
}

// Convert to LangChain Tool Format
export function toLangChainTool(spec: UniversalToolSpec): LangChainTool {
  const properties: Record<string, LangChainParameter> = {};
  const required: string[] = [];

  spec.parameters.forEach(param => {
    properties[param.name] = {
      title: param.name,
      type: param.type,
      description: param.description
    };
    if (param.enum) {
      properties[param.name].enum = param.enum;
    }
    if (param.required) {
      required.push(param.name);
    }
  });

  const tool: LangChainTool = {
    name: spec.name,
    description: spec.description,
    args_schema: {
      title: `${spec.name}_args`,
      type: 'object',
      properties,
      required
    },
    return_direct: false,
    verbose: true,
    tags: [spec.metadata?.objectName || 'action'].filter(Boolean)
  };

  // Add governance metadata
  if (spec.governance) {
    tool.metadata = {
      permission_tier: spec.governance.permissionTier,
      requires_human_approval: spec.governance.requiresHumanApproval,
      risk_level: spec.governance.riskLevel
    };
  }

  return tool;
}

// Convert to Anthropic Claude Tool Format
export function toClaudeTool(spec: UniversalToolSpec): ClaudeTool {
  const properties: Record<string, ClaudeParameter> = {};
  const required: string[] = [];

  spec.parameters.forEach(param => {
    properties[param.name] = {
      type: param.type === 'array' ? 'array' : param.type,
      description: param.description
    };
    if (param.type === 'array') {
      properties[param.name].items = { type: 'string' };
    }
    if (param.enum) {
      properties[param.name].enum = param.enum;
    }
    if (param.required) {
      required.push(param.name);
    }
  });

  return {
    name: spec.name,
    description: spec.description,
    input_schema: {
      type: 'object',
      properties,
      required
    }
  };
}

// Convert to MCP Tool Format
export function toMCPTool(spec: UniversalToolSpec): MCPTool {
  const properties: Record<string, MCPParameter> = {};
  const required: string[] = [];

  spec.parameters.forEach(param => {
    properties[param.name] = {
      type: param.type,
      description: param.description
    };
    if (param.enum) {
      properties[param.name].enum = param.enum;
    }
    if (param.required) {
      required.push(param.name);
    }
  });

  return {
    name: spec.name,
    description: spec.description,
    inputSchema: {
      type: 'object',
      properties,
      required
    }
  };
}

// ============= High-Level Generators =============

export type ToolFormat = 'openai' | 'langchain' | 'claude' | 'mcp' | 'universal';

// Generate tool spec for a single action
export function generateToolSpec(
  action: AIPAction,
  objectName: string,
  format: ToolFormat = 'openai'
): OpenAITool | LangChainTool | ClaudeTool | MCPTool | UniversalToolSpec {
  const universal = generateUniversalToolSpec(action, objectName);

  switch (format) {
    case 'openai':
      return toOpenAITool(universal);
    case 'langchain':
      return toLangChainTool(universal);
    case 'claude':
      return toClaudeTool(universal);
    case 'mcp':
      return toMCPTool(universal);
    case 'universal':
    default:
      return universal;
  }
}

// Generate tool specs for all actions of an object
export function generateObjectToolSpecs(
  object: OntologyObject,
  format: ToolFormat = 'openai'
): Array<OpenAITool | LangChainTool | ClaudeTool | MCPTool | UniversalToolSpec> {
  return object.actions.map(action => generateToolSpec(action, object.name, format));
}

// Generate tool specs for all objects
export function generateAllToolSpecs(
  objects: OntologyObject[],
  format: ToolFormat = 'openai'
): Array<OpenAITool | LangChainTool | ClaudeTool | MCPTool | UniversalToolSpec> {
  const tools: Array<OpenAITool | LangChainTool | ClaudeTool | MCPTool | UniversalToolSpec> = [];

  objects.forEach(object => {
    object.actions.forEach(action => {
      tools.push(generateToolSpec(action, object.name, format));
    });
  });

  return tools;
}

// ============= Export Helpers =============

// Format tools as JSON string
export function toolsToJSON(
  tools: Array<OpenAITool | LangChainTool | ClaudeTool | MCPTool | UniversalToolSpec>,
  format: ToolFormat
): string {
  if (format === 'openai') {
    // OpenAI expects array of tools
    return JSON.stringify(tools, null, 2);
  }

  if (format === 'langchain') {
    // LangChain format with tools list
    return JSON.stringify({
      tools: tools
    }, null, 2);
  }

  if (format === 'claude') {
    // Anthropic format
    return JSON.stringify(tools, null, 2);
  }

  if (format === 'mcp') {
    // MCP server tools list format
    return JSON.stringify({
      tools: tools
    }, null, 2);
  }

  return JSON.stringify(tools, null, 2);
}

// Generate Python code for LangChain tools
export function generateLangChainPython(tools: LangChainTool[]): string {
  const imports = `from langchain.tools import StructuredTool
from pydantic import BaseModel, Field
from typing import Optional, List
`;

  const toolClasses = tools.map(tool => {
    const className = tool.name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const fields = Object.entries(tool.args_schema.properties)
      .map(([name, prop]) => {
        const pyType = prop.type === 'string' ? 'str' :
                       prop.type === 'number' ? 'float' :
                       prop.type === 'boolean' ? 'bool' :
                       prop.type === 'array' ? 'List[str]' : 'str';
        const required = tool.args_schema.required.includes(name);
        const defaultVal = required ? '...' : 'None';
        const fieldType = required ? pyType : `Optional[${pyType}]`;
        return `    ${name}: ${fieldType} = Field(${defaultVal}, description="${prop.description || name}")`;
      })
      .join('\n');

    return `
class ${className}Input(BaseModel):
    """Input schema for ${tool.name}"""
${fields || '    pass'}

def ${tool.name}_func(**kwargs) -> str:
    """${tool.description}"""
    # TODO: Implement the actual logic
    return f"Executed ${tool.name} with {kwargs}"

${tool.name}_tool = StructuredTool.from_function(
    func=${tool.name}_func,
    name="${tool.name}",
    description="${tool.description.replace(/"/g, '\\"').replace(/\n/g, ' ')}",
    args_schema=${className}Input,
    return_direct=${tool.return_direct || false}
)`;
  }).join('\n\n');

  const toolList = `
# All tools list
tools = [
${tools.map(t => `    ${t.name}_tool,`).join('\n')}
]`;

  return imports + toolClasses + toolList;
}

// Generate TypeScript code for OpenAI tools
export function generateOpenAITypeScript(tools: OpenAITool[]): string {
  const imports = `import OpenAI from 'openai';

const client = new OpenAI();
`;

  const toolDefs = `
// Tool definitions
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = ${JSON.stringify(tools, null, 2)};
`;

  const handlers = tools.map(tool => {
    const funcName = tool.function.name;
    const params = Object.keys(tool.function.parameters.properties);
    const paramTypes = params.map(p => {
      const prop = tool.function.parameters.properties[p];
      const tsType = prop.type === 'string' ? 'string' :
                     prop.type === 'number' ? 'number' :
                     prop.type === 'boolean' ? 'boolean' :
                     prop.type === 'array' ? 'string[]' : 'any';
      return `${p}: ${tsType}`;
    }).join(', ');

    return `
async function ${funcName}(${paramTypes}): Promise<string> {
  // TODO: Implement the actual logic
  return JSON.stringify({ success: true, message: '${funcName} executed' });
}`;
  }).join('\n');

  const dispatcher = `
// Tool call dispatcher
async function handleToolCall(toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall): Promise<string> {
  const args = JSON.parse(toolCall.function.arguments);

  switch (toolCall.function.name) {
${tools.map(t => `    case '${t.function.name}':
      return await ${t.function.name}(${Object.keys(t.function.parameters.properties).map(p => `args.${p}`).join(', ')});`).join('\n')}
    default:
      return JSON.stringify({ error: 'Unknown tool' });
  }
}`;

  return imports + toolDefs + handlers + dispatcher;
}
