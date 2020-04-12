const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'The dataset name is at least 2 characters.';
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Name cannot be empty';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
