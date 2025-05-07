import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
});

// Vehicle table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  fuelType: text("fuel_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  userId: true,
  make: true,
  model: true,
  registrationNumber: true,
  fuelType: true,
});

// RFID Tag table
export const rfidTags = pgTable("rfid_tags", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  tagNumber: text("tag_number").notNull().unique(),
  status: text("status").notNull(), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRfidTagSchema = createInsertSchema(rfidTags).pick({
  vehicleId: true,
  tagNumber: true,
  status: true,
});

// Fuel Station table
export const fuelStations = pgTable("fuel_stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
  hasRfid: boolean("has_rfid").notNull().default(false),
  operationalHours: text("operational_hours").notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFuelStationSchema = createInsertSchema(fuelStations).pick({
  name: true,
  address: true,
  city: true,
  latitude: true,
  longitude: true,
  hasRfid: true,
  operationalHours: true,
  rating: true,
});

// Fuel Prices table
export const fuelPrices = pgTable("fuel_prices", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").notNull().references(() => fuelStations.id),
  fuelType: text("fuel_type").notNull(), // petrol, diesel, cng
  price: decimal("price", { precision: 6, scale: 2 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
});

export const insertFuelPriceSchema = createInsertSchema(fuelPrices).pick({
  stationId: true,
  fuelType: true,
  price: true,
  effectiveDate: true,
});

// Payment Method table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // card, upi, wallet
  details: jsonb("details").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  userId: true,
  type: true,
  details: true,
  isDefault: true,
});

// Wallet table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  autoReloadEnabled: boolean("auto_reload_enabled").notNull().default(false),
  autoReloadThreshold: decimal("auto_reload_threshold", { precision: 10, scale: 2 }),
  autoReloadAmount: decimal("auto_reload_amount", { precision: 10, scale: 2 }),
  autoReloadPaymentMethodId: integer("auto_reload_payment_method_id").references(() => paymentMethods.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  balance: true,
  autoReloadEnabled: true,
  autoReloadThreshold: true,
  autoReloadAmount: true,
  autoReloadPaymentMethodId: true,
});

// Transaction table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  stationId: integer("station_id").references(() => fuelStations.id),
  fuelType: text("fuel_type").notNull(),
  quantity: decimal("quantity", { precision: 6, scale: 2 }).notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 6, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  paymentType: text("payment_type").notNull(), // rfid, card, upi, cash
  status: text("status").notNull(), // pending, completed, failed
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  transactionId: true,
  userId: true,
  vehicleId: true,
  stationId: true,
  fuelType: true,
  quantity: true,
  pricePerUnit: true,
  totalAmount: true,
  paymentMethodId: true,
  paymentType: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type RfidTag = typeof rfidTags.$inferSelect;
export type InsertRfidTag = z.infer<typeof insertRfidTagSchema>;

export type FuelStation = typeof fuelStations.$inferSelect;
export type InsertFuelStation = z.infer<typeof insertFuelStationSchema>;

export type FuelPrice = typeof fuelPrices.$inferSelect;
export type InsertFuelPrice = z.infer<typeof insertFuelPriceSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
