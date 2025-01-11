CREATE TYPE "public"."bug_severity" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."bug_status" AS ENUM('SUBMITTED', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'FIXED', 'CLOSED', 'REOPENED', 'DUPLICATE', 'WONTFIX', 'INVALID');--> statement-breakpoint
CREATE TYPE "public"."bug_tag" AS ENUM('UI', 'FUNCTIONALITY', 'PERFORMANCE', 'SECURITY', 'CRASH', 'NETWORK', 'DATABASE', 'OTHER');--> statement-breakpoint
CREATE TABLE "personal-bug-list_applications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"key" text NOT NULL,
	"secret" text NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "application_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "personal-bug-list_bug_images" (
	"id" uuid PRIMARY KEY NOT NULL,
	"bug_id" uuid NOT NULL,
	"file" varchar(256) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "personal-bug-list_bugs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"app_id" uuid NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"severity" "bug_severity" NOT NULL,
	"tags" "bug_tag"[] NOT NULL,
	"status" "bug_status" DEFAULT 'SUBMITTED' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "personal-bug-list_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal-bug-list_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(150) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "personal-bug-list_bug_images" ADD CONSTRAINT "personal-bug-list_bug_images_bug_id_personal-bug-list_bugs_id_fk" FOREIGN KEY ("bug_id") REFERENCES "public"."personal-bug-list_bugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal-bug-list_bugs" ADD CONSTRAINT "personal-bug-list_bugs_app_id_personal-bug-list_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."personal-bug-list_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal-bug-list_sessions" ADD CONSTRAINT "personal-bug-list_sessions_user_id_personal-bug-list_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."personal-bug-list_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_key_idx" ON "personal-bug-list_applications" USING btree ("key");--> statement-breakpoint
CREATE INDEX "application_name_idx" ON "personal-bug-list_applications" USING btree ("name");--> statement-breakpoint
CREATE INDEX "application_secret_idx" ON "personal-bug-list_applications" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "application_idx" ON "personal-bug-list_applications" USING btree ("id");--> statement-breakpoint
CREATE INDEX "search_name_idx" ON "personal-bug-list_applications" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX "bug_image_id_idx" ON "personal-bug-list_bug_images" USING btree ("id");--> statement-breakpoint
CREATE INDEX "bug_image_bug_id_idx" ON "personal-bug-list_bug_images" USING btree ("bug_id");--> statement-breakpoint
CREATE INDEX "bug_image_created_at_idx" ON "personal-bug-list_bug_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bug_id_idx" ON "personal-bug-list_bugs" USING btree ("id");--> statement-breakpoint
CREATE INDEX "bug_app_id_idx" ON "personal-bug-list_bugs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "bug_title_idx" ON "personal-bug-list_bugs" USING btree ("title");--> statement-breakpoint
CREATE INDEX "bug_severity_idx" ON "personal-bug-list_bugs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "bug_tags_idx" ON "personal-bug-list_bugs" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "bug_status_idx" ON "personal-bug-list_bugs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bug_created_at_idx" ON "personal-bug-list_bugs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_id_idx" ON "personal-bug-list_sessions" USING btree ("id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "personal-bug-list_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "username_idx" ON "personal-bug-list_users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "user_idx" ON "personal-bug-list_users" USING btree ("id");