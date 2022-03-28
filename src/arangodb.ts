import { aql, Database } from "arangojs";
import { DocumentCollection } from "arangojs/collection";
import { UmzugStorage } from "umzug";

import * as crypto from "crypto";
import * as fs from "fs";

interface ArangoDBStorageConstructorOptions {
  /**
  The configured instance of ArangoDB
  */
  readonly database: Database;
}

function checksum(file: string): string {
  try {
    const data = fs.readFileSync(file, "utf8");
    return crypto.createHash("md5").update(data, "utf8").digest("hex");
  } catch (err) {
    return "";
  }
}

export class ArangoDBStorage implements UmzugStorage {
  public readonly database: Database;

  /**
   * Contains the collection which holds our schema history
   */
  private readonly collection: DocumentCollection;

  constructor(options: ArangoDBStorageConstructorOptions) {
    this.database = options.database;
    this.collection = this.database.collection("schema_history");
  }

  async logMigration({
    name,
    path,
  }: {
    name: string;
    path?: string;
  }): Promise<void> {
    let data: Record<string, string> = {
      created: new Date().toISOString(),
      name: name,
    };

    if (path) {
      data["checksum"] = checksum(path);
    }

    await this.collection.save(data);
  }

  async unlogMigration({
    name: migrationName,
  }: {
    name: string;
  }): Promise<void> {
    throw Error("Not Implemented");
  }

  async executed(): Promise<string[]> {
    const collection = await this.getCollection();

    const cursor = await this.database.query(aql`
      FOR doc IN ${collection}
      RETURN doc
    `);
    const migrations = await cursor.all();
    return migrations.map((migration: any) => migration.name);
  }

  private async getCollection(): Promise<DocumentCollection> {
    const exists = await this.collection.exists();
    if (!exists) {
      await this.collection.create();
      await this.collection.ensureIndex({
        type: "persistent",
        fields: ["name"],
        unique: true,
      });
    }

    return this.collection;
  }
}
