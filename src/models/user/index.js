const mongoose = require('mongoose');
const UserSchema = require('./User');
const methods = require('./userMethods');
const statics = require('./userStatics');
const applyHooks = require('./userHooks');
    
// Instance methods
Object.assign(UserSchema.methods, methods);

// Static methods
Object.assign(UserSchema.statics, statics);

// Apply hooks
applyHooks(UserSchema);

// Model export
module.exports = mongoose.model('User', UserSchema);