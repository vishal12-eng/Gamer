
import React from 'react';
import SparklesIcon from '../components/icons/SparklesIcon';
import LogoIcon from '../components/icons/LogoIcon';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="text-center my-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-[#000000] dark:text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">Pioneering the Future of Information</h1>
        <p className="text-lg md:text-xl text-[#111111] dark:text-gray-400 max-w-3xl mx-auto [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
          FutureTechJournal isn't just a news source; it's an experiment in the synergy between human expertise and artificial intelligence, crafting the most insightful, accurate, and forward-looking content in the tech world.
        </p>
      </section>

      {/* Mission Section */}
      <section className="my-20 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 flex items-center justify-center text-[#000000] dark:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">
          <SparklesIcon className="w-8 h-8 mr-3 text-cyan-400" />
          Our Mission
        </h2>
        <p className="text-[#111111] dark:text-gray-300 leading-relaxed mb-4">
          Our mission is to decode the future. In an age of rapid technological advancement, we provide a clear, premium, and factual lens on the innovations that shape our world. We leverage the power of AI to augment our journalistic integrity, not replace it, ensuring every story is both cutting-edge and deeply human.
        </p>
        <p className="text-[#111111] dark:text-gray-300 leading-relaxed">
          We believe in informed optimism, critically examining the promise and peril of new technologies to empower our readers to navigate the complexities of tomorrow.
        </p>
      </section>

      {/* Centered Logo Section */}
      <section className="my-20 flex justify-center py-12">
        <div className="relative w-80 h-80">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full opacity-30 blur-2xl"></div>
            <LogoIcon className="absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </section>
      
      {/* How We Work Section */}
       <section className="my-20 p-8 bg-gray-900/50 rounded-xl border border-white/10">
        <h2 className="text-4xl font-bold mb-6 text-center text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">The AI-Powered Pipeline</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mb-4 mx-auto flex items-center justify-center">
                <span className="text-2xl font-bold text-cyan-400">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Automated Discovery</h3>
            <p className="text-gray-400 text-sm">Our AI systems constantly scan thousands of sources, from RSS feeds to academic journals, identifying breaking news and emerging trends in real-time.</p>
          </div>
          <div className="p-4">
             <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mb-4 mx-auto flex items-center justify-center">
                <span className="text-2xl font-bold text-cyan-400">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">AI-Assisted Curation</h3>
            <p className="text-gray-400 text-sm">Gemini models analyze, summarize, and categorize incoming information, providing our human editors with high-signal briefs and data-driven insights.</p>
          </div>
          <div className="p-4">
             <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mb-4 mx-auto flex items-center justify-center">
                <span className="text-2xl font-bold text-cyan-400">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Human-Crafted Narrative</h3>
            <p className="text-gray-400 text-sm">Our world-class journalists take the AI-curated data and craft compelling, accurate, and insightful articles. It's the perfect blend of machine efficiency and human creativity.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
