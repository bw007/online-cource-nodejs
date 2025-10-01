const authValidators = require('./auth.validator');
const courseValidators = require('./course.validator');
const lessonValidators = require('./lesson.validator');
const sectionValidators = require('./section.validation')

module.exports = {
  auth: authValidators,
  course: courseValidators,
  lesson: lessonValidators,
  section: sectionValidators
};