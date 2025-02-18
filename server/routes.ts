import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertWisperSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/wispers", async (_req, res) => {
    const wispers = await storage.getWispers();
    res.json(wispers);
  });

  app.post("/api/wispers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parseResult = insertWisperSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const wisper = await storage.createWisper({
      ...parseResult.data,
      userId: req.user.id,
    });
    
    res.status(201).json(wisper);
  });

  app.post("/api/wispers/:id/upvote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const wisper = await storage.upvoteWisper(parseInt(req.params.id));
    if (!wisper) return res.sendStatus(404);
    
    res.json(wisper);
  });

  app.post("/api/wispers/:id/downvote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const wisper = await storage.downvoteWisper(parseInt(req.params.id));
    if (!wisper) return res.sendStatus(404);
    
    res.json(wisper);
  });

  const httpServer = createServer(app);
  return httpServer;
}
