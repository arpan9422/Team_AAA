-- CreateTable
CREATE TABLE "password_reset_otp" (
    "id" UUID NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "otp" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_reset_otp_email_otp_idx" ON "password_reset_otp"("email", "otp");
