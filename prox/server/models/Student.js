const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  certificates: [{
    type: String,
    enum: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express']
  }],
  warnings: [{
    type: String,
    enum: ['1', '2', '3']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Progress hisoblash uchun virtual field
studentSchema.virtual('calculatedProgress').get(function() {
  if (!this.joinDate) return 0;

  const joinDate = new Date(this.joinDate);
  const now = new Date();
  const diffTime = Math.abs(now - joinDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 30 kun ichida 100% progress
  const totalDays = 30;
  return Math.min((diffDays / totalDays) * 100, 100);
});

// Progress saqlash uchun pre-save hook
studentSchema.pre('save', function(next) {
  if (this.isModified('joinDate')) {
    this.progress = this.calculatedProgress;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
