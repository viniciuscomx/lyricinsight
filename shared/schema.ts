import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
// Certifique-se de que o pacote 'zod' está instalado corretamente:
// npm install zod

import { z } from "zod";

// Tipos devem vir antes do uso em $type<>
export interface Reference {
  title: string;
  description: string;
  icon: string;
}

export interface Curiosity {
  title: string;
  description: string;
  icon: string;
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const lyricsAnalyses = pgTable("lyrics_analyses", {
  id: serial("id").primaryKey(),
  lyrics: text("lyrics").notNull(),
  songTitle: text("song_title"), // .notNull() se necessário
  artist: text("artist"),
  references: json("references").$type<Reference[]>(), // $type precisa dos tipos acima
  curiosities: json("curiosities").$type<Curiosity[]>(),
  authorIntention: text("author_intention"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLyricsAnalysisSchema = createInsertSchema(lyricsAnalyses).pick({
  lyrics: true,
  songTitle: true,
  artist: true,
  references: true,
  curiosities: true,
  authorIntention: true,
});

export const analysisRequestSchema = z.object({
  lyrics: z.string().min(50, "A letra deve ter pelo menos 50 caracteres"),
  songTitle: z.string().optional(),
  artist: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LyricsAnalysis = typeof lyricsAnalyses.$inferSelect;
export type InsertLyricsAnalysis = z.infer<typeof insertLyricsAnalysisSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
// Não há necessidade de alterar este arquivo para o problema do campo 'id'.
