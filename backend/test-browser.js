import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  console.log("Browser abriu com sucesso");
  await browser.close();
})();
