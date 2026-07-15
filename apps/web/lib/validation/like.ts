import { z } from "zod";

export const toggleLikeSchema = z.discriminatedUnion("targetType", [
  z.object({ targetType: z.literal("post"), targetId: z.string().min(1) }),
  z.object({ targetType: z.literal("comment"), targetId: z.uuid() }),
]);

export type ToggleLikeInput = z.infer<typeof toggleLikeSchema>;
