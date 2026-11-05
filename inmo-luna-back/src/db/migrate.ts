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

console.log("Aplicando migraciones...");
await umzug.up();
console.log("Migraciones al día.");
await sequelize.close();
