

import React, { useState, useRef, useEffect } from 'react';
import BotIcon from './icons/BotIcon';
import CloseIcon from './icons/CloseIcon';
import SparklesIcon from './icons/SparklesIcon';
import { chatWithBotStream } from '../services/geminiService';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      if (isOpen) {
          setTimeout(() => inputRef.current?.focus(), 300); // Focus after animation
      }
  }, [isOpen]);

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    setMessages((prev) => [...prev, userMessage, { sender: 'bot', text: '' }]);

    try {
        const stream = await chatWithBotStream(history, currentInput);
        let accumulatedText = '';
        
        for await (const chunk of stream) {
            accumulatedText += chunk.text;
            const currentText = accumulatedText;
            setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.sender === 'bot') {
                    newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        text: currentText
                    };
                }
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error in chatbot stream:", error);
        let errorMessage = "I seem to be having trouble connecting. Please try again later.";
        
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('429') || error.message.includes('quota')) {
                errorMessage = "API quota exceeded. Please try again in a few moments.";
            } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
                errorMessage = "Authentication error. Please refresh the page.";
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = "Network error. Please check your connection.";
            }
        }
        
        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.sender === 'bot') {
                lastMessage.text = errorMessage;
            }
            return newMessages;
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
      setInput(suggestion);
      inputRef.current?.focus();
  };
  
  const suggestions = ["Latest AI news?", "What is quantum computing?", "Explain blockchain"];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-cyan-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-50 hover:shadow-cyan-glow"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <CloseIcon className="w-6 h-6" /> : <BotIcon className="w-6 h-6" />}
      </button>

      <div className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-7rem)] bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-white/10 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
        <header className="p-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-b border-white/10 flex-shrink-0">
            <SparklesIcon className="w-6 h-6 text-cyan-400"/>
            <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
        </header>

        <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && (
                  <div className="text-center py-8 px-4">
                      <BotIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4"/>
                      <h4 className="font-semibold text-lg text-white mb-2">Welcome to the FutureTechJournal AI!</h4>
                      <p className="text-sm text-gray-400 mb-6">Ask me anything about the articles, technology, or the future.</p>
                      <div className="space-y-2">
                          {suggestions.map((s, i) => (
                              <button key={i} onClick={() => handleSuggestionClick(s)} className="w-full text-left text-sm text-cyan-300 bg-gray-800/50 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                                  {s}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse ml-auto' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-gray-700' : 'bg-cyan-900/50'}`}>
                        {msg.sender === 'user' ? <UserIcon className="w-5 h-5 text-gray-400"/> : <BotIcon className="w-5 h-5 text-cyan-400"/>}
                    </div>
                    <div className={`p-3 rounded-lg ${msg.sender === 'user' ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                        <p className="text-sm whitespace-pre-wrap">
                            {msg.text}
                            {isLoading && msg.sender === 'bot' && index === messages.length - 1 && (
                                <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 align-bottom animate-pulse"></span>
                            )}
                        </p>
                    </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
        </div>

        <div className="p-4 bg-black/20 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading} className="bg-cyan-600 text-white p-2 rounded-full disabled:bg-gray-500 hover:bg-cyan-500 transition-all transform hover:scale-110">
              <SparklesIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;