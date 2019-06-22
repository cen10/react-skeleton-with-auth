const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateLogin({ email, password }) {
  let errors = {};

  if (isEmpty(email)) {
    errors.email = "Email is required";
  } else if (!Validator.isEmail(email)) {
    errors.email = "Invalid email address. Check for typos!";
  }

  if (isEmpty(password)) {
    errors.password = "Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
