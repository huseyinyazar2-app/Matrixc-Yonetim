import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("USER"), // 'ADMIN' or 'USER'
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const transactions = sqliteTable("transactions", {
    id: text("id").primaryKey(),
    type: text("type").notNull(), // 'INCOME', 'EXPENSE', 'TRANSFER'
    amount: real("amount").notNull(),
    description: text("description").notNull(),
    source: text("source").notNull(), // 'KASA', 'PERSONAL'
    date: integer("date", { mode: 'timestamp' }).notNull(),
    userId: text("user_id").references(() => users.id).notNull(),
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const todos = sqliteTable("todos", {
    id: text("id").primaryKey(),
    task: text("task").notNull(),
    urgency: text("urgency").notNull().default("NORMAL"), // 'NORMAL', 'ACİL', 'ÇOK ACİL'
    isCompleted: integer("is_completed", { mode: 'boolean' }).notNull().default(false),
    createdBy: text("created_by").notNull(), // Can be user name or id
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
