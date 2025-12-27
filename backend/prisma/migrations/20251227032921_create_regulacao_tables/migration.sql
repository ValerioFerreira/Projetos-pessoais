-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "regulacao";

-- CreateTable
CREATE TABLE "regulacao"."change_log" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "operator_id" INTEGER NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulacao"."health_unit" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "zip_code" VARCHAR(20) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone1" VARCHAR(30) NOT NULL,
    "phone2" VARCHAR(30),
    "phone3" VARCHAR(30),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "health_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulacao"."health_unit_specialty" (
    "id" SERIAL NOT NULL,
    "health_unit_id" INTEGER NOT NULL,
    "specialty_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'available',
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_unit_specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulacao"."operator" (
    "id" SERIAL NOT NULL,
    "rank" VARCHAR(20) NOT NULL,
    "registry" VARCHAR(30) NOT NULL,
    "nickname" VARCHAR(100) NOT NULL,

    CONSTRAINT "operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulacao"."restriction_event" (
    "id" SERIAL NOT NULL,
    "health_unit_id" INTEGER NOT NULL,
    "specialty_id" INTEGER NOT NULL,
    "operator_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(6),
    "duration_minutes" INTEGER,
    "doctor_name" VARCHAR(255) NOT NULL,
    "doctor_crm" VARCHAR(50) NOT NULL,
    "informant" VARCHAR(255),
    "reason" TEXT,
    "close_type" VARCHAR(20),

    CONSTRAINT "restriction_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulacao"."specialty" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20),

    CONSTRAINT "specialty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_hus_status" ON "regulacao"."health_unit_specialty"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_hus" ON "regulacao"."health_unit_specialty"("health_unit_id", "specialty_id");

-- CreateIndex
CREATE INDEX "idx_restriction_event_period" ON "regulacao"."restriction_event"("start_time", "end_time");

-- AddForeignKey
ALTER TABLE "regulacao"."change_log" ADD CONSTRAINT "fk_cl_event" FOREIGN KEY ("event_id") REFERENCES "regulacao"."restriction_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regulacao"."change_log" ADD CONSTRAINT "fk_cl_operator" FOREIGN KEY ("operator_id") REFERENCES "regulacao"."operator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regulacao"."health_unit_specialty" ADD CONSTRAINT "fk_hus_health_unit" FOREIGN KEY ("health_unit_id") REFERENCES "regulacao"."health_unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regulacao"."health_unit_specialty" ADD CONSTRAINT "fk_hus_specialty" FOREIGN KEY ("specialty_id") REFERENCES "regulacao"."specialty"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regulacao"."restriction_event" ADD CONSTRAINT "fk_re_health_unit" FOREIGN KEY ("health_unit_id") REFERENCES "regulacao"."health_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regulacao"."restriction_event" ADD CONSTRAINT "fk_re_operator" FOREIGN KEY ("operator_id") REFERENCES "regulacao"."operator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regulacao"."restriction_event" ADD CONSTRAINT "fk_re_specialty" FOREIGN KEY ("specialty_id") REFERENCES "regulacao"."specialty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
