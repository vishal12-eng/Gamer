
import React, { useState } from 'react';
import EmailIcon from '../components/icons/EmailIcon';
import LocationMarkerIcon from '../components/icons/LocationMarkerIcon';
import TwitterIcon from '../components/icons/TwitterIcon';
import LinkedInIcon from '../components/icons/LinkedInIcon';
import { useToast } from '../hooks/useToast';

const ContactPage: React.FC = () => {
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: ''});
    const { showToast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, subject, message } = formState;

        const mailBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        const mailtoLink = `mailto:futuretechjournal@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
        
        window.location.href = mailtoLink;

        showToast("Your email client is opening to send the message!");
        setFormState({ name: '', email: '', subject: '', message: ''});
    };

    return (
        <div className="max-w-5xl mx-auto">
            <section className="text-center my-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-[#000000] dark:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">Get In Touch</h1>
                <p className="text-lg md:text-xl text-[#111111] dark:text-gray-400 max-w-3xl mx-auto">
                    Have a question, a news tip, or want to collaborate? We'd love to hear from you.
                </p>
            </section>

            <div className="grid md:grid-cols-5 gap-8 md:gap-12 my-20">
                {/* Contact Info */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-center space-x-4 mb-3">
                            <EmailIcon className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-2xl font-bold text-[#000000] dark:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">Email Us</h3>
                        </div>
                        <p className="text-[#111111] dark:text-gray-400">Our inbox is always open. We'll get back to you as soon as possible.</p>
                        <a href="mailto:futuretechjournal@gmail.com" className="text-cyan-500 dark:text-cyan-300 hover:underline mt-2 block">futuretechjournal@gmail.com</a>
                    </div>
                     <div>
                        <div className="flex items-center space-x-4 mb-3">
                            <LocationMarkerIcon className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-2xl font-bold text-[#000000] dark:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">Our HQ</h3>
                        </div>
                        <p className="text-[#111111] dark:text-gray-400">Bangalore, India</p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="md:col-span-3 bg-gray-900/50 p-8 rounded-lg border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <input type="text" name="name" id="name" value={formState.name} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                <input type="email" name="email" id="email" value={formState.email} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                            <input type="text" name="subject" id="subject" value={formState.subject} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                            <textarea name="message" id="message" rows={5} value={formState.message} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                        </div>
                        <div>
                            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 hover:shadow-cyan-glow">
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
             {/* Socials */}
            <section className="text-center my-20">
                <h2 className="text-3xl font-bold mb-6 text-[#000000] dark:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">Follow Our Journey</h2>
                 <div className="flex justify-center space-x-6">
                    <a 
                      href="https://twitter.com/tech_futur32551" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors" 
                      aria-label="Follow us on Twitter"
                    >
                        <TwitterIcon className="w-8 h-8"/>
                    </a>
                     <a 
                      href="https://www.linkedin.com/in/future-tech-journal-354071392/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors" 
                      aria-label="Follow us on LinkedIn"
                    >
                        <LinkedInIcon className="w-8 h-8"/>
                    </a>
                 </div>
            </section>
        </div>
    );
};

export default ContactPage;
