import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as authSchema from "./auth-schema";
import * as contentSchema from "./schema";

const schema = { ...authSchema, ...contentSchema };

export type Database = NeonHttpDatabase<typeof schema>;

export function createDb(databaseUrl: string): Database {
  return drizzle({ client: neon(databaseUrl), schema });
}

export * from "./auth-schema";
export * from "./schema";

// Consumers must get query operators from this package, not from their own
// drizzle-orm copy — pnpm peer variants create nominally incompatible types
export {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  max,
  or,
  sql,
} from "drizzle-orm";
