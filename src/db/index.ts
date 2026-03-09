import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "libsql://dummy-for-build.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || "dummy-token",
});

export const db = drizzle(client, { schema });
