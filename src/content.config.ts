import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const schema = z.object({
  title: z.string(),
  document_id: z.string(),
  version: z.string(),
  effective_date: z.date(),
  last_reviewed: z.date(),
  next_review: z.date(),
  owner: z.string(),
  approver: z.string(),
  scope: z.string(),
  framework_mapping: z.array(z.string()),
});

const schemaOptional = z.object({
  title: z.string().optional(),
  document_id: z.string().optional(),
  version: z.string().optional(),
  effective_date: z.date().optional(),
  last_reviewed: z.date().optional(),
  next_review: z.date().optional(),
  owner: z.string().optional(),
  approver: z.string().optional(),
  scope: z.string().optional(),
  framework_mapping: z.array(z.string()).optional(),
});
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
});
const security = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/security' }),
  schema,
});

const privacy = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/privacy' }),
  schema: schemaOptional,
});

const compliance = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/compliance' }),
  schema,
});

export const collections = {
  security,
  privacy,
  compliance,
  legal,
};