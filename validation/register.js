const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  if (!Validator.isLength(data.name, { min: 3, max: 30 })) {
    errors.name = 'Username of at least 3 characters.';
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Username cannot be empty.';
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email cannot be empty.';
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid.';
  }

  if (Validator.isEmpty(data.phone_number)) {
    errors.phone_number = 'Phone number cannot be empty.';
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password cannot be empty.';
  }

  if (!Validator.isLength(data.password, { min: 8, max: 30 })) {
    errors.password = 'Password is at least 8 characters long.';
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = 'Please confirm the password.';
  } else {
    if (!Validator.equals(data.password, data.password2)) {
      errors.password2 = 'Password does not match.';
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
