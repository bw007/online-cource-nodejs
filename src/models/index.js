const User = require('@models/user');
const Course = require('./course/Course');
const Lesson = require('./lesson/Lesson');
const Enrollment = require('./enrollment/Enrollment');
const Progress = require('./progress/Progress');

module.exports = {
  User,
  Course,
  Lesson,
  Enrollment,
  Progress
};