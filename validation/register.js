const validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : ""; //here we are checking that if the user enter the empty fields in the form then we should convert that particular field empty
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 to 30 character";
  }
  if (validator.isEmpty(data.name)) {
    errors.name = "Name is required";
  }

  if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be atlest 6 character";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  if (!validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
  if (validator.isEmpty(data.password2)) {
    errors.password2 = "Conform Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
