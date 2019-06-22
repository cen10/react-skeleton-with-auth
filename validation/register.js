const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegistration({
  name,
  email,
  password,
  password2
}) {
  let errors = {};

  if (isEmpty(name)) {
    errors.name = "Name is required";
  }

  if (isEmpty(email)) {
    errors.email = "Email is required";
  } else if (!Validator.isEmail(email)) {
    errors.email = "Invalid email address. Check for typos!";
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
