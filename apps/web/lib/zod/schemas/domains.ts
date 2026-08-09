import * as z from "zod/v4";

export const DomainSchema = z.object({
  id: z.string(),
  slug: z.string(),
  verified: z.boolean().default(false),
  primary: z.boolean().default(false),
  archived: z.boolean().default(false),
});
