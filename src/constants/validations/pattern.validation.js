module.exports = {
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_POSTAL_CODE: 'Postal code must be 6 digits',
  INVALID_INN: 'INN must be 9 digits',
  ONLY_LETTERS: (field) => `${field} must contain only letters`
};