import { Article } from '../types';

export const mockArticles: Article[] = [
  {
    slug: 'the-quantum-leap-in-ai-what-it-means-for-tomorrow',
    title: 'The Quantum Leap in AI: What It Means for Tomorrow',
    summary: 'Quantum computing is poised to revolutionize artificial intelligence, unlocking unprecedented processing power and problem-solving capabilities.',
    content: `Quantum computing represents a fundamental shift from classical computing. Instead of bits, which can be either 0 or 1, quantum computers use qubits, which can exist in a superposition of both states simultaneously. This property, along with entanglement, allows quantum computers to perform complex calculations at speeds unimaginable for even the most powerful supercomputers of today.

For artificial intelligence, this opens up a new frontier. Machine learning models, especially deep learning networks, are incredibly computationally intensive. Training these models can take days or even weeks. Quantum machine learning (QML) algorithms promise to dramatically accelerate this process. Imagine training a complex language model in minutes instead of months.

Furthermore, quantum computers could solve optimization problems that are currently intractable. This has massive implications for logistics, drug discovery, financial modeling, and materials science. By integrating quantum principles, AI could design more efficient supply chains, discover new life-saving drugs, and create novel materials with extraordinary properties. The synergy between AI and quantum computing is not just an incremental improvement; it's a paradigm shift that will redefine the boundaries of technology.`,
    author: 'Dr. Evelyn Reed',
    date: '2023-10-26',
    category: 'AI',
    tags: ['Quantum Computing', 'AI', 'Machine Learning', 'Future Tech'],
    imageUrl: 'https://picsum.photos/seed/quantum/800/450',
  },
  {
    slug: 'next-gen-gadgets-unveiled-at-ces-2024',
    title: 'Next-Gen Gadgets Unveiled at CES 2024',
    summary: 'From transparent TVs to AI-powered personal assistants, CES 2024 showcased a glimpse into the future of consumer electronics.',
    content: `The Consumer Electronics Show (CES) once again set the stage for technological innovation. This year, the spotlight was on artificial intelligence integration into everyday devices. Companies showcased smart home hubs that learn your habits, wearable health trackers that provide predictive analysis, and automotive tech that makes driving safer and more intuitive.

One of the standout innovations was the widespread adoption of transparent display technology. We saw everything from see-through televisions that blend seamlessly into your decor to laptop screens that offer a new level of augmented reality interaction.

Sustainability was another major theme. Many companies introduced gadgets made from recycled materials, powered by more efficient batteries, and designed for easy repair and longevity. This signals a growing awareness in the industry of its environmental impact. From mind-bending displays to truly intelligent companions, CES 2024 proved that the future of gadgets is smarter, more integrated, and more conscious than ever before.`,
    author: 'Alex Chen',
    date: '2024-01-15',
    category: 'Product',
    tags: ['CES', 'Gadgets', 'Innovation', 'Consumer Electronics'],
    imageUrl: 'https://picsum.photos/seed/gadgets/800/450',
  },
  {
    slug: 'navigating-the-new-digital-economy',
    title: 'Navigating the New Digital Economy',
    summary: 'The rise of decentralized finance (DeFi) and the metaverse are reshaping how we think about business, assets, and online interaction.',
    content: `The global economy is undergoing a profound transformation, driven by digital technologies. Two of the most significant drivers are decentralized finance (DeFi) and the metaverse. DeFi, built on blockchain technology, is creating an alternative financial system that is open, transparent, and accessible to everyone. It challenges traditional banking with services like lending, borrowing, and trading without intermediaries.

Meanwhile, the metaverse is evolving from a niche concept into the next major computing platform. It promises persistent, shared virtual spaces where people can work, play, and socialize. For businesses, this opens up new avenues for marketing, e-commerce, and customer engagement. Companies are already building virtual storefronts, hosting events, and creating digital twins of their physical operations.

Understanding and adapting to these trends is crucial for businesses and individuals alike. The skills required to thrive in this new digital economy include blockchain literacy, virtual world development, and data analytics. As these ecosystems mature, they will fundamentally change our economic landscape.`,
    author: 'Priya Singh',
    date: '2023-11-05',
    category: 'Business',
    tags: ['DeFi', 'Metaverse', 'Blockchain', 'Digital Economy'],
    imageUrl: 'https://picsum.photos/seed/business/800/450',
  },
    {
    slug: 'global-tech-summit-highlights-collaboration',
    title: 'Global Tech Summit Highlights Cross-Border Collaboration',
    summary: 'Leaders from around the world gathered to discuss the importance of international cooperation in solving technology\'s biggest challenges.',
    content: 'The annual Global Tech Summit concluded this week with a resounding call for increased collaboration across borders. Panel discussions focused on shared challenges such as regulating artificial intelligence, combating cybersecurity threats, and ensuring equitable access to digital infrastructure. Experts argued that no single country can solve these complex issues alone. A key takeaway was the formation of a new international task force dedicated to creating global standards for AI ethics and data privacy. This initiative aims to foster innovation while protecting consumers and preventing the misuse of technology. The summit underscored that the future of technology is not just about competition, but about building a connected global community to guide its development responsibly.',
    author: 'Kenji Tanaka',
    date: '2023-09-20',
    category: 'Global',
    tags: ['Technology', 'Global Policy', 'AI Ethics', 'Collaboration'],
    imageUrl: 'https://picsum.photos/seed/global/800/450',
  },
  {
    slug: 'the-rise-of-generative-ai-in-entertainment',
    title: 'The Rise of Generative AI in Entertainment',
    summary: 'Generative AI is transforming the film, music, and gaming industries, from scriptwriting to creating immersive virtual worlds.',
    content: 'The entertainment industry is on the cusp of a creative revolution, powered by generative AI. AI models can now write scripts, compose music, generate realistic visual effects, and even design entire video game levels. This technology is not replacing human creativity but augmenting it, providing powerful new tools for artists. For example, concept artists can use AI to quickly generate dozens of variations of a character or environment. Musicians can collaborate with AI to create novel melodies and harmonies. In gaming, AI can generate dynamic, ever-changing worlds that respond to player actions in real-time. While there are ongoing debates about copyright and ethics, the potential for generative AI to unlock new forms of storytelling and interactive experiences is undeniable.',
    author: 'Chloe Davis',
    date: '2024-02-10',
    category: 'Entertainment',
    tags: ['Generative AI', 'Entertainment', 'Film', 'Gaming', 'Music'],
    imageUrl: 'https://picsum.photos/seed/entertainment/800/450',
  },
   {
    slug: 'the-future-of-personalized-medicine',
    title: 'The Future is Now: AI in Personalized Medicine',
    summary: 'Artificial intelligence is analyzing vast datasets to tailor medical treatments to individual patients, heralding a new era of healthcare.',
    content: 'The one-size-fits-all approach to medicine is becoming a thing of the past. Thanks to AI, doctors can now leverage a patient\'s genetic makeup, lifestyle, and environment to predict disease risk and prescribe highly personalized treatments. AI algorithms can analyze medical images with superhuman accuracy, detect subtle patterns in genomic data to identify cancer markers, and predict how a patient will respond to a particular drug. This not only leads to better patient outcomes but also makes healthcare more efficient. Clinical trials can be designed more effectively, and drug discovery can be accelerated. As data becomes more accessible and algorithms more sophisticated, AI-powered personalized medicine will become the standard of care, transforming our relationship with health and wellness.',
    author: 'Dr. Ben Carter',
    date: '2024-03-01',
    category: 'Technology',
    tags: ['AI', 'Healthcare', 'Medicine', 'Personalized Medicine', 'Genomics'],
    imageUrl: 'https://picsum.photos/seed/technology/800/450',
  },
  {
    slug: 'breakthrough-in-fusion-energy',
    title: 'Scientists Announce Major Breakthrough in Fusion Energy',
    summary: 'A new tokamak reactor design has achieved a net energy gain for the first time in history, paving the way for clean, limitless energy.',
    content: `In a landmark achievement, researchers at the International Fusion Center have announced that their experimental reactor, the "Stellaris-X," has successfully produced more energy than was required to initiate and sustain the reaction. This net energy gain is the holy grail of fusion research, a goal scientists have been pursuing for over 70 years. The reactor sustained the reaction for a full 30 seconds, generating 1.5 megajoules of energy from an input of 1.3 megajoules. The breakthrough is attributed to a novel magnetic confinement system and AI-powered plasma stability controls. While commercial fusion power plants are still decades away, this proves that the fundamental science is sound and offers a beacon of hope for a future powered by clean, safe, and virtually limitless energy.`,
    author: 'Dr. Anya Sharma',
    date: '2024-04-12',
    category: 'Science',
    tags: ['Fusion Energy', 'Clean Energy', 'Physics', 'Science'],
    imageUrl: 'https://picsum.photos/seed/fusion/800/450',
  },
  {
    slug: 'india-digital-payment-revolution',
    title: 'India\'s Digital Payment Revolution Continues to Accelerate',
    summary: 'The Unified Payments Interface (UPI) in India has crossed a new milestone, processing over 10 billion transactions in a single month.',
    content: `India's homegrown digital payments system, the Unified Payments Interface (UPI), continues its meteoric rise. Recent data from the National Payments Corporation of India (NPCI) shows that the platform handled a record-breaking number of transactions, solidifying its position as a global leader in real-time payments. This growth has been fueled by widespread smartphone adoption, affordable data plans, and a government push towards a cashless economy. From street vendors to large corporations, UPI has become the preferred mode of payment for millions of Indians. The success of UPI is now being studied by other countries looking to build their own inclusive and low-cost digital payment infrastructures. The platform's open architecture and interoperability are seen as key factors in its unprecedented success.`,
    author: 'Rohan Mehta',
    date: '2024-03-25',
    category: 'India',
    tags: ['UPI', 'Digital India', 'Fintech', 'Economy'],
    imageUrl: 'https://picsum.photos/seed/india/800/450',
  },
  {
    slug: 'us-tech-giants-face-new-antitrust-scrutiny',
    title: 'US Tech Giants Face New Wave of Antitrust Scrutiny',
    summary: 'The Department of Justice is reportedly preparing new antitrust lawsuits against several major technology companies, focusing on competition in AI and cloud computing.',
    content: `The regulatory pressure on Big Tech in the United States is intensifying. According to sources familiar with the matter, the Department of Justice is in the final stages of preparing new antitrust cases that target alleged monopolistic practices in the burgeoning fields of artificial intelligence and cloud computing. The investigation is said to focus on whether dominant companies are using their market power to stifle smaller competitors and limit consumer choice. This marks a new front in the government's efforts to rein in the power of tech behemoths, moving beyond the traditional focus on search and social media. The outcome of these potential lawsuits could have far-reaching implications for the future of the tech industry and the development of next-generation technologies.`,
    author: 'Jessica Miller',
    date: '2024-04-05',
    category: 'US',
    tags: ['Antitrust', 'Big Tech', 'Regulation', 'US Policy'],
    imageUrl: 'https://picsum.photos/seed/us/800/450',
  },
];