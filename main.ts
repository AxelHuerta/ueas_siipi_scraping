// Import Astral
import { launch } from "jsr:@astral/astral";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

const env = config();

type UEA = {
  clave: string;
  grupo: string;
  nombre: string;
  profesor: string;
  creditos: string;
  semana: string[][];
};

// Launch the browser
const browser = await launch();

// Open a new page
const page = await browser.newPage("https://siipi.izt.uam.mx/login");

// Click the search button
const closeModal = await page.$('a[data-dismiss="modal"]');
await closeModal!.click();

await page.waitForNetworkIdle({ idleConnections: 0, idleTime: 1000 });

// Type in the search input
const username = await page.$("#username");
await username!.type(env.USER, { delay: 1000 });

const password = await page.$("#password");
await password!.type(env.PASSWORD, { delay: 1000 });

// CLick the login button
const loginButton = await page.$('input[name="login"]');
await loginButton!.click();

// wait for the page loading
await new Promise((r) => setTimeout(r, 5000));

// Go to grupos_programados
await page.goto("https://siipi.izt.uam.mx/alumno/grupos_programados");

// wait for the page loading
await new Promise((r) => setTimeout(r, 5000));

const table = await page.evaluate(() => {
  const data: UEA[] = [];
  const content = document.querySelector("tbody");
  const columns = content?.querySelectorAll("tr") ?? [];

  for (const column of Array.from(columns)) {
    const rows = column.querySelectorAll("td");

    const claveElement = rows[0].querySelector("a");
    const clave = claveElement ? claveElement.innerText.trim() : "";
    const grupo = rows[1].innerText.trim();
    const nombreElement = rows[2].querySelector("b");
    const nombre = nombreElement ? nombreElement.innerText : "";
    const profesor = rows[2].innerText.split("\n")[1];
    const creditos = rows[3].innerText;

    const semana: string[][] = [];
    for (let j = 4; j < 9; j++) {
      const temp: string[] = rows[j].innerText.split("\n");
      temp.pop();
      semana.push(temp);
    }

    data.push({
      clave,
      grupo,
      nombre,
      profesor,
      creditos,
      semana,
    });
  }

  return data;
});

console.log(table);

// Take a screenshot of the page and save that to disk
// const screenshot = await page.screenshot();
// Deno.writeFileSync("screenshot.png", screenshot);

// Close the browser
await browser.close();
