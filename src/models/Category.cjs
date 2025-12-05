const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#22D3EE'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metaTitle: {
    type: String,
    default: ''
  },
  metaDescription: {
    type: String,
    default: ''
  },
  articleCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

categorySchema.statics.updateArticleCount = async function(categoryName) {
  const Article = require('./Article.cjs');
  const count = await Article.countDocuments({ 
    category: categoryName, 
    status: 'published' 
  });
  await this.findOneAndUpdate(
    { name: categoryName },
    { articleCount: count }
  );
};

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
