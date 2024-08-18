const { Client } = require('pg')

async function queryUsers() {
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
        console.log("Connection error: ", err.stack)
    } {
        await client.end()
        console.log('Connection closed');
    }
}

async function insertUser(username) {
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

        const res = await client.query(`INSERT INTO users (username) VALUES ('${username}');`)
        console.log("Insertion succesful.")
    } catch(err) {
        console.log("Connection error: ", err.stack)
    } {
        await client.end()
        console.log('Connection closed');
    }
}

// insertUser("Ali")
queryUsers()
