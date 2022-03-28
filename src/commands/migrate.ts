import Command from "../base";
import { ArangoMigrate } from "../migrator";

export default class Migrate extends Command {
  static description = "Applies migrations to the database";

  async run() {
    const migrator = new ArangoMigrate(this.settings);

    const migrations = await migrator.up();
    if (migrations.length === 0) {
      this.log("No migrations pending.");
      this.exit(0);
    }

    this.log(`Executed ${migrations.length} migrations`);
    migrations.forEach((meta) => {
      this.log(`- ${meta.name}`);
    });
  }
}
