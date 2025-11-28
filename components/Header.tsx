
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const { articles } = useArticles();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsSuggestionsVisible(false);
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
      setIsMenuOpen(false); // Close mobile menu if open
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
              .slice(0, 5); // Limit suggestions
          setSuggestions(filteredSuggestions);
          setIsSuggestionsVisible(true);
      } else {
          setSuggestions([]);
          setIsSuggestionsVisible(false);
      }
  };
  
  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-cyan-300";
  const activeNavLinkClasses = "text-cyan-400";
  
  const renderNavLink = (link: { name: string, path: string }, isMobile = false) => {
    const isCategory = link.path.startsWith('/category/');
    const categoryStyle = isCategory ? getCategoryStyle(link.name as Category) : null;

    return (
        <li key={link.name}>
            <NavLink
                to={link.path}
                onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
                className={({ isActive }) => {
                    const activeColor = categoryStyle ? categoryStyle.text : activeNavLinkClasses;
                    return `${navLinkClasses} ${isMobile ? 'text-lg' : ''} ${isActive ? activeColor : 'text-gray-300'}`;
                }}
            >
                <span>{link.name}</span>
            </NavLink>
        </li>
    );
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? 'bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60 bg-gray-900 dark:bg-black/80 border-b border-gray-500/30'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-white">
              <LogoIcon className="w-8 h-8" />
              <span className="hidden sm:inline">FutureTechJournal</span>
            </Link>
          </div>

          <nav className="hidden lg:block">
            <ul className="flex items-center space-x-2">
              {NAV_LINKS.map(link => renderNavLink(link))}
            </ul>
          </nav>
          
          <div className="hidden lg:flex items-center space-x-4">
             <form onSubmit={handleSearchSubmit} className="relative" ref={searchRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSuggestionsVisible(searchQuery.length > 1)}
                placeholder="Search articles..."
                className="w-48 bg-white/10 border-gray-400/50 rounded-full py-1.5 pl-4 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:w-64 transition-all focus:shadow-cyan-glow"
                autoComplete="off"
              />
              <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </button>
              {isSuggestionsVisible && suggestions.length > 0 && (
                <ul className="absolute top-full mt-2 w-64 bg-gray-800/90 backdrop-blur-md border border-white/10 rounded-md shadow-lg overflow-hidden">
                    {suggestions.map((suggestion, index) => (
                        <li key={index}>
                            <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-cyan-600/50"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </button>
                        </li>
                    ))}
                </ul>
              )}
            </form>
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white">
                   <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white">
                      <UserIcon className="w-5 h-5" />
                   </div>
                   <span>Admin</span>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                  <div className="py-1">
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Dashboard</Link>
                    <Link to="/admin/articles" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Content Manager</Link>
                    <Link to="/ai-tools?tab=rewrite" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Rewrite Article</Link>
                    <Link to="/ai-tools?tab=blog" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Blog Generator</Link>
                    <Link to="/ai-tools" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">All AI Tools</Link>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300">Logout</button>
                  </div>
                </div>
              </div>
            ) : null}

          </div>

          <div className="flex items-center space-x-4 lg:hidden">
            <button onClick={() => navigate('/search')} className="text-gray-200 hover:text-white" aria-label="Open search">
                <SearchIcon className="h-6 w-6" />
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-200 hover:text-white" aria-label="Open menu">
              {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-y-auto ${isMenuOpen ? 'max-h-[calc(100vh-5rem)]' : 'max-h-0'}`}>
        <div className="pt-2 pb-4 bg-gray-900 border-t border-gray-800">
          <ul className="flex flex-col items-center space-y-2">
             {NAV_LINKS.map(link => renderNavLink(link, true))}
             {isAuthenticated && (
               <>
                 <li className="w-full border-t border-gray-800 my-2"></li>
                 <li><Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-lg text-cyan-400 font-medium">Admin Dashboard</Link></li>
                 <li><Link to="/admin/articles" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-lg text-cyan-400 font-medium">Content Manager</Link></li>
                 <li><Link to="/ai-tools" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-lg text-cyan-400 font-medium">AI Tools</Link></li>
                 <li><button onClick={handleLogout} className="block px-3 py-2 text-lg text-red-400 font-medium">Logout</button></li>
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
