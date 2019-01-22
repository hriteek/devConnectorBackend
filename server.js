const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

// our routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database config
const db = require("./config/keys").mongoURI;

// create connection with mongodb
mongoose
  .connect(
    db,
    { useMongoClient: true }
  )
  .then(() => console.log("connection established"))
  .catch(err => console.log(`error occured : ${err}`));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

app.get("/", (req, res) => {
  res.send("Hello world!!!");
});

// use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// *****************************

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server running in port ${port}`));
