const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  modelName: {
    type: String,
    default: 'gemini-2.0-flash'
  },
  action: {
    type: String,
    enum: ['summary', 'rewrite', 'expand', 'seo', 'faq', 'chat', 'image', 'video', 'other'],
    default: 'other'
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

aiUsageSchema.index({ date: 1, action: 1 });
aiUsageSchema.index({ createdAt: -1 });

aiUsageSchema.statics.logUsage = async function(data) {
  const usage = new this({
    date: new Date(),
    tokensUsed: data.tokensUsed || 0,
    modelName: data.modelName || 'gemini-2.0-flash',
    action: data.action || 'other',
    articleSlug: data.articleSlug || '',
    success: data.success !== false
  });
  return usage.save();
};

aiUsageSchema.statics.getUsageByDateRange = async function(startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalTokens: { $sum: '$tokensUsed' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

aiUsageSchema.statics.getLast7DaysUsage = async function() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  
  return this.getUsageByDateRange(startDate, endDate);
};

module.exports = mongoose.models.AIUsage || mongoose.model('AIUsage', aiUsageSchema);
