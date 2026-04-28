CREATE TABLE "execution_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid,
	"workflow_id" uuid,
	"status" varchar,
	"duration_ms" integer,
	"result" jsonb,
	"executed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rpa_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"steps" jsonb NOT NULL,
	"source" varchar,
	"skill_name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"version" text NOT NULL,
	"type" varchar NOT NULL,
	"source" text,
	"config" jsonb,
	"installed_at" timestamp DEFAULT now(),
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_input" text NOT NULL,
	"skill_name" text,
	"status" varchar DEFAULT 'pending',
	"progress" integer DEFAULT 0,
	"result_data" jsonb,
	"output_file" text,
	"output_format" varchar DEFAULT 'json',
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "execution_history" ADD CONSTRAINT "execution_history_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_history" ADD CONSTRAINT "execution_history_workflow_id_rpa_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."rpa_workflows"("id") ON DELETE no action ON UPDATE no action;