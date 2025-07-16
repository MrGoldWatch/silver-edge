-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hunts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "branch_name" TEXT,
    "branch_address" TEXT,
    "branch_number" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "hunt_date" DATE NOT NULL,
    "total_rolls" INTEGER NOT NULL DEFAULT 0,
    "total_coins_checked" INTEGER NOT NULL DEFAULT 0,
    "total_silver_found" INTEGER NOT NULL DEFAULT 0,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "processing_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hunts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hunt_denominations" (
    "id" TEXT NOT NULL,
    "hunt_id" TEXT NOT NULL,
    "denomination" TEXT NOT NULL,
    "number_of_rolls" INTEGER NOT NULL,
    "coins_per_roll" INTEGER NOT NULL,
    "total_coins_checked" INTEGER NOT NULL,
    "silver_coins_found" INTEGER NOT NULL DEFAULT 0,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "processing_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hunt_denominations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "hunts" ADD CONSTRAINT "hunts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunt_denominations" ADD CONSTRAINT "hunt_denominations_hunt_id_fkey" FOREIGN KEY ("hunt_id") REFERENCES "hunts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
