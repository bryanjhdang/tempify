// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import { petController } from "./controllers/pet.controller";
import { timeEntryController } from "./controllers/timeEntry.controller";
import { accountController } from "./controllers/account.controller";
import { authenticate } from "./middlewares/auth.middleware";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;
const address = process.env.ADDRESS || "localhost"

app.use(cors());
app.use(express.json());

app.get(`/`, (req : Request, res : Response) => {
  res.send("It's working!");
});

app.use(authenticate);

app.use('/account', accountController);

app.use('/timeEntry', timeEntryController);

app.use('/pet', petController);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://${address}:${port}`);
});