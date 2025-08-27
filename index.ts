import "@dotenvx/dotenvx/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import apiRoutes from "./routes/index.js";
import { client } from "./db/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
server.use(cors());
server.use(morgan("dev"));
server.use(bodyParser.json());
server.use("/api", apiRoutes);

server.use((req: any, res: any, next: any) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

server.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).send(err);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Server is running on ${PORT}!`);
  try {
    await client.connect();
    console.log("Database is open for business!");
  } catch (error) {
    console.error("Database is closed for repairs!\n", error);
  }
});
