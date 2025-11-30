
import { useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { ToastContext } from './hooks/useToast';
import Toast from './components/Toast';
import { ArticleProvider } from './hooks/useArticles';
import { HomePageSkeleton } from './components/SkeletonLoader';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AAdsProvider, StickyAAdsBanner } from './components/ads';
import ConsentBanner from './components/ConsentBanner';

const HomePage = lazy(() => import('./pages/HomePage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const AiToolsPage = lazy(() => import('./pages/AiToolsPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsAndConditionsPage = lazy(() => import('./pages/TermsAndConditionsPage'));
const ForYouPage = lazy(() => import('./pages/ForYouPage'));
const AuthorPage = lazy(() => import('./pages/AuthorPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminArticleListPage = lazy(() => import('./pages/AdminArticleListPage'));
const AdminArticleEditorPage = lazy(() => import('./pages/AdminArticleEditorPage'));
const AdminAdsPage = lazy(() => import('./pages/AdminAdsPage'));

function App() {
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
  };
  
  const closeToast = () => {
    setToastMessage('');
  };

  return (
    <HelmetProvider>
      <AuthProvider>
        <AAdsProvider>
          <ToastContext.Provider value={{ showToast }}>
            <ArticleProvider>
              <HashRouter>
              <div className="flex flex-col min-h-screen font-sans bg-gray-100 dark:bg-transparent transition-colors duration-500">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 pt-24">
                  <Suspense fallback={<HomePageSkeleton />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/foryou" element={<ForYouPage />} />
                      <Route path="/article/:slug" element={<ArticlePage />} />
                      <Route path="/author/:authorSlug" element={<AuthorPage />} />
                      <Route path="/category/:name" element={<CategoryPage />} />
                      <Route path="/bookmarks" element={<BookmarksPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/disclaimer" element={<DisclaimerPage />} />
                      <Route path="/privacy" element={<PrivacyPolicyPage />} />
                      <Route path="/terms" element={<TermsAndConditionsPage />} />
                      <Route path="/sitemap" element={<SitemapPage />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route 
                        path="/admin/dashboard" 
                        element={
                          <ProtectedRoute>
                            <AdminDashboardPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/ai-tools" 
                        element={
                          <ProtectedRoute>
                            <AiToolsPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/articles" 
                        element={
                          <ProtectedRoute>
                            <AdminArticleListPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/articles/:slug" 
                        element={
                          <ProtectedRoute>
                            <AdminArticleEditorPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/ads" 
                        element={
                          <ProtectedRoute>
                            <AdminAdsPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </main>
                <StickyAAdsBanner />
                <Chatbot />
                <Footer />
                <ConsentBanner />
                <Toast message={toastMessage} onClose={closeToast} />
              </div>
              </HashRouter>
            </ArticleProvider>
          </ToastContext.Provider>
        </AAdsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
