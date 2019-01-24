const validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validatePostInput(data) {
  const errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = "Post most be between 10 and 300 character";
  }

  if (validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
