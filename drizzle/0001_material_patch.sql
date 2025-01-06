ALTER TYPE "public"."bug_status" ADD VALUE 'FIXED';--> statement-breakpoint
ALTER TYPE "public"."bug_status" ADD VALUE 'CLOSED';--> statement-breakpoint
ALTER TYPE "public"."bug_status" ADD VALUE 'REOPENED';--> statement-breakpoint
ALTER TYPE "public"."bug_status" ADD VALUE 'DUPLICATE';--> statement-breakpoint
ALTER TYPE "public"."bug_status" ADD VALUE 'WONTFIX';--> statement-breakpoint
ALTER TYPE "public"."bug_status" ADD VALUE 'INVALID';--> statement-breakpoint
CREATE TABLE "personal-bug-list_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personal-bug-list_sessions" ADD CONSTRAINT "personal-bug-list_sessions_user_id_personal-bug-list_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."personal-bug-list_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_id_idx" ON "personal-bug-list_sessions" USING btree ("id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "personal-bug-list_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "application_name_idx" ON "personal-bug-list_applications" USING btree ("name");--> statement-breakpoint
CREATE INDEX "application_secret_idx" ON "personal-bug-list_applications" USING btree ("secret");