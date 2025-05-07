import { users, User, InsertUser, vehicles, Vehicle, InsertVehicle, rfidTags, RfidTag, InsertRfidTag, fuelStations, FuelStation, InsertFuelStation, fuelPrices, FuelPrice, InsertFuelPrice, paymentMethods, PaymentMethod, InsertPaymentMethod, wallets, Wallet, InsertWallet, transactions, Transaction, InsertTransaction } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import { eq, and, gte, lte, or, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Configure memory store for sessions
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByUser(userId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;

  // RFID tag operations
  getRfidTag(id: number): Promise<RfidTag | undefined>;
  getRfidTagByNumber(tagNumber: string): Promise<RfidTag | undefined>;
  getRfidTagsByVehicle(vehicleId: number): Promise<RfidTag[]>;
  createRfidTag(tag: InsertRfidTag): Promise<RfidTag>;
  updateRfidTag(id: number, tag: Partial<InsertRfidTag>): Promise<RfidTag | undefined>;

  // Fuel station operations
  getFuelStation(id: number): Promise<FuelStation | undefined>;
  getAllFuelStations(): Promise<FuelStation[]>;
  getNearbyFuelStations(lat: number, lng: number, radius: number): Promise<FuelStation[]>;
  createFuelStation(station: InsertFuelStation): Promise<FuelStation>;
  
  // Fuel price operations
  getFuelPrice(id: number): Promise<FuelPrice | undefined>;
  getFuelPricesByStation(stationId: number): Promise<FuelPrice[]>;
  createFuelPrice(price: InsertFuelPrice): Promise<FuelPrice>;

  // Payment method operations
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]>;
  getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;

  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUser(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined>;
  addToWalletBalance(userId: number, amount: number): Promise<Wallet | undefined>;

  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getTransactionsByVehicle(vehicleId: number): Promise<Transaction[]>;
  getTransactionsByStation(stationId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;

  // Session store
  sessionStore: any; // Using any type for SessionStore to avoid importing issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private rfidTags: Map<number, RfidTag>;
  private fuelStations: Map<number, FuelStation>;
  private fuelPrices: Map<number, FuelPrice>;
  private paymentMethods: Map<number, PaymentMethod>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentVehicleId: number;
  currentRfidTagId: number;
  currentFuelStationId: number;
  currentFuelPriceId: number;
  currentPaymentMethodId: number;
  currentWalletId: number;
  currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.rfidTags = new Map();
    this.fuelStations = new Map();
    this.fuelPrices = new Map();
    this.paymentMethods = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.currentUserId = 1;
    this.currentVehicleId = 1;
    this.currentRfidTagId = 1;
    this.currentFuelStationId = 1;
    this.currentFuelPriceId = 1;
    this.currentPaymentMethodId = 1;
    this.currentWalletId = 1;
    this.currentTransactionId = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  // Initialize some sample data
  private initializeData() {
    // Add a few fuel stations
    this.createFuelStation({
      name: "HP Fuel Station",
      address: "123 Main Street, Andheri East",
      city: "Mumbai",
      latitude: 19.1136,
      longitude: 72.8697,
      hasRfid: true,
      operationalHours: "24x7",
      rating: 4.5,
    });
    
    this.createFuelStation({
      name: "Indian Oil",
      address: "456 Link Road, Bandra West",
      city: "Mumbai",
      latitude: 19.0596,
      longitude: 72.8295,
      hasRfid: true,
      operationalHours: "6:00 AM - 10:00 PM",
      rating: 4.2,
    });
    
    this.createFuelStation({
      name: "Bharat Petroleum",
      address: "789 Beach Road, Juhu",
      city: "Mumbai",
      latitude: 19.1075,
      longitude: 72.8263,
      hasRfid: false,
      operationalHours: "24x7",
      rating: 4.0,
    });
    
    // Add fuel prices
    this.createFuelPrice({
      stationId: 1,
      fuelType: "Petrol",
      price: 90.5,
      effectiveDate: new Date(),
    });
    
    this.createFuelPrice({
      stationId: 1,
      fuelType: "Diesel",
      price: 85.2,
      effectiveDate: new Date(),
    });
    
    this.createFuelPrice({
      stationId: 2,
      fuelType: "Petrol",
      price: 89.8,
      effectiveDate: new Date(),
    });
    
    this.createFuelPrice({
      stationId: 2,
      fuelType: "Diesel",
      price: 84.5,
      effectiveDate: new Date(),
    });
    
    this.createFuelPrice({
      stationId: 3,
      fuelType: "Petrol",
      price: 91.2,
      effectiveDate: new Date(),
    });
    
    this.createFuelPrice({
      stationId: 3,
      fuelType: "Diesel",
      price: 86.0,
      effectiveDate: new Date(),
    });
  }

  // User operations
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
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    
    // Create a wallet for the user
    await this.createWallet({
      userId: id,
      balance: 0,
      autoReloadEnabled: false,
      autoReloadThreshold: null,
      autoReloadAmount: null,
      autoReloadPaymentMethodId: null,
    });
    
    return user;
  }

  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehiclesByUser(userId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      (vehicle) => vehicle.userId === userId,
    );
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const createdAt = new Date();
    const vehicle: Vehicle = { ...insertVehicle, id, createdAt };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const existingVehicle = await this.getVehicle(id);
    if (!existingVehicle) return undefined;
    
    const updatedVehicle = { ...existingVehicle, ...vehicle };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // RFID tag operations
  async getRfidTag(id: number): Promise<RfidTag | undefined> {
    return this.rfidTags.get(id);
  }

  async getRfidTagByNumber(tagNumber: string): Promise<RfidTag | undefined> {
    return Array.from(this.rfidTags.values()).find(
      (tag) => tag.tagNumber === tagNumber,
    );
  }

  async getRfidTagsByVehicle(vehicleId: number): Promise<RfidTag[]> {
    return Array.from(this.rfidTags.values()).filter(
      (tag) => tag.vehicleId === vehicleId,
    );
  }

  async createRfidTag(insertTag: InsertRfidTag): Promise<RfidTag> {
    const id = this.currentRfidTagId++;
    const createdAt = new Date();
    const tag: RfidTag = { ...insertTag, id, createdAt };
    this.rfidTags.set(id, tag);
    return tag;
  }

  async updateRfidTag(id: number, tag: Partial<InsertRfidTag>): Promise<RfidTag | undefined> {
    const existingTag = await this.getRfidTag(id);
    if (!existingTag) return undefined;
    
    const updatedTag = { ...existingTag, ...tag };
    this.rfidTags.set(id, updatedTag);
    return updatedTag;
  }

  // Fuel station operations
  async getFuelStation(id: number): Promise<FuelStation | undefined> {
    return this.fuelStations.get(id);
  }

  async getAllFuelStations(): Promise<FuelStation[]> {
    return Array.from(this.fuelStations.values());
  }

  async getNearbyFuelStations(lat: number, lng: number, radius: number): Promise<FuelStation[]> {
    // Simple implementation without actual geo calculations
    // In a real system, this would use proper geospatial queries
    return Array.from(this.fuelStations.values()).slice(0, 5);
  }

  async createFuelStation(insertStation: InsertFuelStation): Promise<FuelStation> {
    const id = this.currentFuelStationId++;
    const createdAt = new Date();
    const station: FuelStation = { ...insertStation, id, createdAt };
    this.fuelStations.set(id, station);
    return station;
  }

  // Fuel price operations
  async getFuelPrice(id: number): Promise<FuelPrice | undefined> {
    return this.fuelPrices.get(id);
  }

  async getFuelPricesByStation(stationId: number): Promise<FuelPrice[]> {
    return Array.from(this.fuelPrices.values()).filter(
      (price) => price.stationId === stationId,
    );
  }

  async createFuelPrice(insertPrice: InsertFuelPrice): Promise<FuelPrice> {
    const id = this.currentFuelPriceId++;
    const price: FuelPrice = { ...insertPrice, id };
    this.fuelPrices.set(id, price);
    return price;
  }

  // Payment method operations
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(
      (method) => method.userId === userId,
    );
  }

  async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined> {
    return Array.from(this.paymentMethods.values()).find(
      (method) => method.userId === userId && method.isDefault,
    );
  }

  async createPaymentMethod(insertMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.currentPaymentMethodId++;
    const createdAt = new Date();
    const method: PaymentMethod = { ...insertMethod, id, createdAt };
    
    // If this is the first payment method or is marked as default, ensure it's the only default
    if (insertMethod.isDefault) {
      // Remove default flag from all other payment methods for this user
      const userMethods = await this.getPaymentMethodsByUser(insertMethod.userId);
      for (const existingMethod of userMethods) {
        if (existingMethod.isDefault) {
          await this.updatePaymentMethod(existingMethod.id, { isDefault: false });
        }
      }
    }
    
    this.paymentMethods.set(id, method);
    return method;
  }

  async updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const existingMethod = await this.getPaymentMethod(id);
    if (!existingMethod) return undefined;
    
    // If updating to make this the default, remove default from others
    if (method.isDefault) {
      const userMethods = await this.getPaymentMethodsByUser(existingMethod.userId);
      for (const otherMethod of userMethods) {
        if (otherMethod.id !== id && otherMethod.isDefault) {
          await this.updatePaymentMethod(otherMethod.id, { isDefault: false });
        }
      }
    }
    
    const updatedMethod = { ...existingMethod, ...method };
    this.paymentMethods.set(id, updatedMethod);
    return updatedMethod;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByUser(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.userId === userId,
    );
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.currentWalletId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const wallet: Wallet = { ...insertWallet, id, createdAt, updatedAt };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined> {
    const existingWallet = await this.getWallet(id);
    if (!existingWallet) return undefined;
    
    const updatedWallet = { 
      ...existingWallet, 
      ...wallet, 
      updatedAt: new Date() 
    };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  async addToWalletBalance(userId: number, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWalletByUser(userId);
    if (!wallet) return undefined;
    
    const newBalance = Number(wallet.balance) + amount;
    return this.updateWallet(wallet.id, { balance: newBalance });
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (transaction) => transaction.transactionId === transactionId,
    );
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getTransactionsByVehicle(vehicleId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.vehicleId === vehicleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getTransactionsByStation(stationId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.stationId === stationId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const timestamp = new Date();
    const transactionId = insertTransaction.transactionId || `FT-${Date.now()}${id}`;
    
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      transactionId,
      timestamp 
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = await this.getTransaction(id);
    if (!existingTransaction) return undefined;
    
    const updatedTransaction = { ...existingTransaction, ...transaction };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    const PgStore = connectPg(session);
    this.sessionStore = new PgStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log("DatabaseStorage createUser called with:", insertUser);
    
    try {
      const [user] = await db.insert(users).values({
        ...insertUser,
        createdAt: new Date(),
      }).returning();
      
      console.log("User created in database:", user);
      
      // Create a wallet for the user
      try {
        const wallet = await this.createWallet({
          userId: user.id,
          balance: "0",
          autoReloadEnabled: false,
          autoReloadThreshold: null,
          autoReloadAmount: null,
          autoReloadPaymentMethodId: null,
        });
        console.log("Wallet created for user:", wallet);
      } catch (error) {
        console.error("Error creating wallet:", error);
      }
      
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehiclesByUser(userId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values({
      ...insertVehicle,
      createdAt: new Date(),
    }).returning();
    return vehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db.update(vehicles)
      .set(vehicle)
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount > 0;
  }

  // RFID tag operations
  async getRfidTag(id: number): Promise<RfidTag | undefined> {
    const [tag] = await db.select().from(rfidTags).where(eq(rfidTags.id, id));
    return tag;
  }

  async getRfidTagByNumber(tagNumber: string): Promise<RfidTag | undefined> {
    const [tag] = await db.select().from(rfidTags).where(eq(rfidTags.tagNumber, tagNumber));
    return tag;
  }

  async getRfidTagsByVehicle(vehicleId: number): Promise<RfidTag[]> {
    return await db.select().from(rfidTags).where(eq(rfidTags.vehicleId, vehicleId));
  }

  async createRfidTag(insertTag: InsertRfidTag): Promise<RfidTag> {
    const [tag] = await db.insert(rfidTags).values({
      ...insertTag,
      createdAt: new Date(),
    }).returning();
    return tag;
  }

  async updateRfidTag(id: number, tag: Partial<InsertRfidTag>): Promise<RfidTag | undefined> {
    const [updatedTag] = await db.update(rfidTags)
      .set(tag)
      .where(eq(rfidTags.id, id))
      .returning();
    return updatedTag;
  }

  // Fuel station operations
  async getFuelStation(id: number): Promise<FuelStation | undefined> {
    const [station] = await db.select().from(fuelStations).where(eq(fuelStations.id, id));
    return station;
  }

  async getAllFuelStations(): Promise<FuelStation[]> {
    return await db.select().from(fuelStations);
  }

  async getNearbyFuelStations(lat: number, lng: number, radius: number): Promise<FuelStation[]> {
    // A simple approximation - in reality you'd use a geospatial index
    // This is just getting all stations which is fine for a demo
    return await db.select().from(fuelStations);
  }

  async createFuelStation(insertStation: InsertFuelStation): Promise<FuelStation> {
    const [station] = await db.insert(fuelStations).values({
      ...insertStation,
      createdAt: new Date(),
    }).returning();
    return station;
  }

  // Fuel price operations
  async getFuelPrice(id: number): Promise<FuelPrice | undefined> {
    const [price] = await db.select().from(fuelPrices).where(eq(fuelPrices.id, id));
    return price;
  }

  async getFuelPricesByStation(stationId: number): Promise<FuelPrice[]> {
    return await db.select().from(fuelPrices).where(eq(fuelPrices.stationId, stationId));
  }

  async createFuelPrice(insertPrice: InsertFuelPrice): Promise<FuelPrice> {
    const [price] = await db.insert(fuelPrices).values(insertPrice).returning();
    return price;
  }

  // Payment method operations
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return method;
  }

  async getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
  }

  async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods)
      .where(and(
        eq(paymentMethods.userId, userId),
        eq(paymentMethods.isDefault, true)
      ));
    return method;
  }

  async createPaymentMethod(insertMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    // If this is marked as default, remove default from other payment methods
    if (insertMethod.isDefault) {
      await db.update(paymentMethods)
        .set({ isDefault: false })
        .where(and(
          eq(paymentMethods.userId, insertMethod.userId),
          eq(paymentMethods.isDefault, true)
        ));
    }
    
    const [method] = await db.insert(paymentMethods).values({
      ...insertMethod,
      createdAt: new Date(),
    }).returning();
    
    return method;
  }

  async updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    // If updating to make this the default, remove default from others
    if (method.isDefault) {
      const [existingMethod] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
      if (existingMethod) {
        await db.update(paymentMethods)
          .set({ isDefault: false })
          .where(and(
            eq(paymentMethods.userId, existingMethod.userId),
            eq(paymentMethods.isDefault, true),
            sql`${paymentMethods.id} != ${id}`
          ));
      }
    }
    
    const [updatedMethod] = await db.update(paymentMethods)
      .set(method)
      .where(eq(paymentMethods.id, id))
      .returning();
    
    return updatedMethod;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return result.rowCount > 0;
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getWalletByUser(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const now = new Date();
    const [wallet] = await db.insert(wallets).values({
      ...insertWallet,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return wallet;
  }

  async updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined> {
    const [updatedWallet] = await db.update(wallets)
      .set({
        ...wallet,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, id))
      .returning();
    
    return updatedWallet;
  }

  async addToWalletBalance(userId: number, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWalletByUser(userId);
    if (!wallet) return undefined;
    
    const newBalance = Number(wallet.balance) + amount;
    return this.updateWallet(wallet.id, { balance: newBalance });
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.transactionId, transactionId));
    return transaction;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
  }

  async getTransactionsByVehicle(vehicleId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.vehicleId, vehicleId))
      .orderBy(desc(transactions.timestamp));
  }

  async getTransactionsByStation(stationId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.stationId, stationId))
      .orderBy(desc(transactions.timestamp));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const transactionId = insertTransaction.transactionId || `FT-${Date.now()}`;
    
    const [transaction] = await db.insert(transactions).values({
      ...insertTransaction,
      transactionId,
      timestamp: new Date(),
    }).returning();
    
    return transaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db.update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    
    return updatedTransaction;
  }
}

export const storage = new DatabaseStorage();
