import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const expandedArticles = pgTable("expanded_articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  originalTitle: text("original_title").notNull(),
  originalContent: text("original_content").notNull(),
  expandedContent: text("expanded_content").notNull(),
  category: text("category").notNull(),
  wordCount: integer("word_count").notNull(),
  readabilityScore: integer("readability_score"),
  
  // SEO Metadata
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  focusKeyword: text("focus_keyword"),
  keywords: jsonb("keywords").$type<string[]>(),
  
  // Links
  internalLinks: jsonb("internal_links").$type<Array<{text: string, url: string, category: string}>>(),
  externalLinks: jsonb("external_links").$type<Array<{text: string, url: string, source: string}>>(),
  
  // Image SEO
  imageAltTexts: jsonb("image_alt_texts").$type<string[]>(),
  
  // FAQ Section
  faq: jsonb("faq").$type<Array<{question: string, answer: string}>>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ExpandedArticle = typeof expandedArticles.$inferSelect;
export type InsertExpandedArticle = typeof expandedArticles.$inferInsert;
