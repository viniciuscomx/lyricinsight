import { users, lyricsAnalyses, type User, type InsertUser, type LyricsAnalysis, type InsertLyricsAnalysis } from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createLyricsAnalysis(analysis: Omit<LyricsAnalysis, 'id' | 'createdAt'>): Promise<LyricsAnalysis>;
  getLyricsAnalysis(id: number): Promise<LyricsAnalysis | undefined>;
  getLyricsAnalysisByHash(hash: string): Promise<LyricsAnalysis | undefined>;
  getRecentAnalyses(limit?: number): Promise<LyricsAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<number, LyricsAnalysis>;
  private lyricsHashToId: Map<string, number>;
  private currentUserId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.lyricsHashToId = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLyricsAnalysis(analysis: Omit<LyricsAnalysis, 'id' | 'createdAt'>): Promise<LyricsAnalysis> {
    const id = this.currentAnalysisId++;
    const createdAt = new Date();
    const fullAnalysis: LyricsAnalysis = { 
      ...analysis, 
      id, 
      createdAt 
    };
    const hash = crypto.createHash("sha256").update(analysis.lyrics).digest("hex");
    this.lyricsHashToId.set(hash, id);
    this.analyses.set(id, fullAnalysis);
    return fullAnalysis;
  }

  async getLyricsAnalysis(id: number): Promise<LyricsAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getLyricsAnalysisByHash(hash: string): Promise<LyricsAnalysis | undefined> {
    const id = this.lyricsHashToId.get(hash);
    if (id) return this.analyses.get(id);
    return undefined;
  }

  async getRecentAnalyses(limit: number = 10): Promise<LyricsAnalysis[]> {
    const analyses = Array.from(this.analyses.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
    return analyses;
  }
}

export const storage = new MemStorage();
