import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import prisma from "../config/database.js";

/* =============================
   UTIL
============================= */

function minutesToHours(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}min`;
}

function renderRows(items, columns) {
  return items
    .map(item => {
      return `
        <tr>
          ${columns.map(c => `<td>${item[c]}</td>`).join("")}
        </tr>
      `;
    })
    .join("");
}

/* =============================
   SERVICE PRINCIPAL
============================= */

export async function generateRestrictionReport({
  health_unit_ids,
  start_date,
  end_date
}) {

  const startDate = new Date(start_date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(end_date);
  endDate.setHours(23, 59, 59, 999);

  const templatePath = path.resolve(
    "src/reports/report.template.html"
  );

  let html = fs.readFileSync(templatePath, "utf-8");

  let unitsHtml = "";

  for (let i = 0; i < health_unit_ids.length; i++) {
    const unitId = health_unit_ids[i];

    /* =============================
       DADOS DA UNIDADE
    ============================= */

    const unit = await prisma.health_unit.findUnique({
      where: { id: unitId },
      select: { name: true }
    });

    /* =============================
       CTE BASE
    ============================= */

    const baseQuery = `
      WITH events_in_period AS (
        SELECT
          re.id,
          re.specialty_id,
          re.doctor_name,
          re.doctor_crm,
          re.start_time,
          COALESCE(re.end_time, NOW()) AS end_time,
          EXTRACT(
            EPOCH FROM (
              LEAST(COALESCE(re.end_time, NOW()), ($2::date + INTERVAL '1 day'))
              -
              GREATEST(re.start_time, $1::date)
            )
          ) / 60 AS duration_minutes
        FROM regulacao.restriction_event re
        WHERE
          re.health_unit_id = $3
          AND re.start_time < ($2::date + INTERVAL '1 day')
          AND (re.end_time IS NULL OR re.end_time >= $1::date)
      )

    `;

    // TOTAL
    const [total] = await prisma.$queryRawUnsafe(
      `
      ${baseQuery}
      SELECT COALESCE(SUM(duration_minutes), 0) AS total
      FROM events_in_period
      `,
      startDate,
      endDate,
      unitId
    );
    console.log("TOTAL CALCULADO:", total);

    // MÉDICOS
    const doctors = await prisma.$queryRawUnsafe(
      `
      ${baseQuery}
      SELECT
        doctor_name AS name,
        SUM(duration_minutes) AS time
      FROM events_in_period
      GROUP BY doctor_name
      ORDER BY time DESC
      LIMIT 5
      `,
      startDate,
      endDate,
      unitId
    );
    console.log("MEDICOS:", doctors);

    // ESPECIALIDADES
    const specialties = await prisma.$queryRawUnsafe(
      `
      ${baseQuery}
      SELECT
        s.name AS name,
        SUM(e.duration_minutes) AS time
      FROM events_in_period e
      JOIN regulacao.specialty s ON s.id = e.specialty_id
      GROUP BY s.name
      ORDER BY time DESC
      LIMIT 5
      `,
      startDate,
      endDate,
      unitId
    );
    console.log("ESPECIALIDADES:", specialties);

    // HORAS
    const hours = await prisma.$queryRawUnsafe(
      `
      ${baseQuery}
      SELECT
        LPAD(EXTRACT(HOUR FROM start_time)::text, 2, '0') || 'h' AS name,
        SUM(duration_minutes) AS time
      FROM events_in_period
      GROUP BY EXTRACT(HOUR FROM start_time)
      ORDER BY time DESC
      LIMIT 5
      `,
      startDate,
      endDate,
      unitId
    );
    console.log("HORAS:", hours);


    const unitBlock = `
      <div class="unit ${i > 0 ? "page-break" : ""}">
        <h2>${unit.name}</h2>

        <div class="summary">
          <strong>Tempo total de restrição:</strong>
          ${minutesToHours(total.total)}
        </div>

        <div class="tables">

          <table>
            <caption>Médicos</caption>
            <thead>
              <tr><th>Médico</th><th>Tempo</th></tr>
            </thead>
            <tbody>
              ${renderRows(
                doctors.map(d => ({
                  name: d.name,
                  time: minutesToHours(d.time)
                })),
                ["name", "time"]
              )}
            </tbody>
          </table>

          <table>
            <caption>Especialidades</caption>
            <thead>
              <tr><th>Especialidade</th><th>Tempo</th></tr>
            </thead>
            <tbody>
              ${renderRows(
                specialties.map(s => ({
                  name: s.name,
                  time: minutesToHours(s.time)
                })),
                ["name", "time"]
              )}
            </tbody>
          </table>

          <table>
            <caption>Horários</caption>
            <thead>
              <tr><th>Hora</th><th>Tempo</th></tr>
            </thead>
            <tbody>
              ${renderRows(
                hours.map(h => ({
                  name: h.name,
                  time: minutesToHours(h.time)
                })),
                ["name", "time"]
              )}
            </tbody>
          </table>

        </div>
      </div>
    `;

    unitsHtml += unitBlock;
  }

  html = html
    .replace("{{PERIODO}}", `${start_date} a ${end_date}`)
    .replace("{{DATA_GERACAO}}", new Date().toLocaleDateString())
    .replace("{{UNIDADES}}", unitsHtml);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "load" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true
  });

  await browser.close();

  return pdf;
}
