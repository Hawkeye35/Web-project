const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, "data.json");

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
}

app.post("/submit", (req, res) => {

    let reports = JSON.parse(fs.readFileSync(DATA_FILE));

    reports.push(req.body);

    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2));

    res.send("Saved");

});

app.get("/reports", (req, res) => {

    let reports = JSON.parse(fs.readFileSync(DATA_FILE));

    res.json(reports);

});

app.delete("/delete/:index", (req, res) => {

    let reports = JSON.parse(fs.readFileSync(DATA_FILE));

    const index = parseInt(req.params.index);

    if (index >= 0 && index < reports.length) {

        reports.splice(index, 1);

        fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2));

        res.send("Deleted");

    } else {

        res.status(404).send("Invalid index");

    }

});


app.listen(3000, () =>
    console.log("Server running on port 3000")
);