CREATE TYPE "public"."category" AS ENUM('portrait', 'landscape', 'character', 'abstract', 'animal', 'architecture', 'food', 'fashion', 'other');--> statement-breakpoint
CREATE TYPE "public"."color_tone" AS ENUM('vibrant', 'pastel', 'warm', 'cool', 'monochrome', 'dark', 'bright', 'natural');--> statement-breakpoint
CREATE TYPE "public"."image_size" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."image_style" AS ENUM('realistic', 'artistic', 'anime', 'cartoon', 'digital-art', 'oil-painting', 'watercolor', '3d-render');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"comment_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"image_id" integer NOT NULL,
	"parent_comment_id" integer,
	"content" text NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_clerk_user_id" varchar(255) NOT NULL,
	"following_clerk_user_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"title" varchar(255),
	"description" text,
	"file_path" text NOT NULL,
	"thumbnail_url" text,
	"prompt" text NOT NULL,
	"translated_prompt" text,
	"negative_prompt" text,
	"category" "category",
	"image_size" "image_size" DEFAULT 'medium',
	"style" "image_style",
	"color_tone" "color_tone",
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"width" integer,
	"height" integer,
	"replicate_id" varchar(255),
	"tags" text[],
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"allow_download" boolean DEFAULT true NOT NULL,
	"allow_comments" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"image_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"credits" integer DEFAULT 10 NOT NULL,
	"last_refill_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "comment_likes_user_comment_idx" ON "comment_likes" USING btree ("clerk_user_id","comment_id");--> statement-breakpoint
CREATE INDEX "comments_image_id_idx" ON "comments" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "comments_clerk_user_id_idx" ON "comments" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "comments_parent_comment_id_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_follower_following_idx" ON "follows" USING btree ("follower_clerk_user_id","following_clerk_user_id");--> statement-breakpoint
CREATE INDEX "follows_follower_id_idx" ON "follows" USING btree ("follower_clerk_user_id");--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_clerk_user_id");--> statement-breakpoint
CREATE INDEX "images_clerk_user_id_idx" ON "images" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "images_visibility_idx" ON "images" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "images_category_idx" ON "images" USING btree ("category");--> statement-breakpoint
CREATE INDEX "images_created_at_idx" ON "images" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "likes_user_image_idx" ON "likes" USING btree ("clerk_user_id","image_id");--> statement-breakpoint
CREATE INDEX "likes_image_id_idx" ON "likes" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "likes_clerk_user_id_idx" ON "likes" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_credits_clerk_user_id_idx" ON "user_credits" USING btree ("clerk_user_id");