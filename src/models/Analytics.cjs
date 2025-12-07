const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  articlesToday: {
    type: Number,
    default: 0
  },
  totalReads: {
    type: Number,
    default: 0
  },
  aiCreditsUsed: {
    type: Number,
    default: 0
  },
  pendingReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

analyticsSchema.statics.getOrCreateToday = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let analytics = await this.findOne({ date: today });
  
  if (!analytics) {
    analytics = new this({ date: today });
    await analytics.save();
  }
  
  return analytics;
};

analyticsSchema.statics.incrementField = async function(field, amount = 1) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.findOneAndUpdate(
    { date: today },
    { 
      $inc: { [field]: amount },
      $setOnInsert: { date: today }
    },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
