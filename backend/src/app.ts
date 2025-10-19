
const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users.router");
const authRouter = require("./routes/auth.router");
const eventsRouter = require("./routes/events.router")
const {
  handleCustomErrors,
  handlePSQLErrors,
  handleServerErrors,
} = require("./middleware/error.middleware");
const registrationsRouter = require("./routes/registrations.router");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api", usersRouter);
app.use("/api", eventsRouter);
app.use("/api", registrationsRouter);
app.get("/", (req: any, res: any) => {
  res.json({ message: "Event Platform API is running" });
});


app.use((req: any, res: any) => {
  res.status(404).json({ msg: "Route not found" });
});

app.use(handleCustomErrors);
app.use(handlePSQLErrors);
app.use(handleServerErrors);

module.exports = app;
