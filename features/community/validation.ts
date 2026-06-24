import { z } from 'zod';

import { COMMENT_MAX, POST_MAX, TITLE_MAX } from './constants';

/** A new post: body required; title and tags optional. */
export const postSchema = z.object({
  title: z.string().trim().max(TITLE_MAX).optional(),
  body: z.string().trim().min(1, 'Write something to share').max(POST_MAX),
  tags: z.array(z.string()).max(5).default([]),
});
export type PostForm = z.infer<typeof postSchema>;

/** A new comment. */
export const commentSchema = z.object({
  body: z.string().trim().min(1).max(COMMENT_MAX),
});

/** Parse a comma/space tag string into up to 5 clean, lowercase tags. */
export function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter(Boolean),
    ),
  ).slice(0, 5);
}
