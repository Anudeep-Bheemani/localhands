import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, key, { auth: { persistSession: false } });

const { data: buckets, error: listErr } = await admin.storage.listBuckets();
if (listErr) {
  console.error("list error:", listErr);
  process.exit(1);
}

const exists = buckets.find((b) => b.name === "uploads");
if (exists) {
  console.log("bucket 'uploads' already exists");
} else {
  const { data, error } = await admin.storage.createBucket("uploads", {
    public: true,
    fileSizeLimit: "10MB",
  });
  if (error) {
    console.error("create error:", error);
    process.exit(1);
  }
  console.log("created bucket:", data);
}
