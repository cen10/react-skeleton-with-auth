const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateEmail({ email }) {
  let errors = {};

  if (isEmpty(email)) {
    errors.email = "Email is required";
  } else if (!Validator.isEmail(email)) {
    errors.email = "Invalid email address. Check for typos!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
