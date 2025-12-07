const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  type: {
    type: String,
    enum: ['article_gen', 'seo_update', 'login', 'ai_gen', 'image_gen', 'video_gen', 'faq_gen', 'expand', 'system', 'error'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  userId: {
    type: String,
    default: ''
  },
  articleSlug: {
    type: String,
    default: ''
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

logSchema.index({ timestamp: -1 });
logSchema.index({ type: 1, timestamp: -1 });

logSchema.statics.createLog = async function(data) {
  const log = new this({
    timestamp: new Date(),
    type: data.type,
    message: data.message,
    metadata: data.metadata || {},
    userId: data.userId || '',
    articleSlug: data.articleSlug || '',
    success: data.success !== false
  });
  return log.save();
};

logSchema.statics.getRecentLogs = async function(limit = 20) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

logSchema.statics.getLogsByType = async function(type, limit = 20) {
  return this.find({ type })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.models.Log || mongoose.model('Log', logSchema);
