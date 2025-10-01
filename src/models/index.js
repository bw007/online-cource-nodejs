const User = require('@models/user');
const Course = require('./course/Course');
const Lesson = require('./lesson/Lesson');
const Enrollment = require('./enrollment/Enrollment');
const Progress = require('./progress/Progress');
const Section = require('./section/Section');

module.exports = {
  User,
  Course,
  Lesson,
  Section,
  Enrollment,
  Progress
};