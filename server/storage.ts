import {
  type Medication, type InsertMedication,
  type Customer, type InsertCustomer,
  type Supplier, type InsertSupplier,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Staff, type InsertStaff,
  type OrderWithItems, type MedicationWithSupplier
} from "@shared/schema";

export interface IStorage {
  // Medication methods
  getMedications(): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  getLowStockMedications(): Promise<MedicationWithSupplier[]>;
  
  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Supplier methods
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getOrderWithItems(id: number): Promise<OrderWithItems | undefined>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  getRecentOrders(limit: number): Promise<OrderWithItems[]>;
  
  // Staff methods
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  getStaffByEmail(email: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalMedications: number;
    todaysOrders: number;
    todaysRevenue: number;
    lowStockItems: number;
  }>;
}

export class MemStorage implements IStorage {
  private medications: Map<number, Medication>;
  private customers: Map<number, Customer>;
  private suppliers: Map<number, Supplier>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private staffMembers: Map<number, Staff>;
  
  private medicationId: number;
  private customerId: number;
  private supplierId: number;
  private orderId: number;
  private orderItemId: number;
  private staffId: number;
  
  constructor() {
    this.medications = new Map();
    this.customers = new Map();
    this.suppliers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.staffMembers = new Map();
    
    this.medicationId = 1;
    this.customerId = 1;
    this.supplierId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.staffId = 1;
    
    // Add sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add sample suppliers
    const supplier1 = this.createSupplier({
      name: "ABC Pharma Suppliers",
      contactPerson: "John Smith",
      email: "john@abcpharma.com",
      phone: "+1-555-123-4567",
      address: "123 Pharma St, MedCity"
    });
    
    const supplier2 = this.createSupplier({
      name: "MediWholesale Inc.",
      contactPerson: "Jane Doe",
      email: "jane@mediwholesale.com",
      phone: "+1-555-987-6543",
      address: "456 Health Ave, Pharmville"
    });
    
    const supplier3 = this.createSupplier({
      name: "PharmaDirect Solutions",
      contactPerson: "Robert Johnson",
      email: "robert@pharmadirect.com",
      phone: "+1-555-567-8901",
      address: "789 Medicine Rd, Pilltown"
    });
    
    // Add sample medications
    this.createMedication({
      name: "Amoxicillin 500mg",
      description: "Antibiotic used to treat bacterial infections",
      dosage: "500mg",
      category: "Antibiotic",
      stock: 5,
      minStock: 20,
      price: "8.99",
      expiryDate: new Date("2025-12-31"),
      supplierId: supplier1.id
    });
    
    this.createMedication({
      name: "Ibuprofen 200mg",
      description: "Non-steroidal anti-inflammatory drug",
      dosage: "200mg",
      category: "Pain Relief",
      stock: 15,
      minStock: 25,
      price: "5.49",
      expiryDate: new Date("2026-06-30"),
      supplierId: supplier2.id
    });
    
    this.createMedication({
      name: "Metformin 850mg",
      description: "Oral medication for type 2 diabetes",
      dosage: "850mg",
      category: "Diabetes",
      stock: 3,
      minStock: 15,
      price: "12.99",
      expiryDate: new Date("2024-09-15"),
      supplierId: supplier3.id
    });
    
    this.createMedication({
      name: "Lisinopril 10mg",
      description: "ACE inhibitor for high blood pressure",
      dosage: "10mg",
      category: "Cardiovascular",
      stock: 30,
      minStock: 20,
      price: "9.75",
      expiryDate: new Date("2025-10-01"),
      supplierId: supplier1.id
    });
    
    this.createMedication({
      name: "Atorvastatin 20mg",
      description: "Statin medication to lower cholesterol",
      dosage: "20mg",
      category: "Cardiovascular",
      stock: 22,
      minStock: 15,
      price: "14.50",
      expiryDate: new Date("2025-08-15"),
      supplierId: supplier2.id
    });
    
    // Add sample customers
    const customer1 = this.createCustomer({
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1-555-111-2222",
      address: "101 Patient St, Healthville"
    });
    
    const customer2 = this.createCustomer({
      name: "James Peterson",
      email: "james@example.com",
      phone: "+1-555-333-4444",
      address: "202 Wellness Blvd, Careville"
    });
    
    const customer3 = this.createCustomer({
      name: "Robert Chen",
      email: "robert@example.com",
      phone: "+1-555-555-6666",
      address: "303 Recovery Ln, Medtown"
    });
    
    // Add sample orders
    const order1 = this.createOrder({
      customerId: customer1.id,
      totalAmount: "42.50",
      status: "completed",
      notes: "Regular customer",
      prescription: "Required - On file"
    }, [
      {
        orderId: 0, // Will be set in the method
        medicationId: 1,
        quantity: 2,
        price: "17.98"
      },
      {
        orderId: 0, // Will be set in the method
        medicationId: 2,
        quantity: 1,
        price: "5.49"
      },
      {
        orderId: 0, // Will be set in the method
        medicationId: 5,
        quantity: 1,
        price: "14.50"
      }
    ]);
    
    const order2 = this.createOrder({
      customerId: customer2.id,
      totalAmount: "36.75",
      status: "processing",
      notes: "First-time customer",
      prescription: "Required - New"
    }, [
      {
        orderId: 0, // Will be set in the method
        medicationId: 3,
        quantity: 1,
        price: "12.99"
      },
      {
        orderId: 0, // Will be set in the method
        medicationId: 4,
        quantity: 1,
        price: "9.75"
      },
      {
        orderId: 0, // Will be set in the method
        medicationId: 2,
        quantity: 2,
        price: "10.98"
      }
    ]);
    
    // Add staff
    this.createStaff({
      name: "Dr. Jane Doe",
      email: "jane@pharmasys.com",
      password: "hashed_password_here",
      role: "pharmacist"
    });
  }
  
  // Medication methods
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }
  
  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }
  
  async createMedication(medication: InsertMedication): Promise<Medication> {
    const id = this.medicationId++;
    const newMedication = { ...medication, id };
    this.medications.set(id, newMedication);
    return newMedication;
  }
  
  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    const existingMedication = this.medications.get(id);
    if (!existingMedication) return undefined;
    
    const updatedMedication = { ...existingMedication, ...medication };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }
  
  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }
  
  async getLowStockMedications(): Promise<MedicationWithSupplier[]> {
    const meds = Array.from(this.medications.values());
    const lowStock = meds.filter(med => med.stock < med.minStock);
    
    return Promise.all(lowStock.map(async med => {
      const supplier = await this.getSupplier(med.supplierId);
      return {
        ...med,
        supplier: supplier!
      };
    }));
  }
  
  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const newCustomer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }
  
  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer = { ...existingCustomer, ...customer };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }
  
  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }
  
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierId++;
    const newSupplier = { ...supplier, id };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }
  
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existingSupplier = this.suppliers.get(id);
    if (!existingSupplier) return undefined;
    
    const updatedSupplier = { ...existingSupplier, ...supplier };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }
  
  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const newOrder = { ...order, id, createdAt: new Date() };
    this.orders.set(id, newOrder);
    
    // Add order items
    for (const item of orderItems) {
      const orderItemId = this.orderItemId++;
      const newOrderItem = { ...item, id: orderItemId, orderId: id };
      this.orderItems.set(orderItemId, newOrderItem);
      
      // Update medication stock
      const medication = await this.getMedication(item.medicationId);
      if (medication) {
        await this.updateMedication(item.medicationId, {
          stock: medication.stock - item.quantity
        });
      }
    }
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, status: status as any };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async deleteOrder(id: number): Promise<boolean> {
    // First, delete all associated order items
    const allOrderItems = Array.from(this.orderItems.values());
    const orderItemsToDelete = allOrderItems.filter(item => item.orderId === id);
    
    for (const item of orderItemsToDelete) {
      this.orderItems.delete(item.id);
    }
    
    return this.orders.delete(id);
  }
  
  async getOrderWithItems(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const allOrderItems = Array.from(this.orderItems.values());
    const items = allOrderItems.filter(item => item.orderId === id);
    
    const itemsWithMedication = await Promise.all(items.map(async item => {
      const medication = await this.getMedication(item.medicationId);
      return { ...item, medication: medication! };
    }));
    
    const customer = await this.getCustomer(order.customerId);
    
    return {
      ...order,
      items: itemsWithMedication,
      customer: customer!
    };
  }
  
  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    const allOrders = Array.from(this.orders.values());
    return allOrders.filter(order => order.customerId === customerId);
  }
  
  async getRecentOrders(limit: number): Promise<OrderWithItems[]> {
    const allOrders = Array.from(this.orders.values());
    const sortedOrders = [...allOrders].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    const limitedOrders = sortedOrders.slice(0, limit);
    
    return Promise.all(limitedOrders.map(order => this.getOrderWithItems(order.id) as Promise<OrderWithItems>));
  }
  
  // Staff methods
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staffMembers.values());
  }
  
  async getStaffMember(id: number): Promise<Staff | undefined> {
    return this.staffMembers.get(id);
  }
  
  async getStaffByEmail(email: string): Promise<Staff | undefined> {
    const allStaff = Array.from(this.staffMembers.values());
    return allStaff.find(staff => staff.email === email);
  }
  
  async createStaff(staff: InsertStaff): Promise<Staff> {
    const id = this.staffId++;
    const newStaff = { ...staff, id };
    this.staffMembers.set(id, newStaff);
    return newStaff;
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalMedications: number;
    todaysOrders: number;
    todaysRevenue: number;
    lowStockItems: number;
  }> {
    const medications = await this.getMedications();
    const lowStockItems = await this.getLowStockMedications();
    
    const allOrders = Array.from(this.orders.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
    
    const todaysRevenue = todaysOrders.reduce((total, order) => {
      return total + Number(order.totalAmount);
    }, 0);
    
    return {
      totalMedications: medications.length,
      todaysOrders: todaysOrders.length,
      todaysRevenue,
      lowStockItems: lowStockItems.length
    };
  }
}

export const storage = new MemStorage();
