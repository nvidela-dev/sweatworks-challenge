-- Tables
CREATE TABLE IF NOT EXISTS "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price_cents" integer NOT NULL,
	"duration_days" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	CONSTRAINT "price_cents_positive" CHECK ("price_cents" >= 0),
	CONSTRAINT "duration_days_positive" CHECK ("duration_days" > 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"cancelled_at" date,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	CONSTRAINT "status_valid" CHECK ("status" IN ('active', 'cancelled', 'expired')),
	CONSTRAINT "dates_valid" CHECK ("start_date" < "end_date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	"checked_in_at" timestamp with time zone DEFAULT NOW() NOT NULL
);
--> statement-breakpoint

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_check_ins_member_id" ON "check_ins" ("member_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_check_ins_checked_in_at" ON "check_ins" ("checked_in_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_memberships_member_id" ON "memberships" ("member_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_memberships_member_active" ON "memberships" ("member_id") WHERE "status" = 'active';
--> statement-breakpoint

-- Foreign Keys
DO $$ BEGIN
 ALTER TABLE "memberships" ADD CONSTRAINT "memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memberships" ADD CONSTRAINT "memberships_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Trigger function: auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON "members"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON "plans"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER trg_memberships_updated_at
  BEFORE UPDATE ON "memberships"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint

-- Trigger function: validate check_ins.member_id matches membership's member_id
CREATE OR REPLACE FUNCTION validate_check_in_member()
RETURNS TRIGGER AS $$
DECLARE
  membership_member_id uuid;
BEGIN
  SELECT member_id INTO membership_member_id
  FROM memberships
  WHERE id = NEW.membership_id;

  IF membership_member_id IS NULL THEN
    RAISE EXCEPTION 'Membership not found: %', NEW.membership_id;
  END IF;

  IF NEW.member_id != membership_member_id THEN
    RAISE EXCEPTION 'check_ins.member_id (%) does not match membership.member_id (%)',
      NEW.member_id, membership_member_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER trg_check_ins_validate_member
  BEFORE INSERT ON "check_ins"
  FOR EACH ROW
  EXECUTE FUNCTION validate_check_in_member();
