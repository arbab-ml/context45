import { Index } from "@upstash/vector";
import { config } from "dotenv";
config();

async function main() {
  const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  });

  const before = await index.info();
  console.log(`Before: ${before.vectorCount} vectors`);

  await index.reset();

  const after = await index.info();
  console.log(`After reset: ${after.vectorCount} vectors`);
  console.log("✅ Index fully reset");
}

main();
