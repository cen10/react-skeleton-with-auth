const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const async = require("async");
const crypto = require("crypto");
const validateRegistration = require("../../validation/register");
const validateLogin = require("../../validation/login");
const validateEmail = require("../../validation/email");
const validatePassword = require("../../validation/password");
const User = require("../../models/User");

router.post("/register", (req, res, next) => {
  const { errors, isValid } = validateRegistration(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          const token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, account) {
          if (err) return done(err);

          if (account) {
            return res
              .status(401)
              .json({ email: "This email is already in use" });
          }

          const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          });

          user.verifyAccountToken = token;
          user.verifyAccountExpires = Date.now() + 900000; //15 min

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASS
          }
        });

        const domain =
          process.env.NODE_ENV === "production"
            ? "" // UPDATE
            : "localhost:3000";

        var mailOptions = {
          to: user.email,
          from: "", // UPDATE,
          subject: "Verify Your Account",
          text:
            "Please click on the following link to verify your " +
            "account, or paste it into your browser to complete the " +
            "process.\n\n" +
            "Note: this link will expire in 15 minutes.\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "http://" +
            domain +
            "/verify-account/" +
            token +
            "\n\n"
        };

        smtpTransport.sendMail(mailOptions, function(err) {
          if (err) return done(err);

          res.status(200).json(
            `A verification email has been sent to ${user.email}. You cannot 
              log in until you've verified your account. Please check your 
              spam filters for an email from "" if 
              you haven't received it.` // UPDATE
          );
          done(null, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
    }
  );
});

router.get("/verify-account/:token", (req, res, next) => {
  User.findOne(
    {
      verifyAccountToken: req.params.token,
      verifyAccountExpires: { $gt: Date.now() }
    },
    function(err, user) {
      if (err) return next(err);

      if (!user) {
        return res.status(401).json({
          invalidAccountToken: `Your account validation link is invalid or has expired. Enter the 
            email address associated with your account to receive a new 
            validation email.`
        });
      }

      user.verified = true;
      user.verifyAccountToken = undefined;
      user.verifyAccountExpires = undefined;

      user.save(function(err, userData) {
        if (err) return next(err);

        const payload = {
          id: userData.id,
          name: userData.name
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          {
            expiresIn: 604800 // 1 week (sec)
          },
          (err, token) => {
            if (err) return next(err);

            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      });
    }
  );
});

router.post("/resend-verification", (req, res, next) => {
  const { errors, isValid } = validateEmail(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          const token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (err) return done(err);

          if (!user) {
            return res
              .status(401)
              .json({ emailNotFound: "This email does not have an account" });
          }

          if (user.verified) {
            return res.status(401).json({
              accountIsVerified: `This account has already been 
              verified. Try logging in again or resetting your password.`
            });
          }

          user.verifyAccountToken = token;
          user.verifyAccountExpires = Date.now() + 900000; //15 min

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASS
          }
        });

        const domain =
          process.env.NODE_ENV === "production"
            ? "" // UPDATE
            : "localhost:3000";

        var mailOptions = {
          to: user.email,
          from: "", // UPDATE,
          subject: "Verify Your Account",
          text:
            "Please click on the following link to verify your " +
            "account, or paste it into your browser to complete the " +
            "process.\n\n" +
            "Note: this link will expire in 15 minutes.\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "http://" +
            domain +
            "/verify-account/" +
            token +
            "\n\n"
        };

        smtpTransport.sendMail(mailOptions, function(err) {
          if (err) return done(err);

          res.status(200).json(
            `A verification email has been sent to ${user.email}. You cannot 
              log in until you've verified your account. Please check your 
              spam filters for an email from "" if 
              you haven't received it.` // UPDATE
          );
          done(null, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
    }
  );
});

router.post("/login", (req, res, next) => {
  const { errors, isValid } = validateLogin(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }, function(err, user) {
    if (err) return next(err);

    if (!user) {
      return res
        .status(401)
        .json({ emailNotFound: "This email does not have an account" });
    } else if (!user.verified) {
      return res.status(401).json({
        accountNotVerified: `You need to verify your email address before you 
        can login. You can resend a verification email now.`
      });
    } else if (user.isLocked) {
      return res.status(401).json({
        accountLocked: `You've tried to log in incorrectly more than 5 
          times so this account has been temporarily locked as a security 
          measure. Please try again later.`
      });
    }

    user.comparePassword(password, function(err, isMatch) {
      if (err) next(err);

      if (isMatch) {
        if (!user.loginAttempts && !user.accountLockedUntil) {
          const payload = {
            id: user.id,
            name: user.name
          };

          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
              expiresIn: 604800 // 1 week (sec)
            },
            (err, token) => {
              if (err) return next(err);

              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        }

        const updates = {
          $set: { loginAttempts: 0 },
          $unset: { accountLockedUntil: 1 }
        };

        return user.update(udpates, function(err) {
          if (err) return next(err);

          const payload = {
            id: user.id,
            name: user.name
          };

          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
              expiresIn: 604800 // 1 week (sec)
            },
            (err, token) => {
              if (err) return next(err);

              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        });
      } else {
        user.incrementLoginAttempts(function(err) {
          if (err) return next(err);

          return res
            .status(401)
            .json({ passwordIncorrect: "Incorrect password" });
        });
      }
    });
  });
});

router.post("/forgot-password", function(req, res, next) {
  const { errors, isValid } = validateEmail(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          const token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (err) return done(err);

          if (!user) {
            return res
              .status(401)
              .json({ emailNotFound: "This email does not have an account" });
          } else if (!user.verified) {
            return res.status(401).json({
              accountNotVerified: `You need to verify your email address before you 
              can reset your password. You can resend a verification email now.`
            });
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 900000; //15 min
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASS
          }
        });

        const domain =
          process.env.NODE_ENV === "production"
            ? "" // UPDATE
            : "localhost:3000";

        var mailOptions = {
          to: user.email,
          from: "", // UPDATE,
          subject: "Password Reset",
          text:
            "You are receiving this because you (or someone else) have " +
            "requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste it into your " +
            "browser to complete the process. \n\n" +
            "Note: this link will expire in 15 minutes.\n" +
            "If you did not request this, please ignore this email and your " +
            "password will remain unchanged.\n\n" +
            "http://" +
            domain +
            "/reset-password/" +
            token +
            "\n\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          if (err) return done(err);

          res.status(200).json(
            `An email has been sent to ${user.email} with further
              instructions. Please check your spam filters for an email from 
              "" if you haven't received it.`
          );
          done(null, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
    }
  );
});

router.get("/reset-password/:token", function(req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    function(err, user) {
      if (err) return next(err);

      if (!user) {
        return res.status(401).json({
          invalidPasswordReset:
            "Your password reset link is invalid or has expired. " +
            "Please try again."
        });
      }

      res.status(200).json({
        user
      });
    }
  );
});

router.post("/reset-password/:token", function(req, res) {
  async.waterfall(
    [
      function(done) {
        const { errors, isValid } = validatePassword(req.body);

        if (!isValid) {
          return res.status(401).json(errors);
        }

        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          function(err, user) {
            if (err) return done(err);

            if (!user) {
              res.status(401).json({
                invalidPasswordReset:
                  "Your password reset link is invalid or has expired. " +
                  "Please try again."
              });
            }

            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err, userData) {
              const payload = {
                id: userData.id,
                name: userData.name
              };
              if (err) return done(err);

              jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {
                  expiresIn: 604800 // 1 week (sec)
                },
                (err, token) => {
                  if (err) return done(err);

                  done(null, user);
                  res.json({
                    success: true,
                    token: "Bearer " + token
                  });
                }
              );
            });
          }
        );
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASS
          }
        });

        var mailOptions = {
          to: user.email,
          from: "", // UPDATE,
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          if (err) return done(err, "done");

          res.status(200).json(
            "Your password was reset. A confirmation email has been sent " +
              "to your email. Please check your spam filters for an email " +
              'from "" if you haven\'t received it.' // UPDATE
          );

          done(null, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
    }
  );
});

module.exports = router;
