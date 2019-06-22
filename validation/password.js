const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validatePassword({ password, password2 }) {
  let errors = {};

  if (isEmpty(password)) {
    errors.password = "Password is required and must be at least 10 characters";
  }

  if (isEmpty(password2)) {
    errors.password2 = "Please confirm your password";
  }

  if (!Validator.isLength(password, { min: 10 })) {
    errors.password = "Password must be at least 10 characters";
  }

  if (!Validator.equals(password, password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
