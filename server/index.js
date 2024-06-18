import express from "express";
import fs from "fs";
import csv from "csv-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 4050;

import authRoute from "./routes/auth/auth.js";
import documentRoute from "./routes/document/document.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// const csvFilePath = path.join(
//   __dirname,
//   "../server/db/players_data_cleaned-test-2.csv"
// );
export let records = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, "db/players_data_cleaned-test-2.csv");

// Load CSV data into memory
function loadCsv() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => {
        // Parse evaluation columns
        for (let i = 1; i <= 3; i++) {
          data[`rater${i}_st`] = data[`rater${i}_st`] || "";
          data[`rater${i}_race`] = data[`rater${i}_race`] || "";
          data[`rater${i}_featuresa`] = data[`rater${i}_featuresa`] || "";
          data[`rater${i}_featuresb`] = data[`rater${i}_featuresb`] || "";
          data[`rater${i}_featuresc`] = data[`rater${i}_featuresc`] || "";
        }
        results.push(data);
      })
      .on("end", () => {
        records = results;
        resolve(results);
      })
      .on("error", reject);
  });
}

// ROUTE MIDDLEWARE
app.use("/api/auth", authRoute);
app.use("/api/document", documentRoute);

app.get("/", (req, res) => {
  res.send(`<h3>Hey! Skin Tone Backend is up !</h3>`);
});

// Start server and load CSV data
loadCsv()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server up and running at  ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to load CSV data:", err);
  });
