import { CollectionType, DocumentCollection } from "arangojs/collection";
import { Database } from "arangojs";
import { EnsurePersistentIndexOptions } from "arangojs/indexes";

export async function ensureDocumentCollection(database: Database, name: string): Promise<DocumentCollection> {
  const col = database.collection(name);
  if (!(await col.exists())) await col.create({ type: CollectionType.DOCUMENT_COLLECTION });

  return col;
}

export async function ensureEdgeCollection(database: Database, name: string): Promise<DocumentCollection> {
  const col = database.collection(name);
  if (!(await col.exists())) await col.create({ type: CollectionType.EDGE_COLLECTION });

  return col;
}

export async function ensureProxiedCollection(
  database: Database,
  name: string,
  proxy_index: EnsurePersistentIndexOptions
): Promise<DocumentCollection> {
  const col = await ensureDocumentCollection(database, name);
  const proxy = await ensureDocumentCollection(database, name + "_proxy");

  await proxy.ensureIndex(proxy_index);

  return col;
}

export async function ensureProxiedExternalCollection(database: Database, name: string): Promise<DocumentCollection> {
  return await ensureProxiedCollection(database, name, {
    type: "persistent",
    fields: ["type", "external.id", "external.source"],
    unique: true,
  });
}
