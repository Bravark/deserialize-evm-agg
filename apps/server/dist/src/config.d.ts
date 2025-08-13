declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    REDIS_PASSWORD: string;
    REDIS_USER: string;
    REDIS_PORT: string;
};
declare const config: {
    REDIS_URL: string;
};
export { env, config };
