const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.code = !isEmpty(data.code) ? data.code : '';

  if (Validator.isEmpty(data.code)) {
    errors.code = 'Code cannot be empty.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
