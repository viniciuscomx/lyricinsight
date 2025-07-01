import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisRequestSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { analyzeLyrics } from "./lyricsAnalysis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze lyrics endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { lyrics } = analysisRequestSchema.parse(req.body);
      if (lyrics.length > 2000) {
        return res.status(400).json({ message: "Letra muito longa. Limite de 2000 caracteres." });
      }
      const hash = crypto.createHash("sha256").update(lyrics).digest("hex");
      const cached = await storage.getLyricsAnalysisByHash(hash);
      if (cached) {
        return res.json({
          id: cached.id,
          songTitle: cached.songTitle,
          artist: cached.artist,
          references: cached.references,
          curiosities: cached.curiosities,
          authorIntention: cached.authorIntention,
        });
      }

      // Use a função analyzeLyrics do Gemini
      const analysis = await analyzeLyrics(lyrics);

      const storedAnalysis = await storage.createLyricsAnalysis({
        lyrics,
        songTitle: null,
        artist: null,
        references: analysis.references,
        curiosities: analysis.curiosities,
        authorIntention: analysis.authorIntention,
      });

      res.json({
        id: storedAnalysis.id,
        lyrics,
        songTitle: null,
        artist: null,
        references: analysis.references,
        curiosities: analysis.curiosities,
        authorIntention: analysis.authorIntention,
        createdAt: storedAnalysis.createdAt
      });
    } catch (error) {
      console.error("Analysis error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        if (error instanceof Error && error.stack) {
          console.error("Stack trace:", error.stack);
        }
        res.status(500).json({
          message: error instanceof Error ? error.message : "Erro interno do servidor"
        });
      }
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getLyricsAnalysis(id);
      
      if (!analysis) {
        res.status(404).json({ message: "Análise não encontrada" });
        return;
      }

      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get recent analyses
  app.get("/api/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      console.error("Get recent analyses error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
