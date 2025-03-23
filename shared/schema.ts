import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (staff members)
export const userRoleEnum = pgEnum('user_role', ['admin', 'pharmacist', 'staff']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default('staff'),
  email: text("email"),
  phone: text("phone"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Medications
export const medicationCategoryEnum = pgEnum('medication_category', [
  'antibiotic', 'analgesic', 'antiviral', 'antihistamine', 
  'cardiovascular', 'dermatological', 'gastrointestinal', 
  'hormone', 'respiratory', 'vitamin', 'other'
]);

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: medicationCategoryEnum("category").notNull(),
  description: text("description"),
  dosage: text("dosage").notNull(),
  price: real("price").notNull(),
  currentStock: integer("current_stock").notNull(),
  minimumStock: integer("minimum_stock").notNull().default(20),
  unit: text("unit").notNull(), // e.g., "box", "bottle", "tablet"
  supplierId: integer("supplier_id").notNull(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  notes: text("notes"),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
});

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  notes: text("notes"),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
});

// Orders
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'cancelled']);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  customerId: integer("customer_id").notNull(),
  status: orderStatusEnum("status").notNull().default('pending'),
  totalAmount: real("total_amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  date: true,
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  medicationId: integer("medication_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  total: real("total").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Supply Orders
export const supplyOrderStatusEnum = pgEnum('supply_order_status', ['pending', 'ordered', 'received', 'cancelled']);

export const supplyOrders = pgTable("supply_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  supplierId: integer("supplier_id").notNull(),
  status: supplyOrderStatusEnum("status").notNull().default('pending'),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  receivedDate: timestamp("received_date"),
  totalAmount: real("total_amount").notNull(),
  notes: text("notes"),
});

export const insertSupplyOrderSchema = createInsertSchema(supplyOrders).omit({
  id: true,
  orderDate: true,
  receivedDate: true,
});

// Supply Order Items
export const supplyOrderItems = pgTable("supply_order_items", {
  id: serial("id").primaryKey(),
  supplyOrderId: integer("supply_order_id").notNull(),
  medicationId: integer("medication_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  total: real("total").notNull(),
});

export const insertSupplyOrderItemSchema = createInsertSchema(supplyOrderItems).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type SupplyOrder = typeof supplyOrders.$inferSelect;
export type InsertSupplyOrder = z.infer<typeof insertSupplyOrderSchema>;

export type SupplyOrderItem = typeof supplyOrderItems.$inferSelect;
export type InsertSupplyOrderItem = z.infer<typeof insertSupplyOrderItemSchema>;

// Dashboard stats type
export type DashboardStats = {
  totalMedications: number;
  medicationsGrowth: number;
  todaysOrders: number;
  ordersGrowth: number;
  lowStockItems: number;
  lowStockChange: number;
  revenue: number;
  revenueGrowth: number;
  salesData: {
    totalSales: number;
    customers: number;
    orders: number;
    avgOrderValue: number;
  }
};
