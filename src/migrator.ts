import { Database } from "arangojs";
import { Umzug } from "umzug";

import { ArangoDBStorage } from "./arangodb";
import { ISettings } from "./settings";

export class ArangoMigrate extends Umzug {
  constructor(settings: ISettings) {
    console.log(`Endpoint: ${settings.endpoint}`);

    const database = new Database({
      url: settings.endpoint,
      databaseName: settings.database,
      auth: { username: settings.username, password: settings.password },
    });

    super({
      migrations: { glob: "./migrations/**.ts" },
      storage: new ArangoDBStorage({ database }),
      context: database,
      logger: console,
    });
  }
}

export type Migration = (args: { context: Database }) => void;
