const { Client } = require('pg')

async function queryUsers(): Promise<void> {
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

queryUsers()
