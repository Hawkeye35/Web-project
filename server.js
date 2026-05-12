const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path"); // Imports required modules, express for servers, mysql2 for node.js to talk to mysql, and cors to allow frontend to send info.

const session = require("express-session");

const app = express(); // create server, allow requests, and lets the server read json.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "windmill-secret-key",
    resave: false,
    saveUninitialized: false
}));

function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.status(401).send("You must log in first.");
    }
}

app.use(express.static(__dirname));

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    if (username === "admin" && password === "windmill123") {
        req.session.loggedIn = true;
        res.redirect("/index.html");
    } else {
        res.send("Wrong username or password");
    }
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/login.html");
});

// Database stuff

const pool = mysql.createPool({ // pool for multiple users
    host: 'localhost', // temp username and password
    user: 'root',
    password: '', 
    database: 'webproject',
    waitForConnections: true, // might need
});

const db = pool.promise(); 


// SUBMIT

app.post("/submit", async (req, res) => { // creates endpoint
    const { firstName, lastName, city, state, numberOfPeople } = req.body;

    const price = 0;
    const visitDate = new Date().toISOString().split('T')[0]; // get visit date and split the unnecessary part

    try {
        let [states] = await db.execute("SELECT StateID FROM State WHERE StateName = ?", [state]); // checks if the state's already there, if not, then it creates a new id.
        let stateId;
        if (states.length > 0) {
            stateId = states[0].StateID;
        } else {
            const [newState] = await db.execute("INSERT INTO State (StateName, CountryID) VALUES (?, 1)", [state]);
            stateId = newState.insertId;
        }


        let [towns] = await db.execute("SELECT TownID FROM Town WHERE TownName = ? AND StateID = ?", [city, stateId]); // same but with towns
        let townId;
        if (towns.length > 0) {
            townId = towns[0].TownID;
        } else {
            const [newTown] = await db.execute("INSERT INTO Town (TownName, StateID) VALUES (?, ?)", [city, stateId]);
            townId = newTown.insertId;
        }

        // creates visitor
        const query = `INSERT INTO Visitors (FirstName, LastName, VisitDate, NumberOfPeople, Price, TownID) VALUES (?, ?, ?, ?, ?, ?)`;

        await db.execute(query, [firstName, lastName, visitDate, numberOfPeople, price, townId]);

        res.send("Saved successfully");
    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).send("Database Error: " + err.message);
    }
});

// Displays the data with filters and sorting
app.get("/reports", async (req, res) => {
    const { search, state, startDate, endDate, sort } = req.query;

    let sql = `
        SELECT 
            v.VisitorsID,
            v.FirstName,
            v.LastName,
            v.VisitDate,
            v.NumberOfPeople,
            v.Price,
            t.TownName,
            s.StateName
        FROM Visitors v
        JOIN Town t ON v.TownID = t.TownID
        JOIN State s ON t.StateID = s.StateID
        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                v.FirstName LIKE ? OR
                v.LastName LIKE ? OR
                t.TownName LIKE ?
            )
        `;
        values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (state) {
        sql += ` AND s.StateName = ?`;
        values.push(state);
    }

    if (startDate) {
        sql += ` AND v.VisitDate >= ?`;
        values.push(startDate);
    }

    if (endDate) {
        sql += ` AND v.VisitDate <= ?`;
        values.push(endDate);
    }

    if (sort === "oldest") {
        sql += ` ORDER BY v.VisitDate ASC`;
    } else {
        sql += ` ORDER BY v.VisitDate DESC`;
    }

    try {
        const [rows] = await db.execute(sql, values);
        res.json(rows);
    } catch (err) {
        console.error("Report Error:", err);
        res.status(500).send("Database Error");
    }
});

// delete an entry
app.delete("/delete/:id", async (req, res) => {
    const visitorId = req.params.id;
    try {
        await db.execute("DELETE FROM Visitors WHERE VisitorsID = ?", [visitorId]);
        res.send("Deleted");
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).send("Database Error");
    }
});

// edit an entry
app.put("/edit/:id", async (req, res) => {
    const visitorId = req.params.id;
    const { firstName, lastName, city, state, visitDate, numberOfPeople, price } = req.body;

    try {
        let [states] = await db.execute(
            "SELECT StateID FROM State WHERE StateName = ?",
            [state]
        );

        let stateId;

        if (states.length > 0) {
            stateId = states[0].StateID;
        } else {
            const [newState] = await db.execute(
                "INSERT INTO State (StateName, CountryID) VALUES (?, 1)",
                [state]
            );
            stateId = newState.insertId;
        }

        let [towns] = await db.execute(
            "SELECT TownID FROM Town WHERE TownName = ? AND StateID = ?",
            [city, stateId]
        );

        let townId;

        if (towns.length > 0) {
            townId = towns[0].TownID;
        } else {
            const [newTown] = await db.execute(
                "INSERT INTO Town (TownName, StateID) VALUES (?, ?)",
                [city, stateId]
            );
            townId = newTown.insertId;
        }

        await db.execute(
            `
            UPDATE Visitors
            SET FirstName = ?,
                LastName = ?,
                VisitDate = ?,
                NumberOfPeople = ?,
                Price = ?,
                TownID = ?
            WHERE VisitorsID = ?
            `,
            [firstName, lastName, visitDate, numberOfPeople, price, townId, visitorId]
        );

        res.send("Updated");
    } catch (err) {
        console.error("Edit Error:", err);
        res.status(500).send("Database Error: " + err.message);
    }
});

app.post("/import-csv", async (req, res) => {
    const entries = req.body;

    try {
        for (const entry of entries) {
            const { firstName, lastName, city, state, visitDate, numberOfPeople, price } = entry;

            let [states] = await db.execute(
                "SELECT StateID FROM State WHERE StateName = ?",
                [state]
            );

            let stateId;

            if (states.length > 0) {
                stateId = states[0].StateID;
            } else {
                const [newState] = await db.execute(
                    "INSERT INTO State (StateName, CountryID) VALUES (?, 1)",
                    [state]
                );
                stateId = newState.insertId;
            }

            let [towns] = await db.execute(
                "SELECT TownID FROM Town WHERE TownName = ? AND StateID = ?",
                [city, stateId]
            );

            let townId;

            if (towns.length > 0) {
                townId = towns[0].TownID;
            } else {
                const [newTown] = await db.execute(
                    "INSERT INTO Town (TownName, StateID) VALUES (?, ?)",
                    [city, stateId]
                );
                townId = newTown.insertId;
            }

            await db.execute(
                `
                INSERT INTO Visitors 
                (FirstName, LastName, VisitDate, NumberOfPeople, Price, TownID)
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [firstName, lastName, visitDate, numberOfPeople, price, townId]
            );
        }

        res.send("CSV imported successfully");
    } catch (err) {
        console.error("CSV Import Error:", err);
        res.status(500).send("Database Error: " + err.message);
    }
});

app.get("/summary-reports", async (req, res) => {
    const { startDate, endDate } = req.query;

    let whereSql = " WHERE 1 = 1 ";
    const values = [];

    if (startDate) {
        whereSql += " AND v.VisitDate >= ?";
        values.push(startDate);
    }

    if (endDate) {
        whereSql += " AND v.VisitDate <= ?";
        values.push(endDate);
    }

    try {

        // TOTAL
const [totalRows] = await db.execute(
    `
    SELECT 
        COUNT(*) AS TotalEntries,
        COALESCE(SUM(v.NumberOfPeople), 0) AS TotalVisitors,
        COALESCE(SUM(v.Price), 0) AS TotalMoney
    FROM Visitors v
    ${whereSql}
    `,
    values
);


// STATES
const [states] = await db.execute(
    `
    SELECT 
        s.StateName,
        COUNT(*) AS TotalEntries,
        COALESCE(SUM(v.NumberOfPeople), 0) AS TotalVisitors,
        COALESCE(SUM(v.Price), 0) AS TotalMoney
    FROM Visitors v
    JOIN Town t ON v.TownID = t.TownID
    JOIN State s ON t.StateID = s.StateID
    ${whereSql}
    GROUP BY s.StateName
    ORDER BY TotalVisitors DESC
    `,
    values
);

const [daily] = await db.execute(
    `
    SELECT 
        v.VisitDate,
        COUNT(*) AS TotalEntries,
        COALESCE(SUM(v.NumberOfPeople), 0) AS TotalVisitors,
        COALESCE(SUM(v.Price), 0) AS TotalMoney
    FROM Visitors v
    WHERE v.VisitDate = CURDATE()
    GROUP BY v.VisitDate
    `,
);

res.json({
    total: totalRows[0],
    daily: daily,
    states: states
});

    } catch (err) {
        console.error("Summary Report Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/state-totals", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                s.StateName,
                SUM(v.NumberOfPeople) AS total
            FROM Visitors v
            JOIN Town t ON v.TownID = t.TownID
            JOIN State s ON t.StateID = s.StateID
            GROUP BY s.StateName
        `);

        const result = {};

        rows.forEach(row => {
            result[row.StateName] = row.total;
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// starts the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});