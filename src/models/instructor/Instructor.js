const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  bio: {
    type: String,
    maxLength: [1000, 'Bio cannot exceed 1000 characters'],
    default: ''
  },
  
  title: {
    type: String,
    maxLength: [150, 'Title cannot exceed 150 characters'],
    default: ''
  },
  
  socials: {
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  
  expertise: [{
    type: String,
    trim: true
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  coursesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  studentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
}, {
  timestamps: true
});

// Indexes
InstructorSchema.index({ isActive: 1 });
InstructorSchema.index({ createdAt: -1 });

// Virtual for courses
InstructorSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'instructor'
});

InstructorSchema.set('toJSON', { virtuals: true });
InstructorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Instructor', InstructorSchema);