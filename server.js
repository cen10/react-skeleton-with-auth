const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const router = require("./routes");

require("dotenv").config();

const app = express();

// Middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(passport.initialize());

// Connect to DB
const db = process.env.MONGODB_URI || process.env.DB_LOCAL;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err =>
    console.log(
      "Unable to connect to the server - please start the server and try again. Error:",
      err
    )
  );

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// custom error handling middleware
app.use(function errorHandler(err, req, res, next) {
  // delegate to the default Express error handler if headers have already
  // been sent to client
  if (res.headersSent) {
    return next(err);
  }
  console.log("err", err);
  res.status(500).json({
    serverError: "Something went wrong - please try again later!"
  });
});

// Select the port in the env you are deploying from (e.g. Heroku) or 5000
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port} !`));
