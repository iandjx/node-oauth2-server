const client = require("./client");
const cookieParser = require("cookie-parser");
const config = require("./config");
const db = require("./db");
const express = require("express");
const expressSession = require("express-session");
const fs = require("fs");
const https = require("https");
const oauth2 = require("./oauth2");
const passport = require("passport");
const path = require("path");
const site = require("./site");
// const token = require("./token");
const user = require("./user");

console.log("Using MemoryStore for the data store");
console.log("Using MemoryStore for the Session");
const MemoryStore = expressSession.MemoryStore;

// Express configuration
const app = express();
app.set("view engine", "ejs");
app.use(cookieParser());

// Session Configuration
app.use(
  expressSession({
    saveUninitialized: true,
    resave: true,
    secret: config.session.secret,
    store: new MemoryStore(),
    key: "authorization.sid",
    cookie: { maxAge: config.session.maxAge },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require("./auth");
const check = (req, res, next) => {
  console.log("request");
  console.log(req);
  next();
};

app.get("/", check, site.index);
app.get("/login", site.loginForm);
app.post("/login", site.login);
app.get("/logout", site.logout);
app.get("/account", site.account);

app.get("/dialog/authorize", oauth2.authorization);
app.post("/dialog/authorize/decision", oauth2.decision);
app.post("/oauth/token", oauth2.token);

app.get("/api/userinfo", user.info);
app.get("/api/clientinfo", client.info);

// static resources for stylesheets, images, javascript files
app.use(express.static(path.join(__dirname, "public")));

app.use((err, req, res, next) => {
  if (err) {
    if (err.status == null) {
      console.error("Internal unexpected error from:", err.stack);
      res.status(500);
      res.json(err);
    } else {
      res.status(err.status);
      res.json(err);
    }
  } else {
    next();
  }
});

// From time to time we need to clean up any expired tokens
// in the database
setInterval(() => {
  db.accessTokens
    .removeExpired()
    .catch((err) =>
      console.error("Error trying to remove expired tokens:", err.stack)
    );
}, config.db.timeToCheckExpiredTokens * 1000);

app.listen(3001);
