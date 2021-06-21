declare namespace NodeJS {
    export interface ProcessEnv {
        MONGO_USERNAME: string;
        MONGO_PASS: string;
        MONGO_HOST: string;
        MONGO_DB: string;
        PORT: number;
    }
}