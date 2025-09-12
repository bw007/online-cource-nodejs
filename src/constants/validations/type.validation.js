module.exports = {
  MUST_BE_STRING: (field) => `${field} must be a string`,
  MUST_BE_NUMBER: (field) => `${field} must be a number`,
  MUST_BE_BOOLEAN: (field) => `${field} must be a boolean`,
  MUST_BE_ARRAY: (field) => `${field} must be an array`,
  MUST_BE_OBJECT: (field) => `${field} must be an object`,
  MUST_BE_DATE: (field) => `${field} must be a valid date`,
};
