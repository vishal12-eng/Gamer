import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const expandedArticles = pgTable("expanded_articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  originalTitle: text("original_title").notNull(),
  originalContent: text("original_content").notNull(),
  expandedContent: text("expanded_content").notNull(),
  category: text("category").notNull(),
  wordCount: integer("word_count").notNull(),
  readabilityScore: integer("readability_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ExpandedArticle = typeof expandedArticles.$inferSelect;
export type InsertExpandedArticle = typeof expandedArticles.$inferInsert;
