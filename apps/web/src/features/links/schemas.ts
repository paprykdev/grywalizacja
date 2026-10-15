import { z } from 'zod';

// Mirrors CreateLinkDto in packages/api — the API's class-validator rules are the source of truth
export const linkFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  url: z.url('Enter a valid URL'),
  description: z.string().trim(),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;
