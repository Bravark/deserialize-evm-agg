"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.env = void 0;
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// add dotenv
require("dotenv").config({ path: path_1.default.resolve(process.cwd(), ".env") });
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
// Define schema using zod for validation
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    // DATABASE_URL: z.string(),
    // POSTGRES_USER: z.string(),
    // POSTGRES_PASSWORD: z.string(),
    // POSTGRES_DB: z.string(),
    // LOG_LEVEL: z.enum(["info", "warn", "error", "debug"]).default("info"),
    // BETTER_STACK_KEY: z.string(),
    PORT: zod_1.z.string().transform((arg) => {
        return Number(arg);
    }),
    // DEV_KEY_FOR_LOOKUP_TABLE: z.string(),
    // SERVER_BASE_URL: z.string(),
    REDIS_PASSWORD: zod_1.z.string(),
    REDIS_USER: zod_1.z.string(),
    REDIS_PORT: zod_1.z.string(),
});
// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    process.exit(1); // Exit the application if environment validation fails
}
const host = process.env.HOST || "localhost";
const env = parsedEnv.data;
exports.env = env;
const config = {
    REDIS_URL: `redis://${env.REDIS_USER}:${env.REDIS_PASSWORD}@${host}:${env.REDIS_PORT}`,
};
exports.config = config;
