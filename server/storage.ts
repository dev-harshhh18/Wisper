import { IStorage } from "./storage";
import { users, wispers, votes, type User, type Wisper, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

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
      .set({ upvotes: wisper.upvotes + 1 })
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
      .set({ upvotes: Math.max(0, wisper.upvotes - 1) })
      .where(eq(wispers.id, id))
      .returning();

    return updatedWisper;
  }

  async getUserVotes(userId: number): Promise<number[]> {
    const userVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.userId, userId));

    return userVotes.map(vote => vote.wisperId);
  }
}

export const storage = new DatabaseStorage();