CREATE TABLE "images" (
	"key" varchar(40) PRIMARY KEY NOT NULL,
	"content_type" varchar(60) NOT NULL,
	"bytes" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
