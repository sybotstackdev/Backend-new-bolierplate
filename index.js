import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import { fileURLToPath } from "url";
import http from 'http';
import bodyParser from "body-parser";
import passport from "passport";
import { dirname } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();


// Create Express app
const app = express();
const PORT = process.env.PORT || 5000
const server = http.createServer(app);
server.timeout = 300000; // 300,000ms = 5 minutes


const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies if needed
  })
);


app.use(express.json({ limit: "20mb" }));

app.use(express.urlencoded({ limit: "15mb", extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());


app.get("/", async (req, res) => {
  res.send("Hello")
});



pool
  .connect()
  .then(async () => {
    // await createTables(); // Ensure tables are created or already exist

    const server = http.createServer(app); // Create the HTTP server
    server.listen(PORT, () => {
      console.info(`Server Running on Port: http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.error(`${error} did not connect`));
