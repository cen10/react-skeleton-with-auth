const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const SALT_WORK_FACTOR = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 180000; // 3 min

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0
    },
    accountLockedUntil: Date,
    verifyAccountToken: String,
    verifyAccountExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

UserSchema.virtual("isLocked").get(function() {
  let user = this;
  return !!(user.accountLockedUntil && user.accountLockedUntil > Date.now());
});

UserSchema.pre("save", function(next) {
  let user = this;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  let user = this;
  bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.incrementLoginAttempts = function(cb) {
  let user = this;

  if (user.accountLockedUntil && user.accountLockedUntil < Date.now()) {
    user.loginAttempts = 1;
    user.accountLockedUntil = undefined;

    return user.save(cb);
  }

  if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !user.isLocked) {
    user.accountLockedUntil = Date.now() + LOCK_TIME;
  }

  user.loginAttempts += 1;

  return user.save(cb);
};

module.exports = mongoose.model("user", UserSchema);
