import { object, string } from "joi";

export const schema = object({
  endpoint: string().default("http+tcp://127.0.0.1:8529"),
  username: string().default("root"),
  password: string().default(""),
  database: string().required(),
}).options({ stripUnknown: true });

export interface ISettings {
  endpoint: string;
  username: string;
  password: string;
  database: string;
}
