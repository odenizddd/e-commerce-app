const { Client } = require('pg')
import { User } from "./mockData";

export async function queryUsers(): Promise<void> {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        const res = await client.query("SELECT * FROM users;")
        console.log("Users: ", res.rows)
    } catch(err) {
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
    } {
        await client.end()
        console.log('Connection closed');
    }
}

export async function insertUsers(users: User[]) {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        await client.query('BEGIN')

        for (const user of users) {
            const {username, email, password} = user;
            await client.query(
                "INSERT INTO users (username, email, password)\
                VALUES ($1, $2, $3);", [username, email, password])
        }

        await client.query('COMMIT')
    } catch(err) {
        await client.query('ROLLBACK')
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
    } {
        await client.end()
        console.log('Connection closed');
    }
}
