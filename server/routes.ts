import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertWisperSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/wispers", async (_req, res) => {
    const wispers = await storage.getWispers();
    res.json(wispers);
  });

  app.get("/api/user/wispers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const wispers = await storage.getUserWispers(req.user.id);
    res.json(wispers);
  });

  app.get("/api/user/voted-wispers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const wispers = await storage.getVotedWispers(req.user.id);
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

  app.delete("/api/wispers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const wisper = await storage.getWisper(parseInt(req.params.id));
    if (!wisper) return res.sendStatus(404);
    if (wisper.userId !== req.user.id) return res.sendStatus(403);

    await storage.deleteWisper(wisper.id);
    res.sendStatus(204);
  });

  app.get("/api/user/votes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const votes = await storage.getUserVotes(req.user.id);
    res.json(votes);
  });

  app.post("/api/wispers/:id/upvote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const wisper = await storage.upvoteWisper(parseInt(req.params.id), req.user.id);
    if (!wisper) return res.sendStatus(404);

    res.json(wisper);
  });

  app.post("/api/wispers/:id/remove-upvote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const wisper = await storage.removeUpvote(parseInt(req.params.id), req.user.id);
    if (!wisper) return res.sendStatus(404);

    res.json(wisper);
  });

  // New comment endpoints
  app.get("/api/wispers/:id/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.id));
    res.json(comments);
  });

  app.post("/api/wispers/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parseResult = insertCommentSchema.safeParse({
      ...req.body,
      wisperId: parseInt(req.params.id),
    });

    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const comment = await storage.createComment({
      ...parseResult.data,
      userId: req.user.id,
    });

    res.status(201).json(comment);
  });

  const httpServer = createServer(app);
  return httpServer;
}