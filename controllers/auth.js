// Load required packages
var passport = require("passport");
var BasicStrategy = require("passport-http").BasicStrategy;
var BearerStrategy = require("passport-http-bearer").Strategy;
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/user");
var Client = require("../models/client");
var Token = require("../models/token");

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(null, err);
      }

      // No user found with that username
      if (!user) {
        return done(null, false);
      }

      // Make sure the password is correct
      user.verifyPassword(password, function (err, isMatch) {
        if (err) {
          return done(null, err);
        }

        // Password did not match
        if (!isMatch) {
          return done(null, false);
        }

        // Success
        return done(null, user);
      });
    });
  })
);

passport.use(
  new BasicStrategy(function (username, password, callback) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return callback(err);
      }

      // No user found with that username
      if (!user) {
        return callback(null, false);
      }

      // Make sure the password is correct
      user.verifyPassword(password, function (err, isMatch) {
        if (err) {
          return callback(err);
        }

        // Password did not match
        if (!isMatch) {
          return callback(null, false);
        }

        // Success
        return callback(null, user);
      });
    });
  })
);

passport.use(
  "client-basic",
  new BasicStrategy(function (username, password, callback) {
    Client.findOne({ id: username }, function (err, client) {
      if (err) {
        return callback(err);
      }

      // No client found with that id or bad password
      if (!client || client.secret !== password) {
        return callback(null, false);
      }

      // Success
      return callback(null, client);
    });
  })
);

passport.use(
  new BearerStrategy(function (accessToken, callback) {
    Token.findOne({ value: accessToken }, function (err, token) {
      if (err) {
        return callback(err);
      }

      // No token found
      if (!token) {
        return callback(null, false);
      }

      User.findOne({ _id: token.userId }, function (err, user) {
        if (err) {
          return callback(err);
        }

        // No user found
        if (!user) {
          return callback(null, false);
        }

        // Simple example with no scope
        callback(null, user, { scope: "*" });
      });
    });
  })
);

exports.isAuthenticated = passport.authenticate(["basic", "bearer"], {
  session: false,
});
exports.isClientAuthenticated = passport.authenticate("client-basic", {
  session: false,
});
exports.isBearerAuthenticated = passport.authenticate("bearer", {
  session: false,
});
