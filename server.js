import cors from "cors";
import { config } from "dotenv";
import express from "express";
import connectDb from "./config/database.js";
import auth from "./routes/auth.js";
import user from "./routes/user.js";
config();
connectDb();
const port = process.env.API_PORT || 9000;
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use("/auth", auth);
app.use("/user", user);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Hellow World",
  });
});
app.all("*", (req, res) => {
  res.status(404).send("Sorry, the route you are going to does not exist");
});

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
