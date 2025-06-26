import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { analysisRequestSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

async function analyzeLyrics(lyrics: string) {
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (!HUGGINGFACE_API_KEY) throw new Error("HUGGINGFACE_API_KEY não definida no ambiente");

  // Use modelo público alternativo
  const endpoint = "https://api-inference.huggingface.co/models/facebook/opt-1.3b";
  const prompt = `Analyze these song lyrics in English and identify:
1. Cultural, historical, or literary references
2. Curiosities about the composition
3. Author's intention

Lyrics: """${lyrics.substring(0, 1000)}"""

Analysis:`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status} ${await response.text()}`);
  }

  const result = await response.json();
  if (Array.isArray(result) && result[0]?.generated_text) {
    return result[0].generated_text;
  }
  if (typeof result.generated_text === "string") {
    return result.generated_text;
  }
  return "Analysis not available.";
}

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

      // Chama a HuggingFace e monta o objeto de análise
      const analysisText = await analyzeLyrics(lyrics);

      const storedAnalysis = await storage.createLyricsAnalysis({
        lyrics,
        songTitle: null,
        artist: null,
        references: [
          { title: "AI Analysis", description: analysisText, icon: "🤖" }
        ],
        curiosities: [],
        authorIntention: analysisText,
      });

      res.json({
        id: storedAnalysis.id,
        lyrics,
        songTitle: null,
        artist: null,
        references: [
          { title: "AI Analysis", description: analysisText, icon: "🤖" }
        ],
        curiosities: [],
        authorIntention: analysisText,
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
