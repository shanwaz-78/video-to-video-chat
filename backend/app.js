import "dotenv/config";
import express from "express";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes/index.js";
import { openSocketConnection } from "./utils/wsConnection.js";

const port = process.env.PORT || 8080;
const app = express();

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    message: "Too many requests, please try again later.",
  })
);
app.use(cors());
app.use(express.json());

app.use("/api/v1", routes.userRoute);

const server = createServer(app);
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

openSocketConnection(server);

server.on("error", (err) => {
  console.error(`Server error: ${err.message}`);
});
