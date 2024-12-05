console.log("i have been updated");
import db from "./db/conn.mjs";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

//process.env is what allows me to access the .env
//PORT is what it was called  in the .env file
import grades from "./routes/grades.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

//middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send(
    "Welcome to the API. Documents could go here, or you could redirect to documentation"
  );
});
app.use("/grades", grades);

app.use((err, _req, res, next) => {
  res.status(500).send("seems like we mess up somewhere");
});
//start expres application
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
