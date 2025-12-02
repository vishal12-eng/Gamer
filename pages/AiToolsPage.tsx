
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { analyzeImage, generateImage, groundedSearch, rewriteArticle, generateBlogPost, animateImage } from '../services/geminiService';
import SparklesIcon from '../components/icons/SparklesIcon';
import { GroundingChunk } from '../types';
import DownloadIcon from '../components/icons/DownloadIcon';
import CloseIcon from '../components/icons/CloseIcon';
import { useArticles } from '../hooks/useArticles';
import { mockArticles } from './data/mockData';

type Tab = 'generate' | 'animate' | 'edit' | 'analyze' | 'search' | 'rewrite' | 'blog';

const AiToolsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'generate');

  const setTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">AI Power Tools</h1>
        <p className="mt-4 text-lg text-gray-400">Explore the cutting-edge capabilities of Gemini.</p>
      </div>

      <div className="mb-8 border-b border-gray-700 flex justify-center overflow-x-auto">
        <nav className="flex flex-nowrap justify-center space-x-2 md:space-x-8 -mb-px">
          {['generate', 'animate', 'edit', 'analyze', 'search', 'rewrite', 'blog'].map((tab) => (
            <button
              key={tab}
              onClick={() => setTab(tab as Tab)}
              className={`py-4 px-3 md:px-4 inline-flex items-center text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-400 shadow-[0_2px_10px_-3px_rgba(6,182,212,0.7)]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'generate' && <ImageGenerator />}
        {activeTab === 'animate' && <ImageAnimator />}
        {activeTab === 'edit' && <ImageEditor />}
        {activeTab === 'analyze' && <ImageAnalyzer />}
        {activeTab === 'search' && <GroundedSearch />}
        {activeTab === 'rewrite' && <ArticleRewriter />}
        {activeTab === 'blog' && <BlogPostGenerator />}
      </div>
    </div>
  );
};


// --- Individual Tool Components ---

const ToolWrapper: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="p-[1px] bg-gradient-to-br from-cyan-500/50 via-transparent to-purple-500/50 rounded-2xl">
      <div className="p-4 sm:p-6 md:p-8 bg-gray-900/80 backdrop-blur-sm rounded-[15px]">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 mb-6">{description}</p>
        <div className="border-t border-white/10 pt-6">
          {children}
        </div>
      </div>
    </div>
);

const ActionButton: React.FC<{
    type?: 'submit' | 'button';
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
}> = ({ type = 'submit', disabled, onClick, children, className = '' }) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 hover:shadow-hero-glow disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center ${className}`}
    >
        {children}
    </button>
);


const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('A sleek, futuristic cityscape at dusk, with flying vehicles and neon lights, hyperrealistic.');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const GALLERY_KEY = 'ftj_image_gallery';
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem(GALLERY_KEY);
      if (saved) {
        setSavedImages(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load images from localStorage", e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setImage(null);
    const result = await generateImage(prompt, aspectRatio, imageSize);
    setImage(result);
    setIsLoading(false);

    if (result) {
      setSavedImages(prevImages => {
        const otherImages = prevImages.filter(img => img !== result);
        const updatedGallery = [result, ...otherImages].slice(0, 10);
        localStorage.setItem(GALLERY_KEY, JSON.stringify(updatedGallery));
        return updatedGallery;
      });
    }
  };
  
  const handleDownload = () => {
      if (!image) return;
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${image}`;
      link.download = `generated-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  return (
    <ToolWrapper title="Image Generation" description="Create stunning visuals with Nano Banana Pro (Gemini 3 Pro Image Preview).">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" placeholder="Enter a prompt..."></textarea>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
            <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
              <option>1:1</option>
              <option>3:4</option>
              <option>4:3</option>
              <option>9:16</option>
              <option>16:9</option>
              <option>2:3</option>
              <option>3:2</option>
              <option>21:9</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image Size</label>
            <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
              <option>1K</option>
              <option>2K</option>
              <option>4K</option>
            </select>
          </div>
        </div>
        <ActionButton disabled={isLoading}>
          {isLoading ? 'Generating...' : <><SparklesIcon className="w-5 h-5 mr-2"/>Generate Image</>}
        </ActionButton>
      </form>
      {isLoading && (
        <div className="mt-6">
          <div 
            className="w-full bg-gray-800 rounded-lg animate-pulse" 
            style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
          />
        </div>
      )}
      {!isLoading && image && (
          <div className="mt-6">
              <img src={`data:image/jpeg;base64,${image}`} alt="Generated" loading="lazy" className="rounded-lg w-full"/>
              <div className="mt-4">
                  <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                      <DownloadIcon className="w-5 h-5"/> Download
                  </button>
              </div>
          </div>
      )}
       {savedImages.length > 0 && (
          <div className="mt-12">
              <h3 className="text-xl font-bold text-white mb-4">My Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {savedImages.map((img, index) => (
                      <img key={index} src={`data:image/jpeg;base64,${img}`} alt={`Saved image ${index + 1}`} loading="lazy" className="rounded-lg w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => setModalImage(img)}/>
                  ))}
              </div>
          </div>
      )}
      {modalImage && (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalImage(null)}
        >
            <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <img 
                    src={`data:image/jpeg;base64,${modalImage}`} 
                    alt="Enlarged view" 
                    loading="lazy"
                    className="rounded-lg object-contain max-h-[90vh]"
                />
                <button 
                    onClick={() => setModalImage(null)}
                    className="absolute -top-3 -right-3 bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 transition-colors"
                    aria-label="Close image viewer"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}
    </ToolWrapper>
  );
};

const ImageAnimator: React.FC = () => {
    const [prompt, setPrompt] = useState('Cinematic camera pan, slow motion effects, neon glow pulsing.');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setVideoUrl(null);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !prompt) return;
        setIsLoading(true);
        setVideoUrl(null);
        try {
            const uri = await animateImage(file, prompt);
            if (uri) {
                // Note: The URI returned by Veo might need to be fetched with API key appended or proxy.
                // Since we can't easily append key on client securely, we'll assume it's usable or user needs to handle.
                // For this demo, we display the URI or a message if it can't be embedded directly.
                // Veo URIs are usually Google Cloud Storage links.
                setVideoUrl(uri);
            } else {
                alert("Failed to generate video. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Error during video generation.");
        }
        setIsLoading(false);
    };

    return (
        <ToolWrapper title="Image Animation (Veo)" description="Bring your images to life with Veo video generation model.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Upload Source Image</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
                    {preview && <img src={preview} alt="Preview" loading="lazy" className="rounded-lg w-full max-h-64 object-contain bg-black/50"/>}
                </div>
                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">Prompt</label>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white" placeholder="Describe the camera movement and action..."></textarea>
                        <ActionButton disabled={isLoading || !file}>
                          {isLoading ? 'Generating Video (this takes time)...' : <><SparklesIcon className="w-5 h-5 mr-2"/>Animate Image</>}
                        </ActionButton>
                    </form>
                    {isLoading && (
                        <div className="mt-6 text-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
                            <p className="text-cyan-300">Veo is generating your video...</p>
                            <p className="text-xs text-gray-500">This process can take a minute or two.</p>
                        </div>
                    )}
                    {videoUrl && (
                        <div className="mt-6">
                            <h4 className="text-white font-bold mb-2">Generated Video</h4>
                            <video controls className="w-full rounded-lg shadow-lg" src={videoUrl}>
                                Your browser does not support the video tag.
                            </video>
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 text-xs text-cyan-400 hover:underline text-center">Download Video</a>
                        </div>
                    )}
                </div>
            </div>
        </ToolWrapper>
    );
};

const ImageEditor: React.FC = () => {
    // (Placeholder for legacy edit tool)
    const [prompt, setPrompt] = useState('Add a retro, vintage film filter.');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [_result, _setResult] = useState<string | null>(null);
    const [_isLoading, _setIsLoading] = useState(false);
    void _result; void _setResult; void _isLoading; void _setIsLoading;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            _setResult(null);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !prompt) return;
        // Currently disabled in service
        alert("Image Editing is temporarily unavailable. Please try Generation or Animation.");
    };

    return (
        <ToolWrapper title="Image Editing" description="Edit images with natural language commands (Coming Soon).">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-75">
                <div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 block w-full text-sm text-gray-400"/>
                    {preview && <img src={preview} alt="Preview" loading="lazy" className="rounded-lg w-full"/>}
                </div>
                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"></textarea>
                        <ActionButton disabled={true}>
                          <SparklesIcon className="w-5 h-5 mr-2"/>Edit Image
                        </ActionButton>
                    </form>
                </div>
            </div>
        </ToolWrapper>
    );
};

const ImageAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState('Describe this image in detail. What objects are present? What is the mood?');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !prompt) return;
        setIsLoading(true);
        setResult(null);
        const analysis = await analyzeImage(prompt, file);
        setResult(analysis);
        setIsLoading(false);
    };

    return (
        <ToolWrapper title="Image Analysis" description="Understand the content of your images with Gemini 3 Pro.">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
                    {preview && <img src={preview} alt="Preview" loading="lazy" className="rounded-lg w-full"/>}
                </div>
                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white" placeholder="e.g., 'What is the main subject of this photo?'"></textarea>
                        <ActionButton disabled={isLoading || !file}>
                          {isLoading ? 'Analyzing...' : <><SparklesIcon className="w-5 h-5 mr-2"/>Analyze Image</>}
                        </ActionButton>
                    </form>
                    {isLoading && <div className="mt-6 text-center">Loading...</div>}
                    {result && <div className="mt-6 p-4 bg-gray-800 rounded-md text-gray-300 prose prose-invert max-w-none">{result}</div>}
                </div>
            </div>
        </ToolWrapper>
    );
};

const GroundedSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || 'What are the latest breakthroughs in AI this week?');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: GroundingChunk[] } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const HISTORY_KEY = 'ftj_search_history';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) { console.error("Failed to load history", e); }
  }, []);

  const runSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setResult(null);
    setIsHistoryVisible(false);

    setHistory(prevHistory => {
      const updatedHistory = [searchQuery, ...prevHistory.filter(h => h !== searchQuery)].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });

    const response = await groundedSearch(searchQuery);
    setResult(response);
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };
  
  const handleHistoryClick = (item: string) => {
    setQuery(item);
    runSearch(item);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setIsHistoryVisible(false);
    localStorage.removeItem(HISTORY_KEY);
  };
  
  const handleClearQuery = () => {
    setQuery('');
    setResult(null);
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      runSearch(q);
    }
  }, [searchParams, runSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsHistoryVisible(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ToolWrapper title="Grounded Search" description="Get up-to-date, factual answers with citations from Google Search.">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow" ref={searchRef}>
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            onFocus={() => setIsHistoryVisible(true)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 pr-10 text-white focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Ask a question..."
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search query"
            >
              <CloseIcon />
            </button>
          )}
          {isHistoryVisible && history.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-800/90 backdrop-blur-md border border-white/10 rounded-md shadow-lg overflow-hidden z-10">
              <ul>
                {history.map((item, index) => (
                  <li key={index}>
                    <button type="button" className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-cyan-600/50" onClick={() => handleHistoryClick(item)}>
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/10">
                 <button type="button" className="w-full text-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/50 transition-colors" onClick={handleClearHistory}>
                    Clear History
                </button>
              </div>
            </div>
          )}
        </div>
        <ActionButton type="submit" disabled={isLoading} className="w-full sm:w-auto px-6">
          {isLoading ? 'Searching...' : 'Search'}
        </ActionButton>
      </form>
      {isLoading && <div className="text-center">Searching the web...</div>}
      {result && (
        <div>
          <div className="p-4 bg-gray-800 rounded-md text-gray-300 prose prose-invert max-w-none" dangerouslySetInnerHTML={{__html: result.text.replace(/\n/g, '<br />')}}/>
          {result.sources.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-300 mb-2">Sources:</h4>
              <div className="space-y-3">
                {result.sources.map((source, index) => (
                  source.web && (
                    <div key={index} className="border-l-4 border-cyan-500 bg-gray-800/50 p-4 rounded-r-lg transition-all hover:bg-gray-800/80">
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-medium block truncate">{source.web.title}</a>
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-400 block truncate">{source.web.uri}</a>
                      {source.web.snippet && (
                        <blockquote className="mt-2 text-gray-300 text-sm border-l-2 border-gray-600 pl-3 italic">
                          ...{source.web.snippet}...
                        </blockquote>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolWrapper>
  );
};

const ArticleRewriter: React.FC = () => {
    const { articles, loading } = useArticles();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ newTitle: string; newSummary: string; newContent: string; newTags: string[] } | null>(null);
    const [tone, setTone] = useState('professional and insightful, in a clean, modern, and factual style');
    
    const originalArticle = articles.length > 0 ? articles[0] : mockArticles[0];

    const tones = {
      'Professional': 'professional and insightful, in a clean, modern, and factual style',
      'Casual': 'casual, engaging, and easy-to-read',
      'Humorous': 'witty, humorous, and slightly sarcastic'
    };

    const handleRewrite = async () => {
        setIsLoading(true);
        setResult(null);
        const responseJson = await rewriteArticle(originalArticle.content, tone);
        try {
            setResult(JSON.parse(responseJson));
        } catch (e) {
            console.error("Failed to parse rewrite response", e);
            setResult({newTitle: 'Error', newSummary: 'Failed to parse response from AI.', newContent: '', newTags: []});
        }
        setIsLoading(false);
    };

    return (
        <ToolWrapper title="AI Rewriter & SEO Optimizer" description="Rewrites articles using Gemini 3 Pro with extensive reasoning (Thinking Mode).">
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-medium text-gray-300">Select Tone</label>
              <div className="flex flex-wrap gap-4">
                  {Object.entries(tones).map(([key, value]) => (
                      <button key={key} onClick={() => setTone(value)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tone === value ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}>
                          {key}
                      </button>
                  ))}
              </div>
            </div>
            <div className="text-center mb-6">
                <ActionButton onClick={handleRewrite} disabled={isLoading || loading}>
                    {isLoading ? 'Thinking & Rewriting...' : <><SparklesIcon className="w-5 h-5 mr-2"/>Rewrite Article (Think Mode)</>}
                </ActionButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-400 mb-4 border-b border-gray-700 pb-2">Original Article</h3>
                    <div className="p-4 bg-gray-800/50 rounded-md space-y-4 h-[400px] overflow-y-auto">
                        <h4 className="font-bold text-lg text-white">{originalArticle.title}</h4>
                        <p className="text-sm text-gray-300">{originalArticle.content.substring(0, 800)}...</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-700 pb-2">AI-Powered Version</h3>
                    {isLoading && <div className="text-center p-4 animate-pulse">Gemini 3 Pro is thinking deeply about the content...</div>}
                    {result && (
                        <div className="p-4 bg-cyan-900/30 rounded-md space-y-4 h-[400px] overflow-y-auto">
                            <h4 className="font-bold text-lg text-white">{result.newTitle}</h4>
                            <p className="italic text-cyan-200 text-sm">"{result.newSummary}"</p>
                            <p className="text-sm text-gray-200">{result.newContent}</p>
                            <div className="flex flex-wrap gap-2">
                                {result.newTags.map(tag => <span key={tag} className="bg-cyan-800 text-cyan-200 text-xs font-medium px-2 py-1 rounded-full">{tag}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ToolWrapper>
    );
};

const BlogPostGenerator: React.FC = () => {
    const [topic, setTopic] = useState('The impact of AI on creative industries like film and music.');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ title: string; content: string; tags: string[] } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsLoading(true);
        setResult(null);
        const responseJson = await generateBlogPost(topic);
        try {
            const parsedResult = JSON.parse(responseJson);
            if (parsedResult.content) {
              setResult(parsedResult);
            } else {
              setResult({title: 'Error', content: 'Failed to generate content. The AI response might be malformed.', tags: []});
            }
        } catch (e) {
            console.error("Failed to parse blog post response", e);
            setResult({title: 'Error', content: 'Failed to parse response from AI.', tags: []});
        }
        setIsLoading(false);
    };

    return (
        <ToolWrapper title="Blog Post Generator" description="Generate a full, high-quality blog post from a simple topic or outline using Gemini 3 Pro.">
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <textarea
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Enter a topic or a brief outline..."
                />
                <ActionButton disabled={isLoading}>
                    {isLoading ? 'Thinking & Writing...' : <><SparklesIcon className="w-5 h-5 mr-2"/>Generate Post</>}
                </ActionButton>
            </form>

            {isLoading && <div className="text-center p-4">AI is thinking and crafting your blog post...</div>}

            {result && (
                <div className="p-6 bg-gray-800/50 rounded-lg border border-white/10 prose prose-lg prose-invert max-w-none">
                    <h2 className="text-3xl font-bold text-cyan-300 not-prose">{result.title}</h2>
                    <div className="flex flex-wrap gap-2 my-4 not-prose">
                        {result.tags.map(tag => (
                            <span key={tag} className="bg-gray-700 text-cyan-200 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: (result.content || '').replace(/\n/g, '<br />') }} />
                </div>
            )}
        </ToolWrapper>
    );
};

export default AiToolsPage;
