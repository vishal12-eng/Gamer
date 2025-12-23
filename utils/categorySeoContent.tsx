/* ======================================================
   CATEGORY SEO CONTENT
   - Used only on CategoryPage.tsx
   - Page=1 only (pagination safe)
   - Google-friendly, non-spam
====================================================== */

export interface CategorySEOConfig {
  title: string;
  description: string;
  keywords: string[];
  content: string[];
  faqs?: { question: string; answer: string }[];
}

export const CATEGORY_SEO: Record<string, CategorySEOConfig> = {
  ai: {
    title: "AI News, Tools & Artificial Intelligence Trends (2026)",
    description:
      "Latest AI news, tools, and artificial intelligence trends. Explore how AI is shaping creators, businesses, and future technology.",
    keywords: [
      "ai news",
      "artificial intelligence",
      "ai tools",
      "machine learning",
      "future ai trends"
    ],
    content: [
      "Artificial Intelligence (AI) is rapidly transforming the way technology, businesses, and digital creators operate. From automation and generative AI to machine learning and enterprise adoption, AI is becoming a core driver of innovation.",
      "The AI category on FutureTechJournal features curated articles on AI tools, research updates, ethical discussions, and real-world use cases. These insights help readers understand how artificial intelligence is shaping productivity, decision-making, and the future of digital growth."
    ],
    faqs: [
      {
        question: "What type of content is published in the AI category?",
        answer:
          "The AI category covers AI tools, artificial intelligence news, machine learning updates, and future AI trends."
      },
      {
        question: "Is the AI category suitable for beginners?",
        answer:
          "Yes, the content is written for beginners, creators, professionals, and businesses."
      }
    ]
  },

  technology: {
    title: "Technology News, Software & Emerging Tech Trends (2026)",
    description:
      "Technology news covering software, hardware, cybersecurity, startups, and emerging tech shaping the digital future.",
    keywords: [
      "technology news",
      "emerging technology",
      "software updates",
      "future technology",
      "tech innovation"
    ],
    content: [
      "Technology continues to evolve at an unprecedented pace, influencing how people work, communicate, and innovate. Advances in software, hardware, cybersecurity, and digital infrastructure are shaping the modern digital world.",
      "The Technology category on FutureTechJournal provides in-depth coverage of product launches, industry shifts, and emerging tech trends, helping readers stay informed about innovations defining the future."
    ]
  },

  business: {
    title: "Business & Startup News | Technology-Driven Growth",
    description:
      "Business news covering startups, digital transformation, innovation, and technology-driven market trends.",
    keywords: [
      "business news",
      "startup ecosystem",
      "digital transformation",
      "tech business trends"
    ],
    content: [
      "Modern businesses are increasingly shaped by technology, innovation, and digital transformation. From startups to enterprises, companies rely on technology to scale, compete, and adapt.",
      "The Business category explores how organizations respond to market changes, leverage technology, and build sustainable growth strategies in a fast-changing global economy."
    ]
  },

  product: {
    title: "Technology Products, Apps & Software Updates",
    description:
      "Latest technology products, apps, and software updates shaping user experience and digital innovation.",
    keywords: [
      "tech products",
      "software updates",
      "new apps",
      "digital products"
    ],
    content: [
      "Technology products and digital platforms play a critical role in everyday life. From apps and SaaS tools to consumer software, product innovation drives user experience and productivity.",
      "The Product category reviews and analyzes new launches, feature updates, and digital tools, helping readers understand which products are shaping the future of technology."
    ]
  },

  science: {
    title: "Science News & Research Driving Future Innovation",
    description:
      "Science news covering research, discoveries, and innovations shaping technology and global progress.",
    keywords: [
      "science news",
      "scientific research",
      "future innovation",
      "technology and science"
    ],
    content: [
      "Scientific research forms the foundation of technological and societal advancement. Breakthroughs in science influence innovation across industries, from healthcare to environmental sustainability.",
      "The Science category highlights discoveries, studies, and research developments that contribute to long-term technological progress and future innovation."
    ]
  },

  entertainment: {
    title: "Digital Entertainment, Streaming & Creator Economy",
    description:
      "Entertainment news covering streaming platforms, gaming, creators, and digital media trends.",
    keywords: [
      "digital entertainment",
      "streaming platforms",
      "gaming industry",
      "creator economy"
    ],
    content: [
      "Entertainment is increasingly driven by technology and digital platforms. Streaming services, gaming, and creator-led media are redefining how audiences consume content.",
      "The Entertainment category explores trends in digital media, gaming innovation, and the creator economy, highlighting how technology is transforming entertainment experiences."
    ]
  },

  india: {
    title: "India Technology, Startup & Digital Growth News",
    description:
      "India-focused technology, startup, and innovation news covering digital growth and policy updates.",
    keywords: [
      "india tech news",
      "indian startups",
      "digital india",
      "technology in india"
    ],
    content: [
      "India is rapidly emerging as a global technology and startup hub. Digital infrastructure, innovation, and policy initiatives are driving growth across industries.",
      "The India category covers technology trends, startup developments, and digital initiatives shaping India’s role in the global tech ecosystem."
    ]
  },

  us: {
    title: "US Technology & Innovation News with Global Impact",
    description:
      "US technology and innovation news covering Silicon Valley, enterprise tech, and digital markets.",
    keywords: [
      "us tech news",
      "silicon valley",
      "enterprise technology",
      "technology innovation usa"
    ],
    content: [
      "The United States plays a major role in shaping global technology and innovation trends. Developments in enterprise software, regulation, and digital platforms influence markets worldwide.",
      "The US category tracks key technology and business updates from the United States, helping readers understand trends with international impact."
    ]
  }
};
