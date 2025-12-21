import { chromium } from "playwright";
import fs from "fs";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent("<h1>PDF OK</h1>");

  const pdf = await page.pdf({ format: "A4" });
  fs.writeFileSync("teste.pdf", pdf);

  await browser.close();
  console.log("PDF gerado com sucesso");
})();
