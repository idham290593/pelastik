const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Username cannot be empty.';
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password cannot be empty.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
