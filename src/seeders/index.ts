import { seed } from "drizzle-seed";
import { applications, users } from "../server/db/schema";
import { seederHelper } from "./helper";
import { hash } from "@node-rs/argon2";

async function main() {
  const hasedPassword = await hash(process.env.ADMIN_PASSWORD ?? "test12345");
  await seed(seederHelper, { users }, { count: 1 }).refine((f) => ({
    users: {
      columns: {
        username: f.valuesFromArray({ values: ["admin"] }),
        password: f.valuesFromArray({ values: [hasedPassword] }),
      },
    },
  }));
  await seed(seederHelper, { applications }, { count: 100 });
}

main()
  .then(() => {
    console.log("Seeding has been completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error while seeding:", err);
    process.exit(1);
  });
