// src/base.ts
import Command, { flags } from "@oclif/command";
import { schema, ISettings } from "./settings";
import * as fs from "fs";

export default abstract class BaseCommand extends Command {
  static flags = {
    endpoint: flags.string({
      description: "Endpoint to connect to",
      env: "ARANGO_ENDPOINT",
    }),
    database: flags.string({
      description: "Database name to use when connecting",
      env: "ARANGO_DATABASE",
    }),
    username: flags.string({
      description: "Username to use when connecting",
      env: "ARANGO_USERNAME",
    }),
    password: flags.string({
      description: "Password to use when connecting.",
      env: "ARANGO_PASSWORD",
    }),
    config: flags.string({
      description: "The configuration file.",
      env: "ARANGO_CONFIG",
    }),
  };

  settings!: ISettings;

  async init() {
    let { flags } = this.parse(BaseCommand);

    // If the config file is provided, merge into our flags
    let config = {};
    if (flags.config) {
      if (!fs.existsSync(flags.config)) {
        this.error(`Config file does not exist: ${flags.config}`, { exit: 1 });
      }

      try {
        const raw = fs.readFileSync(flags.config, { encoding: "utf8" });
        config = JSON.parse(raw);
      } catch (err) {
        this.error(`Error occurred while reading config: ${err}`, { exit: 1 });
      }
    }

    const validation = schema.validate({ ...config, ...flags });
    if (validation.error) {
      this.error(`Invalid settings: ${validation.error.message}`, { exit: 1 });
    }

    this.settings = validation.value;
  }
}
