const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const poolConfig = process.env.DB_HOST
    ? {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === "false"
            ? false
            : { rejectUnauthorized: false }
    }
    : (process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            host: "localhost",
            port: 5432,
            database: "counsellq"
        }
    );

const pool = new Pool(poolConfig);

module.exports = pool;
