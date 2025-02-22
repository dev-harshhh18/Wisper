import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertWisperSchema, insertCommentSchema } from "@shared/schema";

const clients = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    if (!req.url) return;

    const userId = parseInt(new URLSearchParams(req.url.split('?')[1]).get('userId') || '0');
    if (userId) {
      clients.set(userId, ws);

      ws.on('close', () => {
        clients.delete(userId);
      });
    }
  });

  // Helper function to send notifications
  async function sendNotification(userId: number, type: string, content: string, wisperId: number) {
    const notification = await storage.createNotification({
      userId,
      type,
      content,
      wisperId,
    });

    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
    }
  }

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

  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const notifications = await storage.getNotifications(req.user.id);
    res.json(notifications);
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.markNotificationAsRead(parseInt(req.params.id));
    res.sendStatus(200);
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

    const wisper = await storage.upvoteWisper(parseInt(req.params.id), req.user.id);
    if (!wisper) return res.sendStatus(404);

    // Send notification to the wisper author
    if (wisper.userId !== req.user.id) {
      await sendNotification(
        wisper.userId,
        'like',
        `Someone liked your wisper: "${wisper.content.slice(0, 50)}..."`,
        wisper.id
      );
    }

    res.json(wisper);
  });

  app.post("/api/wispers/:id/remove-upvote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const wisper = await storage.removeUpvote(parseInt(req.params.id), req.user.id);
    if (!wisper) return res.sendStatus(404);

    res.json(wisper);
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

    const wisper = await storage.getWisper(parseInt(req.params.id));
    if (wisper && wisper.userId !== req.user.id) {
      await sendNotification(
        wisper.userId,
        'comment',
        `Someone commented on your wisper: "${wisper.content.slice(0, 50)}..."`,
        wisper.id
      );
    }

    res.status(201).json(comment);
  });

  app.get("/api/wispers/:id/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.id));
    res.json(comments);
  });

  app.delete("/api/wispers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteWisper(parseInt(req.params.id));
    
    // Get updated wispers list after deletion
    const wispers = await storage.getWispers();
    res.json(wispers);
  });

  return httpServer;
}