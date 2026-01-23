
import { AIPAction, OntologyObject, ActionParameter } from '../types';

// OpenAPI 3.0 Types
export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
  security?: Array<Record<string, string[]>>;
  tags?: Array<{ name: string; description?: string }>;
}

interface PathItem {
  summary?: string;
  description?: string;
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
}

interface Operation {
  summary: string;
  description?: string;
  operationId: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  security?: Array<Record<string, string[]>>;
}

interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema: SchemaObject;
}

interface RequestBody {
  required?: boolean;
  description?: string;
  content: Record<string, MediaType>;
}

interface MediaType {
  schema: SchemaObject;
  example?: any;
}

interface Response {
  description: string;
  content?: Record<string, MediaType>;
}

interface SchemaObject {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  enum?: string[];
  example?: any;
  $ref?: string;
}

interface SecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
  description?: string;
}

// Convert ActionParameter type to OpenAPI type
function mapParameterType(type: ActionParameter['type']): { type: string; format?: string } {
  switch (type) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return { type: 'number', format: 'double' };
    case 'boolean':
      return { type: 'boolean' };
    case 'date':
      return { type: 'string', format: 'date-time' };
    case 'object':
      return { type: 'object' };
    case 'array':
      return { type: 'array' };
    default:
      return { type: 'string' };
  }
}

// Generate operationId from action name
function generateOperationId(actionName: string): string {
  return actionName
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// Generate schema name
function generateSchemaName(actionName: string, suffix: string): string {
  const baseName = actionName
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  return baseName + suffix;
}

// Extract path parameters from endpoint
function extractPathParams(endpoint: string): string[] {
  const matches = endpoint.match(/\{([^}]+)\}/g);
  return matches ? matches.map(m => m.slice(1, -1)) : [];
}

// Generate OpenAPI spec for a single Action
export function generateActionAPISpec(
  action: AIPAction,
  objectName: string
): { path: string; pathItem: PathItem; schemas: Record<string, SchemaObject> } {
  const impl = action.implementationLayer;
  const logic = action.logicLayer;
  const business = action.businessLayer;
  const governance = action.governance;

  // Default endpoint if not specified
  const endpoint = impl?.apiEndpoint || `/api/${objectName.toLowerCase()}s/{id}/${generateOperationId(action.name)}`;
  const method = (impl?.apiMethod || 'POST').toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';

  const operationId = generateOperationId(action.name);
  const requestSchemaName = generateSchemaName(action.name, 'Request');
  const responseSchemaName = generateSchemaName(action.name, 'Response');

  // Build parameters from path
  const pathParams = extractPathParams(endpoint);
  const parameters: Parameter[] = pathParams.map(param => ({
    name: param,
    in: 'path' as const,
    required: true,
    description: `${param} parameter`,
    schema: { type: 'string' }
  }));

  // Build request body schema from action parameters
  const requestProperties: Record<string, SchemaObject> = {};
  const requiredFields: string[] = [];

  if (logic?.parameters) {
    logic.parameters.forEach(param => {
      const typeInfo = mapParameterType(param.type);
      requestProperties[param.name] = {
        ...typeInfo,
        description: param.description
      };
      if (param.required) {
        requiredFields.push(param.name);
      }
    });
  }

  // Add example from implementationLayer if available
  if (impl?.requestPayload) {
    Object.entries(impl.requestPayload).forEach(([key, value]) => {
      if (!requestProperties[key]) {
        requestProperties[key] = {
          type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
          example: value
        };
      } else {
        requestProperties[key].example = value;
      }
    });
  }

  // Build response schema
  const responseProperties: Record<string, SchemaObject> = {
    success: { type: 'boolean', description: 'Operation success status' },
    message: { type: 'string', description: 'Response message' }
  };

  // Add postconditions as response fields
  if (logic?.postconditions) {
    responseProperties.changes = {
      type: 'array',
      description: 'State changes applied',
      items: { type: 'string' },
      example: logic.postconditions
    };
  }

  // Build operation
  const operation: Operation = {
    summary: business?.description || action.description || action.name,
    description: buildDescription(action),
    operationId,
    tags: [objectName],
    parameters: parameters.length > 0 ? parameters : undefined,
    responses: {
      '200': {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${responseSchemaName}` }
          }
        }
      },
      '400': {
        description: 'Bad request - validation failed'
      },
      '401': {
        description: 'Unauthorized'
      },
      '403': {
        description: 'Forbidden - insufficient permissions'
      },
      '404': {
        description: 'Resource not found'
      }
    }
  };

  // Add request body for non-GET methods
  if (method !== 'get' && Object.keys(requestProperties).length > 0) {
    operation.requestBody = {
      required: requiredFields.length > 0,
      description: `Request body for ${action.name}`,
      content: {
        'application/json': {
          schema: { $ref: `#/components/schemas/${requestSchemaName}` }
        }
      }
    };
  }

  // Add security requirements based on governance
  if (governance?.permissionTier && governance.permissionTier >= 2) {
    operation.security = [{ bearerAuth: [] }];
  }

  // Build schemas
  const schemas: Record<string, SchemaObject> = {};

  if (Object.keys(requestProperties).length > 0) {
    schemas[requestSchemaName] = {
      type: 'object',
      description: `Request schema for ${action.name}`,
      properties: requestProperties,
      required: requiredFields.length > 0 ? requiredFields : undefined
    };
  }

  schemas[responseSchemaName] = {
    type: 'object',
    description: `Response schema for ${action.name}`,
    properties: responseProperties,
    required: ['success']
  };

  // Build path item
  const pathItem: PathItem = {
    [method]: operation
  };

  return { path: endpoint, pathItem, schemas };
}

// Build detailed description
function buildDescription(action: AIPAction): string {
  const parts: string[] = [];

  if (action.description) {
    parts.push(action.description);
  }

  const business = action.businessLayer;
  const logic = action.logicLayer;
  const governance = action.governance;

  if (business?.executorRole) {
    parts.push(`\n\n**Executor Role:** ${business.executorRole}`);
  }

  if (business?.triggerCondition) {
    parts.push(`\n\n**Trigger Condition:** ${business.triggerCondition}`);
  }

  if (logic?.preconditions && logic.preconditions.length > 0) {
    parts.push(`\n\n**Preconditions:**\n${logic.preconditions.map(p => `- ${p}`).join('\n')}`);
  }

  if (logic?.postconditions && logic.postconditions.length > 0) {
    parts.push(`\n\n**Postconditions:**\n${logic.postconditions.map(p => `- ${p}`).join('\n')}`);
  }

  if (logic?.sideEffects && logic.sideEffects.length > 0) {
    parts.push(`\n\n**Side Effects:**\n${logic.sideEffects.map(s => `- ${s}`).join('\n')}`);
  }

  if (governance) {
    const govParts: string[] = [];
    if (governance.permissionTier) govParts.push(`Permission Tier: ${governance.permissionTier}`);
    if (governance.riskLevel) govParts.push(`Risk Level: ${governance.riskLevel}`);
    if (governance.requiresHumanApproval) govParts.push('Requires Human Approval');
    if (governance.auditLog) govParts.push('Audit Logged');

    if (govParts.length > 0) {
      parts.push(`\n\n**Governance:** ${govParts.join(' | ')}`);
    }
  }

  return parts.join('');
}

// Generate complete OpenAPI spec for an Object
export function generateObjectAPISpec(object: OntologyObject): OpenAPISpec {
  const spec: OpenAPISpec = {
    openapi: '3.0.3',
    info: {
      title: `${object.name} API`,
      version: '1.0.0',
      description: `REST API for ${object.name} operations.\n\n${object.description || ''}`
    },
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token authentication'
        }
      }
    },
    tags: [{ name: object.name, description: `Operations on ${object.name}` }]
  };

  // Generate specs for each action
  object.actions.forEach(action => {
    const { path, pathItem, schemas } = generateActionAPISpec(action, object.name);

    // Merge path items (handle same path with different methods)
    if (spec.paths[path]) {
      spec.paths[path] = { ...spec.paths[path], ...pathItem };
    } else {
      spec.paths[path] = pathItem;
    }

    // Merge schemas
    if (spec.components?.schemas) {
      Object.assign(spec.components.schemas, schemas);
    }
  });

  return spec;
}

// Generate complete OpenAPI spec for all Objects
export function generateFullAPISpec(objects: OntologyObject[], projectName: string = 'Ontology API'): OpenAPISpec {
  const spec: OpenAPISpec = {
    openapi: '3.0.3',
    info: {
      title: projectName,
      version: '1.0.0',
      description: 'Auto-generated REST API specification from Ontology design.'
    },
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token authentication'
        }
      }
    },
    tags: objects.map(obj => ({
      name: obj.name,
      description: obj.description || `Operations on ${obj.name}`
    }))
  };

  // Generate specs for each object
  objects.forEach(object => {
    object.actions.forEach(action => {
      const { path, pathItem, schemas } = generateActionAPISpec(action, object.name);

      // Merge path items
      if (spec.paths[path]) {
        spec.paths[path] = { ...spec.paths[path], ...pathItem };
      } else {
        spec.paths[path] = pathItem;
      }

      // Merge schemas
      if (spec.components?.schemas) {
        Object.assign(spec.components.schemas, schemas);
      }
    });
  });

  return spec;
}

// Convert OpenAPI spec to YAML format
export function specToYAML(spec: OpenAPISpec): string {
  const indent = (level: number) => '  '.repeat(level);

  const formatValue = (value: any, level: number): string => {
    if (value === null || value === undefined) return '';

    if (typeof value === 'string') {
      // Handle multiline strings
      if (value.includes('\n')) {
        const lines = value.split('\n');
        return `|\n${lines.map(line => indent(level + 1) + line).join('\n')}`;
      }
      // Quote strings that need it
      if (value.includes(':') || value.includes('#') || value.includes("'") ||
          value.startsWith('{') || value.startsWith('[') || value === '') {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    }

    if (typeof value === 'boolean' || typeof value === 'number') {
      return String(value);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const items = value.map(item => {
        if (typeof item === 'object') {
          const objYaml = formatObject(item, level + 1);
          return `${indent(level)}- ${objYaml.trim().replace(/^/, '').replace(/\n/g, `\n${indent(level)}  `)}`;
        }
        return `${indent(level)}- ${formatValue(item, level)}`;
      });
      return '\n' + items.join('\n');
    }

    if (typeof value === 'object') {
      return '\n' + formatObject(value, level + 1);
    }

    return String(value);
  };

  const formatObject = (obj: any, level: number): string => {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;

      const formattedValue = formatValue(value, level);
      if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${indent(level)}${key}:${formattedValue}`);
      } else if (Array.isArray(value) && value.length > 0) {
        lines.push(`${indent(level)}${key}:${formattedValue}`);
      } else {
        lines.push(`${indent(level)}${key}: ${formattedValue}`);
      }
    }
    return lines.join('\n');
  };

  return formatObject(spec, 0);
}

// Convert OpenAPI spec to JSON format
export function specToJSON(spec: OpenAPISpec): string {
  return JSON.stringify(spec, null, 2);
}
