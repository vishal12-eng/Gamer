
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { Article } from '../types';
import { CATEGORIES } from '../constants';
import { useToast } from '../hooks/useToast';
import { rewriteArticle, generateImage } from '../services/geminiService';
import { rewriteArticleForSEO } from '../services/aiRewrite';
import SparklesIcon from '../components/icons/SparklesIcon';
import CloseIcon from '../components/icons/CloseIcon';

// Simple helper to convert file to base64 for preview/saving
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const AdminArticleEditorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { articles, updateArticle, loading } = useArticles();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Article>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'seo'>('edit');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const [faqs, setFaqs] = useState<Array<{question: string; answer: string}>>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [showAddFaqForm, setShowAddFaqForm] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    if (articles.length > 0 && slug) {
      const found = articles.find(a => a.slug === slug);
      if (found) {
        setFormData(found);
      } else {
        showToast("Article not found");
        navigate('/admin/articles');
      }
    }
  }, [articles, slug, navigate]);

  // Auto-save draft to local storage
  useEffect(() => {
    if (isDirty && formData.slug) {
      const timer = setTimeout(() => {
        localStorage.setItem(`draft_${formData.slug}`, JSON.stringify(formData));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, isDirty]);

  // Sync FAQs from formData
  useEffect(() => {
    if (formData.faq && Array.isArray(formData.faq)) {
      setFaqs(formData.faq);
    } else {
      setFaqs([]);
    }
  }, [formData.faq]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(t => t.trim());
    setFormData(prev => ({ ...prev, tags }));
    setIsDirty(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
        setIsDirty(true);
        showToast("Image updated successfully");
      } catch (err) {
        console.error("Image upload failed", err);
        showToast("Failed to upload image");
      }
    }
  };

  const handleSave = () => {
    if (slug && formData) {
      updateArticle(slug, formData);
      localStorage.removeItem(`draft_${slug}`);
      setIsDirty(false);
      showToast("Article saved and published successfully!");
    }
  };

  // --- AI ACTIONS ---

  const handleAiRewrite = async () => {
    if (!formData.content) return;
    setAiLoading('rewrite');
    try {
      // Using the existing rewrite service. It returns a JSON string.
      const resultJson = await rewriteArticle(formData.content, 'professional');
      const result = JSON.parse(resultJson);
      
      if (result.newContent) {
        setFormData(prev => ({
          ...prev,
          title: result.newTitle || prev.title,
          summary: result.newSummary || prev.summary,
          content: result.newContent,
          tags: result.newTags || prev.tags
        }));
        setIsDirty(true);
        showToast("Article rewritten by AI. Review changes.");
      }
    } catch (e) {
      console.error(e);
      showToast("AI Rewrite failed.");
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiSeo = async () => {
    if (!formData.content || !formData.title) return;
    setAiLoading('seo');
    try {
      // Mocking the input structure expected by the service
      const result = await rewriteArticleForSEO({
        title: formData.title,
        sourceText: formData.content,
        category: formData.category || 'Technology'
      });

      if (result) {
        setFormData(prev => ({
          ...prev,
          seoTitle: result.seoTitle,
          seoDescription: result.seoDescription,
          // We don't overwrite the main content here, just metadata unless user wants full rewrite
        }));
        setIsDirty(true);
        showToast("SEO Metadata generated.");
        setActiveTab('seo'); // Switch to SEO tab to show results
      }
    } catch (e) {
      console.error(e);
      showToast("SEO Generation failed.");
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiThumbnail = async () => {
    if (!formData.title) return;
    setAiLoading('image');
    try {
      const prompt = `High quality, futuristic, photorealistic editorial image for news article titled: "${formData.title}". Category: ${formData.category}. No text in image.`;
      const base64Data = await generateImage(prompt, "16:9", "1K");
      if (base64Data) {
        setFormData(prev => ({ ...prev, imageUrl: `data:image/jpeg;base64,${base64Data}` }));
        setIsDirty(true);
        showToast("New thumbnail generated!");
      }
    } catch (e) {
      console.error(e);
      showToast("Image generation failed.");
    } finally {
      setAiLoading(null);
    }
  };

  const handleRefreshFaqs = async () => {
    if (!formData.slug) return;
    setFaqLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/articles/${formData.slug}/faqs/refresh`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh FAQs');
      }
      
      const data = await response.json();
      const newFaqs = data.faq || data.faqs || [];
      setFaqs(newFaqs);
      setFormData(prev => ({ ...prev, faq: newFaqs }));
      setIsDirty(true);
      showToast(`FAQs refreshed! ${newFaqs.length} FAQs generated.`);
    } catch (e) {
      console.error(e);
      showToast("Failed to refresh FAQs. Please try again.");
    } finally {
      setFaqLoading(false);
    }
  };

  const handleDeleteFaq = (index: number) => {
    const updatedFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(updatedFaqs);
    setFormData(prev => ({ ...prev, faq: updatedFaqs }));
    setIsDirty(true);
    showToast("FAQ deleted. Save to apply changes.");
  };

  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      showToast("Please fill in both question and answer.");
      return;
    }
    const updatedFaqs = [...faqs, { question: newFaq.question.trim(), answer: newFaq.answer.trim() }];
    setFaqs(updatedFaqs);
    setFormData(prev => ({ ...prev, faq: updatedFaqs }));
    setNewFaq({ question: '', answer: '' });
    setShowAddFaqForm(false);
    setIsDirty(true);
    showToast("FAQ added. Save to apply changes.");
  };

  if (loading && !formData.title) return <div className="text-white text-center mt-20">Loading Editor...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 sticky top-20 z-30 bg-gray-900/90 backdrop-blur py-4 px-6 rounded-xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/articles')} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white truncate max-w-md">{formData.title}</h1>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
              <span className="text-gray-400">{isDirty ? 'Unsaved Changes' : 'All changes saved'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button 
            onClick={handleSave}
            disabled={!isDirty}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-2 px-6 rounded-md hover:shadow-cyan-glow disabled:opacity-50 disabled:shadow-none transition-all"
          >
            Save & Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN EDITOR COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-4">
            <button onClick={() => setActiveTab('edit')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'edit' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Editor</button>
            <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Live Preview</button>
            <button onClick={() => setActiveTab('seo')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'seo' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>SEO & Meta</button>
          </div>

          {activeTab === 'edit' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Article Title</label>
                <input 
                  type="text" name="title" value={formData.title || ''} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-lg font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Summary / Excerpt</label>
                <textarea 
                  name="summary" rows={3} value={formData.summary || ''} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select name="category" value={formData.category || 'Technology'} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select name="status" value={formData.status || 'published'} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
                  <span>Body Content (HTML Supported)</span>
                  <span className="text-xs text-gray-500">Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt; tags for formatting</span>
                </label>
                <textarea 
                  name="content" rows={20} value={formData.content || ''} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 text-gray-300 font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-inner border border-gray-700 prose prose-lg dark:prose-invert max-w-none animate-fade-in">
              <h1>{formData.title}</h1>
              <img src={formData.imageUrl} alt="" loading="lazy" className="w-full rounded-lg my-4" />
              <div dangerouslySetInnerHTML={{ __html: formData.content || '' }} />
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Search Engine Optimization</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title (Meta Title)</label>
                  <input 
                    type="text" name="seoTitle" value={formData.seoTitle || formData.title || ''} onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended length: 50-60 characters.</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
                  <textarea 
                    name="seoDescription" rows={3} value={formData.seoDescription || formData.summary || ''} onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended length: 150-160 characters.</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
                  <input 
                    type="text" name="slug" value={formData.slug || ''} onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-400 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (Comma separated)</label>
                  <input 
                    type="text" value={formData.tags?.join(', ') || ''} onChange={handleTagsChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR TOOLS */}
        <div className="space-y-6">
          
          {/* Image Card */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Hero Image</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative group mb-3">
              <img src={formData.imageUrl} alt="Hero" loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-white">Current Image</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold py-2 px-4 rounded text-center cursor-pointer transition-colors">
                Upload Custom Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <button 
                onClick={handleAiThumbnail}
                disabled={aiLoading === 'image'}
                className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-bold py-2 px-4 rounded transition-all flex items-center justify-center"
              >
                {aiLoading === 'image' ? <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4 mr-1" />}
                Generate AI Thumbnail
              </button>
            </div>
          </div>

          {/* AI Assistants Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl border border-cyan-500/30">
            <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider flex items-center">
              <SparklesIcon className="w-4 h-4 mr-2" />
              AI Assistants
            </h3>
            <p className="text-xs text-gray-400 mb-4">Use AI to enhance this article. Actions are manual—save to apply.</p>
            
            <div className="space-y-3">
              <button 
                onClick={handleAiRewrite}
                disabled={aiLoading === 'rewrite'}
                className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white group-hover:text-cyan-300">Rewrite Article</span>
                  {aiLoading === 'rewrite' && <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                <span className="text-xs text-gray-500">Re-phrases body content professionally.</span>
              </button>

              <button 
                onClick={handleAiSeo}
                disabled={aiLoading === 'seo'}
                className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white group-hover:text-green-300">Optimize SEO</span>
                  {aiLoading === 'seo' && <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                <span className="text-xs text-gray-500">Generates meta titles, descriptions & tags.</span>
              </button>
            </div>
          </div>

          {/* FAQ Manager Card */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              FAQ Manager
              <span className="ml-auto text-xs text-gray-500 font-normal">{faqs.length} FAQs</span>
            </h3>
            
            <div className="space-y-3">
              {faqs.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">No FAQs yet. Use AI to generate or add manually.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                      <button
                        onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                        className="w-full text-left px-3 py-2 flex items-start justify-between gap-2 hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="text-xs font-medium text-white line-clamp-2">{faq.question}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${expandedFaqIndex === index ? 'rotate-180' : ''}`} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {expandedFaqIndex === index && (
                        <div className="px-3 py-2 border-t border-gray-700 bg-gray-900/50">
                          <p className="text-xs text-gray-400 mb-2">{faq.answer}</p>
                          <button
                            onClick={() => handleDeleteFaq(index)}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete FAQ
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-700">
                <button 
                  onClick={handleRefreshFaqs}
                  disabled={faqLoading}
                  className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-bold py-2 px-4 rounded transition-all flex items-center justify-center gap-2"
                >
                  {faqLoading ? (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <SparklesIcon className="w-4 h-4" />
                  )}
                  Refresh with AI
                </button>
                
                <button 
                  onClick={() => setShowAddFaqForm(!showAddFaqForm)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 text-xs font-bold py-2 px-4 rounded transition-all flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Manual FAQ
                </button>
                
                {showAddFaqForm && (
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-2">
                    <input
                      type="text"
                      placeholder="Question"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <textarea
                      placeholder="Answer"
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddFaq}
                        className="flex-1 bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30 text-xs font-bold py-1.5 px-3 rounded transition-all"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setShowAddFaqForm(false); setNewFaq({ question: '', answer: '' }); }}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold py-1.5 px-3 rounded transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Metadata</h3>
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>Author:</span>
                <span className="text-white">{formData.author}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-white">{new Date(formData.date || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Word Count:</span>
                <span className="text-white">{formData.content?.split(' ').length || 0}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminArticleEditorPage;
