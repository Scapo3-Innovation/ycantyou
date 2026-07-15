import { z } from 'zod';

export const feedbackMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters.')
    .max(2000, 'Please keep it under 2000 characters.'),
});

export type FeedbackMessageForm = z.infer<typeof feedbackMessageSchema>;
