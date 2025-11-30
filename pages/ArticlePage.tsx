
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Article, Category } from '../types';
import ReadingProgressBar from '../components/ReadingProgressBar';
import ArticleCard from '../components/ArticleCard';
import { summarizeText, translateText, suggestTags, analyzeReadability, improveReadability } from '../services/geminiService';
import { expandArticleWithSEO, getExpandedArticleFromDB, saveExpandedArticleToDB } from '../services/articleExpansionService';
import { fetchPixabayImage } from '../services/pixabayService';
import { 
  generateSEOTitle, 
  generateMetaDescription, 
  generateKeywords, 
  buildArticleSchema, 
  buildBreadcrumbSchema 
} from '../utils/seoEngine';
import SummarizeIcon from '../components/icons/SummarizeIcon';
import TranslateIcon from '../components/icons/TranslateIcon';
import SpeakerIcon from '../components/icons/SpeakerIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import SunIcon from '../components/icons/SunIcon';
import MoonIcon from '../components/icons/MoonIcon';
import TagIcon from '../components/icons/TagIcon';
import ReadabilityIcon from '../components/icons/ReadabilityIcon';
import ClipboardIcon from '../components/icons/ClipboardIcon';
import ShareIcon from '../components/icons/ShareIcon';
import EmailIcon from '../components/icons/EmailIcon';
import TwitterIcon from '../components/icons/TwitterIcon';
import LinkedInIcon from '../components/icons/LinkedInIcon';
import BookmarkIcon from '../components/icons/BookmarkIcon';
import { getCategoryStyle } from '../utils/categoryStyles';
import { useToast } from '../hooks/useToast';
import { useArticles } from '../hooks/useArticles';
import { ArticlePageSkeleton } from '../components/SkeletonLoader';
import AiFeatureBox from '../components/AiFeatureBox';
import CommentSection from '../components/CommentSection';
import { slugify } from '../utils/slugify';
import { getCategoryIcon } from '../utils/getCategoryIcon';
import Feedback from '../components/Feedback';
import SEO from '../components/SEO';

// Web Speech API is used for TTS - no external dependencies needed

interface FloatingAIToolbarProps {
  handlers: {
      handleSummarize: () => Promise<void>;
      handleTranslate: () => Promise<void>;
      handleReadAloud: () => Promise<void>;
      handleStopReading: () => void;
      handleAnalyzeReadability: () => Promise<void>;
      handleSuggestTags: () => Promise<void>;
      handleCopyLink: () => void;
      handleBookmark: () => void;
      setIsShareMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
      setArticleReadingMode: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
  };
  state: {
      article: Article;
      isSummarizing: boolean;
      showSummary: boolean;
      isTranslating: boolean;
      currentLanguage: 'English' | 'Hindi';
      isReading: boolean;
      isPaused: boolean;
      audioSource: AudioBufferSourceNode | null;
      isAnalyzingReadability: boolean;
      isImprovingReadability: boolean;
      improvedContent: string | null;
      readability: { score: number; interpretation: string } | null;
      isSuggestingTags: boolean;
      isShareMenuOpen: boolean;
      isBookmarked: boolean;
      articleReadingMode: 'dark' | 'light';
  };
}

const FloatingAIToolbar: React.FC<FloatingAIToolbarProps> = ({
  handlers, state
}) => {
    const shareMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        handlers.setIsShareMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shareMenuRef, handlers]);

  interface TooltipButtonProps {
    onClick: () => any;
    disabled: boolean;
    tooltip: string;
    children: React.ReactNode;
  }
  
  const TooltipButton: React.FC<TooltipButtonProps> = ({
    onClick,
    disabled,
    tooltip,
    children,
  }) => (
    <div className="relative group flex items-center">
      <button
        onClick={onClick}
        disabled={disabled}
        className="p-3 bg-gray-800/50 rounded-full hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {children}
      </button>
      <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
        {tooltip}
      </span>
    </div>
  );

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = state.article.title;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=Check out this article:%20${encodeURIComponent(shareUrl)}`;

  return (
    <div className="hidden lg:flex fixed top-1/2 -translate-y-1/2 left-4 xl:left-8 z-40">
        <div className="p-2 space-y-2 bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-full flex flex-col items-center shadow-2xl">
            {/* Content Tools */}
            <TooltipButton onClick={handlers.handleSummarize} disabled={state.isSummarizing} tooltip={state.showSummary ? "Hide Summary" : "Summarize Article"}>
                <SummarizeIcon className={`w-6 h-6 ${state.showSummary ? 'text-cyan-400' : 'text-gray-300'}`} />
            </TooltipButton>
             <TooltipButton onClick={handlers.handleTranslate} disabled={state.isTranslating} tooltip={`Translate to ${state.currentLanguage === 'English' ? 'Hindi' : 'English'}`}>
                <TranslateIcon className="w-6 h-6 text-gray-300" />
            </TooltipButton>
            <div className="relative group flex items-center">
              <button
                onClick={state.isReading ? (state.isPaused ? handlers.handleReadAloud : handlers.handleReadAloud) : handlers.handleReadAloud}
                className={`p-3 rounded-full transition-colors ${state.isReading ? 'bg-cyan-600 animate-pulse' : 'bg-gray-800/50 hover:bg-cyan-600'}`}
              >
                <SpeakerIcon className={`w-6 h-6 ${state.isReading ? 'text-white' : 'text-gray-300'}`} />
              </button>
              {state.isReading && (
                <button 
                  onClick={handlers.handleStopReading}
                  className="absolute -right-1 -top-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                  title="Stop"
                >
                  ×
                </button>
              )}
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                {state.isReading ? (state.isPaused ? 'Resume' : 'Pause') : 'Read Aloud'}
              </span>
            </div>
            
            <div className="w-8 h-px bg-gray-600 my-1"></div>

            {/* Analysis Tools */}
            <TooltipButton onClick={handlers.handleAnalyzeReadability} disabled={state.isImprovingReadability} tooltip={state.improvedContent ? 'Show Original' : (state.isImprovingReadability ? 'Improving...' : 'Improve Readability')}>
                <ReadabilityIcon className={`w-6 h-6 ${state.improvedContent ? 'text-cyan-400' : 'text-gray-300'}`} />
            </TooltipButton>
             <TooltipButton onClick={handlers.handleSuggestTags} disabled={state.isSuggestingTags} tooltip={state.isSuggestingTags ? 'Thinking...' : 'Suggest Tags'}>
                <TagIcon className="w-6 h-6 text-gray-300" />
            </TooltipButton>

            <div className="w-8 h-px bg-gray-600 my-1"></div>

            {/* Utility Tools */}
            <TooltipButton onClick={handlers.handleBookmark} disabled={false} tooltip={state.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}>
                <BookmarkIcon className="w-6 h-6 text-gray-300" filled={state.isBookmarked} />
            </TooltipButton>
            <div className="relative" ref={shareMenuRef}>
                 <TooltipButton onClick={() => handlers.setIsShareMenuOpen((p: boolean) => !p)} disabled={false} tooltip="Share Article">
                    <ShareIcon className="w-6 h-6 text-gray-300" />
                </TooltipButton>
                 {state.isShareMenuOpen && (
                  <div className="absolute left-full ml-4 bottom-0 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-white/10 overflow-hidden">
                    <ul className="text-gray-200 text-sm">
                      <li><a href={emailUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-3 hover:bg-gray-700 transition-colors"><EmailIcon className="w-4 h-4 mr-3" /> Email</a></li>
                      <li><a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-3 hover:bg-gray-700 transition-colors"><TwitterIcon className="w-4 h-4 mr-3" /> Twitter</a></li>
                      <li><a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-3 hover:bg-gray-700 transition-colors"><LinkedInIcon className="w-4 h-4 mr-3" /> LinkedIn</a></li>
                      <li><button onClick={handlers.handleCopyLink} className="w-full text-left flex items-center px-4 py-3 hover:bg-gray-700 transition-colors"><ClipboardIcon className="w-4 h-4 mr-3" /> Copy Link</button></li>
                    </ul>
                  </div>
                )}
            </div>
             <TooltipButton onClick={() => handlers.setArticleReadingMode((p: 'dark' | 'light') => p === 'dark' ? 'light' : 'dark')} disabled={false} tooltip={state.articleReadingMode === 'dark' ? 'Light Mode' : 'Night Mode'}>
                {state.articleReadingMode === 'dark' ? <SunIcon className="w-6 h-6 text-gray-300" /> : <MoonIcon className="w-6 h-6 text-gray-300" />}
            </TooltipButton>
        </div>
    </div>
  );
};

const MobileToolButton: React.FC<{ onClick: () => void | Promise<void>, disabled: boolean, children: React.ReactNode }> = ({ onClick, disabled, children }) => (
  <button
    onClick={() => { onClick(); }}
    disabled={disabled}
    className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800/50 rounded-lg text-center text-gray-200 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);


const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { articles, loading } = useArticles();
  const { showToast } = useToast();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // Expansion State
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'English' | 'Hindi'>('English');

  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioSource] = useState<AudioBufferSourceNode | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const [isImprovingReadability, setIsImprovingReadability] = useState(false);
  const [improvedContent, setImprovedContent] = useState<string | null>(null);

  const [articleReadingMode, setArticleReadingMode] = useState<'dark' | 'light'>('dark');

  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);

  const [readability, setReadability] = useState<{ score: number; interpretation: string } | null>(null);
  const [isAnalyzingReadability, setIsAnalyzingReadability] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [vote, setVote] = useState<'upvote' | 'downvote' | null>(null);
  
  const articleContentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (loading || articles.length === 0) return;

    const foundArticle = articles.find((a) => a.slug === slug);
    if (foundArticle) {
      setArticle(foundArticle);
      setImageUrl(foundArticle.imageUrl);

      // Reset all state on article change
      setSummary('');
      setShowSummary(false);
      setTranslatedContent('');
      setCurrentLanguage('English');
      setArticleReadingMode('dark');
      setSuggestedTags([]);
      setReadability(null);
      setIsShareMenuOpen(false);
      setImprovedContent(null);
      setIsPaused(false);
      
      // Stop any playing audio (Web Speech API)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsReading(false);
      
      setExpandedContent(null);
      setIsExpanding(false);

      // --- Load Expanded Content from DB or Auto-Expand ---
      const loadExpandedContent = async () => {
        try {
          const dbContent = await getExpandedArticleFromDB(foundArticle.slug);
          if (dbContent) {
            console.log(`[ArticlePage] Loaded expanded content from DB for: ${foundArticle.slug}`);
            setExpandedContent(dbContent);
          } else {
            triggerAutoExpansion(foundArticle);
          }
        } catch (error) {
          console.error('[ArticlePage] Failed to load from DB, triggering expansion:', error);
          triggerAutoExpansion(foundArticle);
        }
      };
      loadExpandedContent();

      // --- Reading History ---
      const HISTORY_KEY = 'ftj_view_history';
      const MAX_HISTORY_SIZE = 20;
      try {
        const savedHistoryJSON = localStorage.getItem(HISTORY_KEY);
        let history: string[] = savedHistoryJSON ? JSON.parse(savedHistoryJSON) : [];
        history = history.filter(s => s !== foundArticle.slug);
        history.unshift(foundArticle.slug);
        if (history.length > MAX_HISTORY_SIZE) {
          history = history.slice(0, MAX_HISTORY_SIZE);
        }
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch (e) { console.error("Failed to update viewing history", e); }

      // --- Related Articles ---
      const related = articles.filter(a => a.category === foundArticle.category && a.slug !== foundArticle.slug).slice(0, 3);
      setRelatedArticles(related);
      
      // --- Bookmark Status ---
      const savedSlugsJSON = localStorage.getItem('bookmarked_articles');
      if (savedSlugsJSON) {
        const savedSlugs: string[] = JSON.parse(savedSlugsJSON);
        setIsBookmarked(savedSlugs.includes(foundArticle.slug));
      } else {
        setIsBookmarked(false);
      }

      // --- Feedback Status ---
      const FEEDBACK_STORAGE_KEY = 'article_feedback';
      try {
        const feedbackData = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '{}');
        setVote(feedbackData[foundArticle.slug] || null);
      } catch (e) {
        setVote(null);
      }

    } else {
        setArticle(null);
    }
  }, [slug, articles, loading, audioSource]);

  // Fetch Pixabay image for article page
  useEffect(() => {
    if (!article) return;
    
    const loadArticleImage = async () => {
      console.log(`[ArticlePage] Loading Pixabay image for: "${article.title}"`);
      setIsImageLoading(true);
      try {
        const pixabayUrl = await fetchPixabayImage(
          article.title,
          article.category,
          article.imageUrl
        );
        console.log(`[ArticlePage] Pixabay service returned: ${pixabayUrl}`);
        setImageUrl(pixabayUrl);
      } catch (error) {
        console.error('[ArticlePage] Failed to load Pixabay image:', error);
        // Keep original URL on error
      } finally {
        setIsImageLoading(false);
      }
    };

    loadArticleImage();
  }, [article]);

  const triggerAutoExpansion = async (articleToExpand: Article) => {
    setIsExpanding(true);
    console.log(`[ArticlePage] Starting AI expansion for: ${articleToExpand.title}`);
    
    try {
      const result = await expandArticleWithSEO(
        articleToExpand.title,
        articleToExpand.content,
        articleToExpand.category
      );
      
      if (result.success && result.expandedContent) {
        console.log(`[ArticlePage] AI expansion complete: ${result.wordCount} words, readability: ${result.readabilityScore}`);
        setExpandedContent(result.expandedContent);
        
        await saveExpandedArticleToDB(
          articleToExpand.slug,
          articleToExpand.title,
          articleToExpand.content,
          result.expandedContent,
          articleToExpand.category,
          result.wordCount,
          result.readabilityScore
        );
        console.log(`[ArticlePage] Saved expanded article to DB: ${articleToExpand.slug}`);
      } else {
        console.error('[ArticlePage] AI expansion failed:', result.error);
        setExpandedContent(null);
      }
    } catch (error) {
      console.error("[ArticlePage] Failed to expand article:", error);
      setExpandedContent(null); 
    } finally {
      setIsExpanding(false);
    }
  };

  const contentForProcessing = (expandedContent && expandedContent.length > 0) ? expandedContent : (article?.content || '');

  const handleSummarize = async () => {
    if (!article) return;
    
    // If already showing summary, hide it
    if (showSummary && summary) {
      setShowSummary(false);
      return;
    }
    
    setIsSummarizing(true);
    setSummary('');
    setShowSummary(false);
    
    try {
      const result = await summarizeText(contentForProcessing);
      setSummary(result);
      setShowSummary(true);
    } catch (error) {
      console.error("Summarize failed:", error);
      setSummary("Could not generate summary. Please try again.");
      setShowSummary(true);
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleTranslate = async () => {
    if (!article) return;
    setIsTranslating(true);
    const targetLang = currentLanguage === 'English' ? 'Hindi' : 'English';
    const contentToTranslate = translatedContent || contentForProcessing;
    const result = await translateText(contentToTranslate, targetLang);
    setTranslatedContent(result);
    setCurrentLanguage(targetLang);
    setIsTranslating(false);
  };
  
  const handleReadAloud = async () => {
    if (!article) return;
    
    // SSR safety check
    if (typeof window === 'undefined') return;
    
    const synth = window.speechSynthesis;
    
    // If currently reading, handle pause/resume/stop
    if (isReading) {
      if (isPaused) {
        // Resume
        synth.resume();
        setIsPaused(false);
      } else {
        // Pause
        synth.pause();
        setIsPaused(true);
      }
      return;
    }
    
    // Stop any previous speech
    synth.cancel();
    
    // Get clean text to read (strip HTML, limit length for better performance)
    const textToRead = contentForProcessing
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000);
    
    if (!textToRead) {
      console.error("No text to read");
      return;
    }
    
    // Use Web Speech API (works on all browsers, mobile and desktop)
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to get a good English voice
    const voices = synth.getVoices();
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      speechSynthRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsReading(false);
      setIsPaused(false);
    };
    
    speechSynthRef.current = utterance;
    setIsReading(true);
    synth.speak(utterance);
  };

  const handleStopReading = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
    setIsPaused(false);
    speechSynthRef.current = null;
  };

  const handleSuggestTags = async () => {
    if (!article) return;
    setIsSuggestingTags(true);
    setSuggestedTags([]);
    try {
        const resultJson = await suggestTags(article.title, contentForProcessing, article.tags);
        const result = JSON.parse(resultJson);
        if (result.tags) {
            setSuggestedTags(result.tags);
        }
    } catch (error) {
        console.error("Failed to parse suggested tags:", error);
    } finally {
        setIsSuggestingTags(false);
    }
  };

  const handleAnalyzeReadability = async () => {
    if (!article) return;
    
    // If already improved, toggle back to original
    if (improvedContent) {
      setImprovedContent(null);
      return;
    }
    
    setIsImprovingReadability(true);
    setIsAnalyzingReadability(true);
    
    try {
      const improved = await improveReadability(contentForProcessing);
      setImprovedContent(improved);
      
      // Also analyze the readability score
      const resultJson = await analyzeReadability(improved);
      const result = JSON.parse(resultJson);
      if (result.score && result.interpretation) {
        setReadability(result);
      }
    } catch (error) {
      console.error("Failed to improve readability:", error);
      setReadability({ score: 0, interpretation: 'Improvement failed.' });
    } finally {
      setIsAnalyzingReadability(false);
      setIsImprovingReadability(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Link copied to clipboard!');
    });
  };

  const handleBookmark = () => {
    if (!article) return;
    const savedSlugsJSON = localStorage.getItem('bookmarked_articles');
    let savedSlugs: string[] = savedSlugsJSON ? JSON.parse(savedSlugsJSON) : [];
    if (isBookmarked) {
        savedSlugs = savedSlugs.filter(s => s !== article.slug);
        showToast('Bookmark removed');
    } else {
        savedSlugs.push(article.slug);
        showToast('Article bookmarked');
    }
    localStorage.setItem('bookmarked_articles', JSON.stringify(savedSlugs));
    setIsBookmarked(!isBookmarked);
  };

  const handleVote = (newVote: 'upvote' | 'downvote') => {
    if (!article) return;

    const FEEDBACK_STORAGE_KEY = 'article_feedback';
    const finalVote = newVote === vote ? null : newVote;
    setVote(finalVote);

    try {
        const feedbackData = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '{}');
        if (finalVote) {
            feedbackData[article.slug] = finalVote;
        } else {
            delete feedbackData[article.slug];
        }
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackData));
        showToast('Thank you for your feedback!');
    } catch (e) {
        console.error("Failed to save feedback", e);
        showToast('Could not save your feedback.');
    }
  };

  if (loading) return <ArticlePageSkeleton />;
  if (!article) return <div className="text-center py-20 text-xl">Article not found.</div>;

  const { text: catText } = getCategoryStyle(article.category as Category);

  const handlers = {
      handleSummarize, handleTranslate, handleReadAloud,
      handleStopReading,
      handleAnalyzeReadability, handleSuggestTags,
      handleCopyLink, handleBookmark,
      setIsShareMenuOpen, setArticleReadingMode
  };

  const state = {
      article, isSummarizing, showSummary, isTranslating, currentLanguage,
      isReading, isPaused, audioSource, isAnalyzingReadability,
      isImprovingReadability, improvedContent,
      readability, isSuggestingTags, isShareMenuOpen,
      isBookmarked, articleReadingMode
  };

  // SEO Generation using the new Engine
  const domain = "https://futuretechjournal50.netlify.app";
  const seoTitle = generateSEOTitle(article.title);
  const metaDescription = generateMetaDescription(article.summary);
  const keywords = generateKeywords(article.title, article.category, article.tags);
  const schema = [
    buildArticleSchema(article, domain),
    buildBreadcrumbSchema([
        { name: 'Home', url: domain },
        { name: article.category, url: `${domain}/category/${article.category.toLowerCase()}` },
        { name: article.title, url: `${domain}/article/${article.slug}` }
    ])
  ];

  return (
    <>
      <SEO 
        title={seoTitle}
        description={metaDescription}
        image={article.imageUrl}
        type="article"
        author={article.author}
        publishedTime={article.date}
        keywords={keywords}
        schema={schema}
      />
      <ReadingProgressBar targetRef={articleContentRef} />
      <FloatingAIToolbar handlers={handlers} state={state} />

      <article className="max-w-4xl mx-auto" ref={articleContentRef} itemScope itemType="http://schema.org/NewsArticle">
        <header className="mb-8">
           <Link to={`/category/${article.category.toLowerCase()}`} className={`inline-flex items-center text-sm font-bold uppercase tracking-widest ${catText}`}>
            {getCategoryIcon(article.category as Category, 'w-5 h-5 mr-2')}
            <span itemProp="articleSection">{article.category}</span>
          </Link>
          <h1 itemProp="headline" className="text-3xl sm:text-4xl md:text-5xl font-extrabold my-3 text-[#000000] dark:text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            {article.title}
          </h1>
          <meta itemProp="datePublished" content={article.date} />
          <meta itemProp="dateModified" content={article.date} />
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            <span itemProp="author" itemScope itemType="http://schema.org/Person">
                By <Link to={`/author/${slugify(article.author)}`} itemProp="url" className="hover:underline hover:text-cyan-400 transition-colors"><span itemProp="name">{article.author}</span></Link>
            </span>
            <span className="mx-2">&bull;</span>
            <span>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>


        <div className="my-6 border-y border-gray-200 dark:border-gray-700 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">Share:</span>
             <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="inline-flex items-center gap-2 text-sm text-gray-200 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1.5 rounded-full transition-colors">
              <TwitterIcon className="w-4 h-4" /> Twitter
            </a>
            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="inline-flex items-center gap-2 text-sm text-gray-200 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1.5 rounded-full transition-colors">
              <LinkedInIcon className="w-4 h-4" /> LinkedIn
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=Check out this article:%20${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} aria-label="Share via Email" className="inline-flex items-center gap-2 text-sm text-gray-200 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1.5 rounded-full transition-colors">
              <EmailIcon className="w-4 h-4" /> Email
            </a>
            <button onClick={handleCopyLink} aria-label="Copy link" className="inline-flex items-center gap-2 text-sm text-gray-200 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1.5 rounded-full transition-colors">
              <ClipboardIcon className="w-4 h-4" /> Copy Link
            </button>
          </div>
          <button onClick={handleBookmark} className="flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50">
            <BookmarkIcon className="w-5 h-5" filled={isBookmarked} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>

        <figure className="my-8">
          <img 
            src={imageUrl} 
            alt={article.title} 
            itemProp="image"
            loading="lazy"
            className={`w-full rounded-xl shadow-lg transition-opacity duration-300 ${isImageLoading ? 'opacity-50' : 'opacity-100'}`}
          />
          <figcaption className="text-center text-sm text-gray-500 mt-2 italic">{article.title}</figcaption>
        </figure>

        {isExpanding && (
            <div className="mb-4 flex items-center space-x-2 text-cyan-400 animate-pulse">
                <SparklesIcon className="w-5 h-5" />
                <span className="text-sm font-medium">AI is expanding this article live...</span>
            </div>
        )}

        {/* Summary Box with Fade Animation */}
        {showSummary && (
          <div className="mb-6 p-6 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl animate-fadeIn">
            <div className="flex items-center mb-4">
              <SummarizeIcon className="w-6 h-6 text-cyan-400 mr-2" />
              <h3 className="text-lg font-bold text-cyan-300">Quick Summary</h3>
              <button 
                onClick={() => setShowSummary(false)}
                className="ml-auto text-gray-400 hover:text-white p-1"
              >
                ×
              </button>
            </div>
            {isSummarizing ? (
              <div className="flex items-center space-x-2 text-gray-300">
                <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                <span>Generating summary...</span>
              </div>
            ) : (
              <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            )}
          </div>
        )}

        {/* TTS Waveform Animation */}
        {isReading && (
          <div className="mb-4 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse"
                    style={{ 
                      height: `${12 + Math.random() * 16}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.5s'
                    }}
                  />
                ))}
              </div>
              <span className="text-cyan-300 text-sm font-medium">
                {isPaused ? 'Paused' : 'Reading aloud...'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleReadAloud}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-full transition-colors"
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button 
                onClick={handleStopReading}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-full transition-colors"
              >
                ⏹ Stop
              </button>
            </div>
          </div>
        )}

        {/* Improved Readability Notice */}
        {improvedContent && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ReadabilityIcon className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm">
                Showing simplified version (Grade 6-8 reading level)
                {readability && ` • Score: ${readability.score.toFixed(0)}`}
              </span>
            </div>
            <button 
              onClick={() => setImprovedContent(null)}
              className="text-gray-400 hover:text-white px-2 py-1 text-sm"
            >
              Show Original
            </button>
          </div>
        )}

        {isImprovingReadability && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span className="text-blue-300 text-sm">Improving readability...</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div
              itemProp="articleBody"
              className={`prose prose-lg dark:prose-invert max-w-none ${isExpanding || isImprovingReadability ? 'typing-cursor' : ''}`}
              dangerouslySetInnerHTML={{ __html: translatedContent || improvedContent || expandedContent || article.content }}
            />
          </div>
        </div>

        {suggestedTags.length > 0 && (
          <AiFeatureBox
            title="AI Tag Suggestions"
            icon={<TagIcon className="w-6 h-6 text-cyan-400" />}
          >
            <p className="text-sm text-gray-400 mb-4">Here are some tags suggested by AI. Click to copy.</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigator.clipboard.writeText(tag);
                    showToast(`Tag "${tag}" copied!`);
                  }}
                  className="bg-gray-700 text-cyan-200 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-cyan-800 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </AiFeatureBox>
        )}


        {/* --- MOBILE/TABLET AI TOOLBAR --- */}
        <div className="lg:hidden mt-12 border-t border-gray-700 pt-8">
          <h3 className="text-2xl font-bold mb-4 text-white flex items-center">
            <SparklesIcon className="w-6 h-6 mr-3 text-cyan-400" />
            AI Toolkit
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MobileToolButton onClick={handleSummarize} disabled={isSummarizing}>
              <SummarizeIcon className={`w-7 h-7 ${showSummary ? 'text-cyan-400' : ''}`} />
              <span className="text-xs font-semibold">{isSummarizing ? 'Working...' : (showSummary ? 'Hide Summary' : 'Summarize')}</span>
            </MobileToolButton>
            <MobileToolButton onClick={handleTranslate} disabled={isTranslating}>
              <TranslateIcon className="w-7 h-7" />
              <span className="text-xs font-semibold">{isTranslating ? 'Translating...' : `To ${currentLanguage === 'English' ? 'Hindi' : 'English'}`}</span>
            </MobileToolButton>
            <button
              onClick={isReading ? (isPaused ? handleReadAloud : handleReadAloud) : handleReadAloud}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg text-center transition-colors ${isReading ? 'bg-cyan-600 animate-pulse' : 'bg-gray-800/50 hover:bg-gray-700/50'} text-gray-200`}
            >
              <SpeakerIcon className="w-7 h-7" />
              <span className="text-xs font-semibold">
                {isReading ? (isPaused ? 'Resume' : 'Pause') : 'Read Aloud'}
              </span>
            </button>
            {isReading && (
              <button
                onClick={handleStopReading}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 rounded-lg text-center text-white transition-colors"
              >
                <span className="text-xl">⏹</span>
                <span className="text-xs font-semibold">Stop</span>
              </button>
            )}
            <MobileToolButton onClick={handleAnalyzeReadability} disabled={isImprovingReadability}>
              <ReadabilityIcon className={`w-7 h-7 ${improvedContent ? 'text-cyan-400' : ''}`} />
              <span className="text-xs font-semibold">
                {isImprovingReadability ? 'Improving...' : (improvedContent ? 'Original' : 'Simplify')}
              </span>
            </MobileToolButton>
          </div>
        </div>
         
        {relatedArticles.length > 0 && (
          <section className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-3xl font-bold mb-6 text-[#000000] dark:text-white">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((relArt) => (
                <ArticleCard key={relArt.slug} article={relArt} />
              ))}
            </div>
          </section>
        )}

        <Feedback 
            articleSlug={article.slug}
            currentVote={vote}
            onVote={handleVote}
        />

        <section className="mt-8">
            <CommentSection articleSlug={article.slug} />
        </section>
      </article>
    </>
  );
};

export default ArticlePage;
