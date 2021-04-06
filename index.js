// Load required packages
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var session = require("express-session");
var passport = require("passport");
var userController = require("./controllers/user");
var authController = require("./controllers/auth");
var oauth2Controller = require("./controllers/oauth2");
var clientController = require("./controllers/client");

// Connect to the beerlocker MongoDB
mongoose.connect("mongodb://localhost:27017/oauth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Create our Express application
var app = express();

// Set view engine to ejs
app.set("view engine", "ejs");

// Use the body-parser package in our application
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Use express session support since OAuth2orize requires it
app.use(
  session({
    secret: "Super Secret Session Key",
    saveUninitialized: true,
    resave: true,
  })
);

// Use the passport package in our application
app.use(passport.initialize());

// Create our Express router
var router = express.Router();

// Create endpoint handlers for /users
router
  .route("/api/users")
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers);

// Create endpoint handlers for /clients
router
  .route("/api/clients")
  .post(authController.isAuthenticated, clientController.postClients)
  .get(authController.isAuthenticated, clientController.getClients);

// Create endpoint handlers for oauth2 authorize
router
  .route("/api/oauth2/authorize")
  .get(authController.isAuthenticated, oauth2Controller.authorization)
  .post(authController.isAuthenticated, oauth2Controller.decision);

// Create endpoint handlers for oauth2 token
router
  .route("/api/oauth2/token")
  .post(authController.isClientAuthenticated, oauth2Controller.token);

// Register all our routes
app.use(router);

// Start the server
app.listen(3000);