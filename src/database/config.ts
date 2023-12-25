import pg from "pg";

export function database() {
    return new pg.Pool({
        database: 'postgres_db',
        user: 'postgres',
        password: '1276',
        port: 5432,
        statement_timeout: 10000,
        connectionTimeoutMillis: 30000,
        max: 30,
    })
}

