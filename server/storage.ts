import { IStorage } from "./storage";
import { users, wispers, type User, type Wisper, type InsertUser } from "@shared/schema";
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

  async getWispers(): Promise<Wisper[]> {
    return await db.select().from(wispers);
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

    const [updatedWisper] = await db
      .update(wispers)
      .set({ upvotes: Math.max(0, wisper.upvotes - 1) })
      .where(eq(wispers.id, id))
      .returning();

    return updatedWisper;
  }
}

export const storage = new DatabaseStorage();