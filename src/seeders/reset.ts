import * as schema from "../server/db/schema";
import { reset } from "drizzle-seed";
import { seederHelper } from "./helper"; // Adjust path to your db config file

async function dropAllTables() {
  try {
    await reset(seederHelper, {
      ...schema,
    });
    console.log("Successfully reset tables");
  } catch (error) {
    console.error("Error dropping tables:", error);
    throw error;
  }
}

// Run the function
dropAllTables()
  .then(() => {
    console.log("Completed resetting tables");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to drop tables:", err);
    process.exit(1);
  });
