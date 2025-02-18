import { IStorage } from "./storage";
import { User, Wisper, InsertUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wispers: Map<number, Wisper>;
  private currentUserId: number;
  private currentWisperId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.wispers = new Map();
    this.currentUserId = 1;
    this.currentWisperId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
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
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWispers(): Promise<Wisper[]> {
    return Array.from(this.wispers.values());
  }

  async createWisper(wisper: { content: string; userId: number }): Promise<Wisper> {
    const id = this.currentWisperId++;
    const newWisper: Wisper = {
      id,
      content: wisper.content,
      userId: wisper.userId,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
    };
    this.wispers.set(id, newWisper);
    return newWisper;
  }

  async upvoteWisper(id: number): Promise<Wisper | undefined> {
    const wisper = this.wispers.get(id);
    if (!wisper) return undefined;
    
    const updated = { ...wisper, upvotes: wisper.upvotes + 1 };
    this.wispers.set(id, updated);
    return updated;
  }

  async downvoteWisper(id: number): Promise<Wisper | undefined> {
    const wisper = this.wispers.get(id);
    if (!wisper) return undefined;
    
    const updated = { ...wisper, downvotes: wisper.downvotes + 1 };
    this.wispers.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
