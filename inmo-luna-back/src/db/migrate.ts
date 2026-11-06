import { SequelizeStorage, Umzug } from "umzug";
import { sequelize } from "./index.js";
import * as initial from "./migrations/20261105000000-initial.js";

const umzug = new Umzug({
  migrations: [
    {
      name: "20261105000000-initial",
      up: initial.up,
      down: initial.down,
    },
  ],
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// En hostings como Railway, la base puede tardar unos segundos en aceptar conexiones.
for (let attempt = 1; attempt <= 12; attempt += 1) {
  try {
    await sequelize.authenticate();
    break;
  } catch (error) {
    if (attempt === 12) throw error;
    console.log(`Esperando a PostgreSQL (intento ${attempt}/12)...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

console.log("Aplicando migraciones...");
await umzug.up();
console.log("Migraciones al día.");
await sequelize.close();
