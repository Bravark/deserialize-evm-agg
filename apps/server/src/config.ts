import { z } from "zod";

import path from "path";


// add dotenv
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);

// Define schema using zod for validation
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // DATABASE_URL: z.string(),
  // POSTGRES_USER: z.string(),
  // POSTGRES_PASSWORD: z.string(),
  // POSTGRES_DB: z.string(),
  // LOG_LEVEL: z.enum(["info", "warn", "error", "debug"]).default("info"),
  // BETTER_STACK_KEY: z.string(),
  PORT: z.string().transform((arg) => {
    return Number(arg);
  }),
  // DEV_KEY_FOR_LOOKUP_TABLE: z.string(),
  // SERVER_BASE_URL: z.string(),

  REDIS_PASSWORD: z.string(),
  REDIS_USER: z.string(),
  REDIS_PORT: z.string(),
});

// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1); // Exit the application if environment validation fails
}
const host = process.env.HOST || "localhost";

const hostToUse = "18.135.119.216"


const env = parsedEnv.data;

const config = {

  REDIS_URL: `redis://${env.REDIS_USER}:${env.REDIS_PASSWORD}@${hostToUse}:${env.REDIS_PORT}`,


};

export { env, config };
