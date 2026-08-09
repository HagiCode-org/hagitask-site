/**
 * Tiny JSON Schema (draft 2020-12 subset) validator.
 *
 * Supports the subset used by the community v1 schemas: type, required,
 * properties, additionalProperties, items, const, enum, pattern, minItems,
 * minProperties, minLength, and $ref into #/$defs. This avoids an external
 * dependency while still enforcing schema conformance in the build.
 */

export interface ValidationError {
  path: string;
  message: string;
}

export class SchemaValidationError extends Error {
  errors: ValidationError[];
  constructor(errors: ValidationError[]) {
    super(`Schema validation failed:\n${errors.map((e) => `  - ${e.path}: ${e.message}`).join('\n')}`);
    this.name = 'SchemaValidationError';
    this.errors = errors;
  }
}

function resolveRef(schema: any, ref: string): any {
  if (!ref.startsWith('#/')) return schema;
  const parts = ref.slice(2).split('/');
  let current = schema;
  for (const part of parts) {
    current = current[part];
    if (current === undefined) break;
  }
  return current;
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function check(value: unknown, schema: any, path: string, root: any, errors: ValidationError[]): void {
  if (!schema || typeof schema !== 'object') return;

  if (schema.$ref) {
    check(value, resolveRef(root, schema.$ref), path, root, errors);
    return;
  }

  if (schema.type) {
    const actual = typeOf(value);
    const expected = schema.type;
    let ok = actual === expected;
    if (!ok && expected === 'number' && actual === 'number') ok = true;
    if (!ok && expected === 'integer' && actual === 'number' && Number.isInteger(value)) ok = true;
    if (!ok) {
      errors.push({ path, message: `expected type ${expected}, got ${actual}` });
      return;
    }
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push({ path, message: `expected const ${JSON.stringify(schema.const)}` });
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push({ path, message: `value not in enum` });
  }

  if (typeof schema.pattern === 'string' && typeof value === 'string') {
    if (!new RegExp(schema.pattern).test(value)) {
      errors.push({ path, message: `does not match pattern ${schema.pattern}` });
    }
  }

  if (typeof schema.minLength === 'number' && typeof value === 'string') {
    if (value.length < schema.minLength) {
      errors.push({ path, message: `shorter than minLength ${schema.minLength}` });
    }
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
        errors.push({ path, message: `fewer than minItems ${schema.minItems}` });
      }
      if (schema.items) {
        value.forEach((item, i) => check(item, schema.items, `${path}[${i}]`, root, errors));
      }
    } else {
      const obj = value as Record<string, unknown>;
      if (Array.isArray(schema.required)) {
        for (const key of schema.required) {
          if (!(key in obj)) {
            errors.push({ path: `${path ? path + '.' : ''}${key}`, message: 'missing required property' });
          }
        }
      }
      if (typeof schema.minProperties === 'number' && Object.keys(obj).length < schema.minProperties) {
        errors.push({ path, message: `fewer than minProperties ${schema.minProperties}` });
      }
      if (schema.additionalProperties === false) {
        const allowed = schema.properties ? Object.keys(schema.properties) : [];
        for (const key of Object.keys(obj)) {
          if (!allowed.includes(key)) {
            errors.push({ path: `${path ? path + '.' : ''}${key}`, message: 'unexpected property' });
          }
        }
      }
      if (schema.properties) {
        for (const [key, sub] of Object.entries(schema.properties)) {
          if (key in obj) {
            check(obj[key], sub, `${path ? path + '.' : ''}${key}`, root, errors);
          }
        }
      }
    }
  }
}

export function validate(value: unknown, schema: any): ValidationError[] {
  const errors: ValidationError[] = [];
  check(value, schema, '', schema, errors);
  return errors;
}

export function assertValid(value: unknown, schema: any, label: string): void {
  const errors = validate(value, schema);
  if (errors.length > 0) {
    throw new SchemaValidationError(
      errors.map((e) => ({
        path: label ? (e.path ? `${label}.${e.path}` : label) : e.path,
        message: e.message,
      })),
    );
  }
}