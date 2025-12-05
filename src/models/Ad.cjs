const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  smartlinkUrl: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  placement: {
    type: String,
    required: true,
    enum: [
      'home_top',
      'home_middle', 
      'home_after_card_3',
      'article_top',
      'article_middle',
      'article_bottom',
      'category_top',
      'category_sidebar',
      'footer',
      'mobile_sticky'
    ],
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  priority: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

adSchema.index({ placement: 1, status: 1 });

adSchema.statics.getActiveAdsByPlacement = function(placement) {
  const now = new Date();
  return this.find({
    placement: placement,
    status: 'active',
    $or: [
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $gte: now } }
    ]
  }).sort({ priority: -1, createdAt: -1 }).lean();
};

adSchema.methods.recordImpression = function() {
  this.impressions += 1;
  return this.save();
};

adSchema.methods.recordClick = function() {
  this.clicks += 1;
  return this.save();
};

module.exports = mongoose.models.Ad || mongoose.model('Ad', adSchema);
