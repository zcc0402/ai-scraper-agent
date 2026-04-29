import {
  pgTable, text, timestamp, jsonb, integer,
  uuid, varchar,
} from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userInput: text("user_input").notNull(),
  targetUrl: text("target_url"),
  skillName: text("skill_name"),
  status: varchar("status", {
    enum: [
      "pending", "running", "planning", "navigating",
      "extracting", "validating", "exporting",
      "completed", "failed", "cancelled",
    ],
  }).default("pending"),
  progress: integer("progress").default(0),
  resultData: jsonb("result_data"),
  outputFile: text("output_file"),
  outputFormat: varchar("output_format", {
    enum: ["json", "csv", "excel"],
  }).default("json"),
  timeout: integer("timeout").default(300),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  version: text("version").notNull(),
  type: varchar("type", { enum: ["native", "openclaw"] }).notNull(),
  source: text("source"),
  config: jsonb("config"),
  installedAt: timestamp("installed_at").defaultNow(),
});

export const rpaWorkflows = pgTable("rpa_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  source: varchar("source", { enum: ["recorded", "ai-generated"] }),
  skillName: text("skill_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const executionHistory = pgTable("execution_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id),
  workflowId: uuid("workflow_id").references(() => rpaWorkflows.id),
  status: varchar("status", { enum: ["success", "failed"] }),
  duration: integer("duration_ms"),
  result: jsonb("result"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const taskEvents = pgTable("task_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  type: varchar("type").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
