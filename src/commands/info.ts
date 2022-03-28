import Command from "../base";
import { ArangoMigrate } from "../migrator";

export default class Info extends Command {
  static description =
    "Retrieve information about the current schema migration status";

  async run() {
    const migrator = new ArangoMigrate(this.settings);
    const pending = await migrator.pending();

    this.log(`Pending migrations: ${pending.length}`);
    pending.forEach((meta) => {
      this.log(`- ${meta.name}`);
    });
  }
}
