import { IStorage } from "./storage";
import { User, Wisper, InsertUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

interface Vote {
  userId: number;
  wisperId: number;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wispers: Map<number, Wisper>;
  private votes: Vote[];
  private currentUserId: number;
  private currentWisperId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.wispers = new Map();
    this.votes = [];
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

  async getWisper(id: number): Promise<Wisper | undefined> {
    return this.wispers.get(id);
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

  async deleteWisper(id: number): Promise<void> {
    this.wispers.delete(id);
    this.votes = this.votes.filter(vote => vote.wisperId !== id);
  }

  async upvoteWisper(id: number, userId: number): Promise<Wisper | undefined> {
    const wisper = this.wispers.get(id);
    if (!wisper) return undefined;

    const existingVote = this.votes.find(
      v => v.userId === userId && v.wisperId === id
    );

    if (existingVote) return wisper;

    this.votes.push({ userId, wisperId: id });
    const updated = { ...wisper, upvotes: this.votes.filter(v => v.wisperId === id).length };
    this.wispers.set(id, updated);
    return updated;
  }

  async removeUpvote(id: number, userId: number): Promise<Wisper | undefined> {
    const wisper = this.wispers.get(id);
    if (!wisper) return undefined;

    this.votes = this.votes.filter(
      v => !(v.userId === userId && v.wisperId === id)
    );

    const updated = { ...wisper, upvotes: this.votes.filter(v => v.wisperId === id).length };
    this.wispers.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();