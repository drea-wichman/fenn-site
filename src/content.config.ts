import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const policies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/policies' }),
  schema: z.object({
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
  }),
});

export const collections = {
  policies,
};