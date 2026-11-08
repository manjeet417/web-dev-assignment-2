const express = require("express");
const cors = require("cors");

const { connection } = require("./db"); // also loads .env
const { userRouter } = require("./routes/user.route");
const { noteRouter } = require("./routes/note.route");
const { auth } = require("./middleware/auth.middleware");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Public routes
app.use("/user", userRouter);
app.get("/home", (req, res) => {
  res.send({ msg: "Welcome to Note Application" });
});

// Private routes
app.get("/dashboard", auth, (req, res) => {
  res.send({ msg: "Welcome to Note Application" });
});
app.use("/notes", auth, noteRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  try {
    await connection;
    console.log("DB Connected");
  } catch (error) {
    console.log("DB connection error:", error.message);
  }
  console.log(`server started on port ${PORT}`);
});
