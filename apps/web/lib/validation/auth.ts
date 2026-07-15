import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "nome precisa de pelo menos 2 caracteres"),
  email: z.email("email inválido"),
  password: z.string().min(8, "senha precisa de pelo menos 8 caracteres"),
});

export const signInSchema = z.object({
  email: z.email("email inválido"),
  password: z.string().min(1, "informe a senha"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
