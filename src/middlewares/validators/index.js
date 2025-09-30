const authValidators = require('./auth.validator');
const courseValidators = require('./course.validator');
const lessonValidators = require('./lesson.validator');

module.exports = {
  auth: authValidators,
  course: courseValidators,
  lesson: lessonValidators
};