import * as edgedb from "edgedb";

const client = edgedb.createClient({
  instanceName: process.env.EDGEDB_INSTANCE!,
  secretKey: process.env.EDGEDB_SECRET_KEY!,
});

export default client;
