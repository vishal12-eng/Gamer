import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import LogoIcon from './icons/LogoIcon';
import SearchIcon from './icons/SearchIcon';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';
import UserIcon from './icons/UserIcon';
import { NAV_LINKS } from '../constants';
import { useArticles } from '../hooks/useArticles';
import { getCategoryStyle } from '../utils/categoryStyles';
import { Category } from '../types';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const { articles } = useArticles();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);
      const progress = Math.min(scrollY / 100, 1);
      setScrollProgress(progress);
    };
    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsSuggestionsVisible(false);
            setIsSearchFocused(false);
        }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSuggestions([]);
      setIsSuggestionsVisible(false);
      setIsMenuOpen(false);
    }
  };
  
  const handleSuggestionClick = (suggestionTitle: string) => {
    const article = articles.find(a => a.title === suggestionTitle);
    if (article) {
        navigate(`/article/${article.slug}`);
    }
    setSearchQuery('');
    setSuggestions([]);
    setIsSuggestionsVisible(false);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      if (query.length > 1) {
          const filteredSuggestions = articles
              .filter(article => article.title.toLowerCase().includes(query.toLowerCase()))
              .map(article => article.title)
              .slice(0, 5);
          setSuggestions(filteredSuggestions);
          setIsSuggestionsVisible(true);
      } else {
          setSuggestions([]);
          setIsSuggestionsVisible(false);
      }
  };
  
  const navLinkClasses = "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:text-cyan-300 hover:bg-white/5";
  const activeNavLinkClasses = "text-cyan-400";
  
  const renderNavLink = (link: { name: string, path: string }, isMobile = false) => {
    const isCategory = link.path.startsWith('/category/');
    const categoryStyle = isCategory ? getCategoryStyle(link.name as Category) : null;

    return (
        <li key={link.name} className="relative">
            <NavLink
                to={link.path}
                onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
                className={({ isActive }) => {
                    const activeColor = categoryStyle ? categoryStyle.text : activeNavLinkClasses;
                    return `${navLinkClasses} ${isMobile ? 'text-lg' : ''} ${isActive ? activeColor : 'text-gray-300'} group`;
                }}
            >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></span>
                    )}
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </>
                )}
            </NavLink>
        </li>
    );
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const headerHeight = isScrolled ? 'h-16' : 'h-20';
  const logoScale = isScrolled ? 'scale-90' : 'scale-100';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled || isMenuOpen
          ? 'glass shadow-glass-lg'
          : 'bg-transparent'
      }`}
      style={{
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
      }}
    >
      {/* Animated gradient border at bottom */}
      <div 
        className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-all duration-500"
        style={{ 
          width: `${scrollProgress * 100}%`,
          opacity: isScrolled ? 1 : 0 
        }}
      ></div>

      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${headerHeight}`}>
          {/* Logo with animation */}
          <div className={`flex-shrink-0 transition-transform duration-300 ${logoScale}`}>
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-2xl font-bold text-white group"
            >
              <div className="relative">
                <LogoIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="hidden sm:inline bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-cyan-300 group-hover:to-purple-300">
                FutureTechJournal
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex items-center space-x-1">
              {NAV_LINKS.map(link => renderNavLink(link))}
            </ul>
          </nav>
          
          {/* Right side actions */}
          <div className="hidden lg:flex items-center space-x-4">
             {/* Search with enhanced styling */}
             <form onSubmit={handleSearchSubmit} className="relative" ref={searchRef}>
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    setIsSuggestionsVisible(searchQuery.length > 1);
                    setIsSearchFocused(true);
                  }}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search articles..."
                  className={`bg-white/5 border rounded-full py-2 pl-4 pr-10 text-sm text-white placeholder-gray-400 
                    focus:outline-none transition-all duration-300
                    ${isSearchFocused 
                      ? 'w-72 border-cyan-400/50 shadow-cyan-glow bg-white/10' 
                      : 'w-48 border-white/10 hover:border-white/20'
                    }`}
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                >
                  <SearchIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Enhanced suggestions dropdown */}
              {isSuggestionsVisible && suggestions.length > 0 && (
                <ul className="absolute top-full mt-2 w-72 glass rounded-xl shadow-glass-lg overflow-hidden animate-fadeIn">
                    {suggestions.map((suggestion, index) => (
                        <li key={index}>
                            <button
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-200 flex items-center gap-3"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <SearchIcon className="w-4 h-4 text-gray-500" />
                                <span className="line-clamp-1">{suggestion}</span>
                            </button>
                        </li>
                    ))}
                </ul>
              )}
            </form>

            {/* Theme toggle with glow effect */}
            <div className="relative group">
              <ThemeToggle />
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
            
            {/* Admin dropdown with enhanced styling */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300">
                   <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow duration-300">
                      <UserIcon className="w-5 h-5" />
                   </div>
                   <span className="hidden xl:inline">Admin</span>
                </button>
                <div className="absolute right-0 mt-3 w-60 glass rounded-xl shadow-glass-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm text-white font-medium">Administrator</p>
                    </div>
                    <Link to="/admin/dashboard" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-transparent hover:text-white transition-all duration-200">Dashboard</Link>
                    <Link to="/admin/articles" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-transparent hover:text-white transition-all duration-200">Content Manager</Link>
                    <Link to="/ai-tools?tab=rewrite" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-transparent hover:text-white transition-all duration-200">Rewrite Article</Link>
                    <Link to="/ai-tools?tab=blog" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-transparent hover:text-white transition-all duration-200">Blog Generator</Link>
                    <Link to="/ai-tools" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-transparent hover:text-white transition-all duration-200">All AI Tools</Link>
                    <div className="border-t border-white/10 my-1"></div>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200">Logout</button>
                  </div>
                </div>
              </div>
            ) : null}

          </div>

          {/* Mobile actions */}
          <div className="flex items-center space-x-4 lg:hidden">
            <button 
              onClick={() => navigate('/search')} 
              className="text-gray-200 hover:text-cyan-400 transition-colors duration-300 p-2 rounded-lg hover:bg-white/5" 
              aria-label="Open search"
            >
                <SearchIcon className="h-6 w-6" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-gray-200 hover:text-cyan-400 transition-colors duration-300 p-2 rounded-lg hover:bg-white/5" 
              aria-label="Open menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? 'top-3 rotate-45' : 'top-1'}`}></span>
                <span className={`absolute left-0 top-3 block h-0.5 w-6 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? 'top-3 -rotate-45' : 'top-5'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu with enhanced animations */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
          isMenuOpen ? 'max-h-[calc(100vh-5rem)] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass border-t border-white/10 py-4">
          <ul className="flex flex-col items-center space-y-1 px-4">
             {NAV_LINKS.map((link, index) => {
               const isCategory = link.path.startsWith('/category/');
               const categoryStyle = isCategory ? getCategoryStyle(link.name as Category) : null;
               const activeColor = categoryStyle ? categoryStyle.text : activeNavLinkClasses;
               return (
                 <li 
                   key={link.name} 
                   className="w-full"
                   style={{ 
                     animationDelay: `${index * 50}ms`,
                     animation: isMenuOpen ? 'fadeInUp 0.5s ease forwards' : 'none'
                   }}
                 >
                   <NavLink
                     to={link.path}
                     onClick={() => setIsMenuOpen(false)}
                     className={({ isActive }) => 
                       `${navLinkClasses} text-lg w-full block text-center ${isActive ? activeColor : 'text-gray-300'}`
                     }
                   >
                     {link.name}
                   </NavLink>
                 </li>
               );
             })}
             {isAuthenticated && (
               <>
                 <li className="w-full border-t border-white/10 my-2 pt-2"></li>
                 <li className="w-full"><Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-lg text-cyan-400 font-medium hover:bg-white/5 rounded-lg transition-colors text-center">Admin Dashboard</Link></li>
                 <li className="w-full"><Link to="/admin/articles" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-lg text-cyan-400 font-medium hover:bg-white/5 rounded-lg transition-colors text-center">Content Manager</Link></li>
                 <li className="w-full"><Link to="/ai-tools" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-lg text-cyan-400 font-medium hover:bg-white/5 rounded-lg transition-colors text-center">AI Tools</Link></li>
                 <li className="w-full"><button onClick={handleLogout} className="block w-full text-center px-4 py-3 text-lg text-red-400 font-medium hover:bg-red-500/10 rounded-lg transition-colors">Logout</button></li>
               </>
             )}
          </ul>
           <div className="mt-4 flex justify-center">
             <ThemeToggle />
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
