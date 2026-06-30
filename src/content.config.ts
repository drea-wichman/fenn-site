import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const policies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/policies' }),
  schema: z.object({
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
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
});

export const collections = {
  policies,
  legal,
};