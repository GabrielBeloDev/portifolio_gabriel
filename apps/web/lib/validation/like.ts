import { z } from "zod";

export const postReactionKinds = ["util", "curioso", "discordo"] as const;

export type PostReactionKind = (typeof postReactionKinds)[number];

export const reactionKinds = ["like", ...postReactionKinds] as const;

export type ReactionKind = (typeof reactionKinds)[number];

export type PostReactionsState = Record<
  PostReactionKind,
  { count: number; liked: boolean }
>;

export const toggleLikeSchema = z.discriminatedUnion("targetType", [
  z.object({
    targetType: z.literal("post"),
    targetId: z.string().min(1),
    kind: z.enum(reactionKinds).default("like"),
  }),
  // Comments only support the classic like — reactions are a post-level feature
  z.object({
    targetType: z.literal("comment"),
    targetId: z.uuid(),
    kind: z.literal("like").default("like"),
  }),
]);

export type ToggleLikeInput = z.infer<typeof toggleLikeSchema>;
