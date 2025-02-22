import { users, wispers, votes, notifications, comments, type User, type Wisper, type InsertUser, type Notification, type Comment } from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, asc, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getUserWispers(userId: number): Promise<Wisper[]>;
  getVotedWispers(userId: number): Promise<Wisper[]>;
  getWispers(): Promise<(Wisper & { hasVoted?: boolean })[]>;
  getWisperWithVote(wisperId: number, userId: number): Promise<{ wisper: Wisper; hasVoted: boolean }>;
  getWisper(id: number): Promise<Wisper | undefined>;
  createWisper(wisper: { content: string; userId: number }): Promise<Wisper>;
  deleteWisper(id: number): Promise<void>;
  upvoteWisper(id: number, userId: number): Promise<Wisper | undefined>;
  removeUpvote(id: number, userId: number): Promise<Wisper | undefined>;
  getUserVotes(userId: number): Promise<number[]>;
  getComments(wisperId: number): Promise<Comment[]>;
  createComment(comment: { content: string; userId: number; wisperId: number }): Promise<Comment>;
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: { userId: number; type: string; content: string; wisperId: number }): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserWispers(userId: number): Promise<Wisper[]> {
    return await db.select().from(wispers).where(eq(wispers.userId, userId));
  }

  async getVotedWispers(userId: number): Promise<Wisper[]> {
    const userVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.userId, userId));

    const wisperIds = userVotes
      .map(vote => vote.wisperId)
      .filter((id): id is number => id !== null);

    if (wisperIds.length === 0) return [];

    return await db
      .select()
      .from(wispers)
      .where(inArray(wispers.id, wisperIds));
  }

  async getWispers(): Promise<(Wisper & { hasVoted?: boolean })[]> {
    const allWispers = await db.select().from(wispers);
    return allWispers;
  }

  async getWisperWithVote(wisperId: number, userId: number): Promise<{ wisper: Wisper; hasVoted: boolean }> {
    const [wisper] = await db.select().from(wispers).where(eq(wispers.id, wisperId));
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.wisperId, wisperId), eq(votes.userId, userId)));

    return {
      wisper,
      hasVoted: !!vote,
    };
  }

  async getWisper(id: number): Promise<Wisper | undefined> {
    const [wisper] = await db.select().from(wispers).where(eq(wispers.id, id));
    return wisper;
  }

  async createWisper(wisper: { content: string; userId: number }): Promise<Wisper> {
    const [newWisper] = await db
      .insert(wispers)
      .values({
        content: wisper.content,
        userId: wisper.userId,
        upvotes: 0,
        downvotes: 0,
      })
      .returning();
    return newWisper;
  }

  async deleteWisper(id: number): Promise<void> {
    // First delete associated votes and comments
    await db.delete(votes).where(eq(votes.wisperId, id));
    await db.delete(comments).where(eq(comments.wisperId, id));
    // Then delete the wisper itself
    await db.delete(wispers).where(eq(wispers.id, id));
  }

  async upvoteWisper(id: number, userId: number): Promise<Wisper | undefined> {
    const [wisper] = await db
      .select()
      .from(wispers)
      .where(eq(wispers.id, id));

    if (!wisper) return undefined;

    // Check if user has already voted
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.wisperId, id), eq(votes.userId, userId)));

    if (existingVote) return wisper;

    // Create new vote
    await db.insert(votes).values({
      userId,
      wisperId: id,
      voteType: 'upvote'
    });

    const [updatedWisper] = await db
      .update(wispers)
      .set({ upvotes: (wisper.upvotes || 0) + 1 })
      .where(eq(wispers.id, id))
      .returning();

    return updatedWisper;
  }

  async removeUpvote(id: number, userId: number): Promise<Wisper | undefined> {
    const [wisper] = await db
      .select()
      .from(wispers)
      .where(eq(wispers.id, id));

    if (!wisper) return undefined;

    // Remove vote
    await db
      .delete(votes)
      .where(and(eq(votes.wisperId, id), eq(votes.userId, userId)));

    const [updatedWisper] = await db
      .update(wispers)
      .set({ upvotes: Math.max(0, (wisper.upvotes || 0) - 1) })
      .where(eq(wispers.id, id))
      .returning();

    return updatedWisper;
  }

  async getUserVotes(userId: number): Promise<number[]> {
    const userVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.userId, userId));

    return userVotes
      .map(vote => vote.wisperId)
      .filter((id): id is number => id !== null);
  }

  async getComments(wisperId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.wisperId, wisperId))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(comment: { content: string; userId: number; wisperId: number }): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: { userId: number; type: string; content: string; wisperId: number }): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();