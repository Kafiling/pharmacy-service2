import {
  User, InsertUser,
  Medication, InsertMedication,
  Supplier, InsertSupplier,
  Customer, InsertCustomer,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  SupplyOrder, InsertSupplyOrder,
  SupplyOrderItem, InsertSupplyOrderItem,
  DashboardStats
} from "@shared/schema";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Medications
  getMedications(): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  getLowStockMedications(): Promise<Medication[]>;
  searchMedications(query: string): Promise<Medication[]>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<{order: Order, items: OrderItem[]} | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: 'pending' | 'processing' | 'completed' | 'cancelled'): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getRecentOrders(limit: number): Promise<Order[]>;

  // Supply Orders
  getSupplyOrders(): Promise<SupplyOrder[]>;
  getSupplyOrder(id: number): Promise<SupplyOrder | undefined>;
  getSupplyOrderWithItems(id: number): Promise<{order: SupplyOrder, items: SupplyOrderItem[]} | undefined>;
  createSupplyOrder(order: InsertSupplyOrder, items: InsertSupplyOrderItem[]): Promise<SupplyOrder>;
  updateSupplyOrderStatus(id: number, status: 'pending' | 'ordered' | 'received' | 'cancelled'): Promise<SupplyOrder | undefined>;
  deleteSupplyOrder(id: number): Promise<boolean>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medications: Map<number, Medication>;
  private suppliers: Map<number, Supplier>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  private supplyOrders: Map<number, SupplyOrder>;
  private supplyOrderItems: Map<number, SupplyOrderItem[]>;
  
  private currentUserId: number;
  private currentMedicationId: number;
  private currentSupplierId: number;
  private currentCustomerId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentSupplyOrderId: number;
  private currentSupplyOrderItemId: number;

  constructor() {
    this.users = new Map();
    this.medications = new Map();
    this.suppliers = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.supplyOrders = new Map();
    this.supplyOrderItems = new Map();
    
    this.currentUserId = 1;
    this.currentMedicationId = 1;
    this.currentSupplierId = 1;
    this.currentCustomerId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentSupplyOrderId = 1;
    this.currentSupplyOrderItemId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "password",
      name: "Dr. Sarah Johnson",
      role: "admin",
      email: "admin@pharmacare.com",
      phone: "555-123-4567",
      avatar: "",
    });

    // Create sample suppliers
    const supplier1 = this.createSupplier({
      name: "MedSupply Inc.",
      contactName: "John Williams",
      email: "contact@medsupply.com",
      phone: "555-111-2222",
      address: "123 Medical Way, Pharma City, PC 12345",
      notes: "Primary supplier for antibiotics",
    });

    const supplier2 = this.createSupplier({
      name: "PharmaDirect",
      contactName: "Emily Davis",
      email: "sales@pharmadirect.com",
      phone: "555-333-4444",
      address: "456 Health Street, Medicine Town, MT 67890",
      notes: "Reliable supplier for cardiovascular medications",
    });

    const supplier3 = this.createSupplier({
      name: "GlobalMed",
      contactName: "Robert Chen",
      email: "info@globalmed.com",
      phone: "555-555-6666",
      address: "789 Pharma Road, Drug City, DC 54321",
      notes: "International supplier with competitive prices",
    });

    // Create sample medications
    this.createMedication({
      name: "Amoxicillin",
      category: "antibiotic",
      description: "Common antibiotic used to treat bacterial infections",
      dosage: "500mg",
      price: 12.50,
      currentStock: 10,
      minimumStock: 20,
      unit: "box",
      supplierId: supplier1.id,
    });

    this.createMedication({
      name: "Lisinopril",
      category: "cardiovascular",
      description: "Used to treat high blood pressure and heart failure",
      dosage: "10mg",
      price: 15.75,
      currentStock: 8,
      minimumStock: 15,
      unit: "bottle",
      supplierId: supplier2.id,
    });

    this.createMedication({
      name: "Atorvastatin",
      category: "cardiovascular",
      description: "Used to treat high cholesterol and prevent cardiovascular disease",
      dosage: "20mg",
      price: 22.99,
      currentStock: 12,
      minimumStock: 25,
      unit: "box",
      supplierId: supplier1.id,
    });

    this.createMedication({
      name: "Metformin",
      category: "hormone",
      description: "Used to treat type 2 diabetes",
      dosage: "850mg",
      price: 8.99,
      currentStock: 15,
      minimumStock: 30,
      unit: "bottle",
      supplierId: supplier3.id,
    });

    this.createMedication({
      name: "Ibuprofen",
      category: "analgesic",
      description: "NSAID used to treat pain, fever, and inflammation",
      dosage: "200mg",
      price: 6.99,
      currentStock: 45,
      minimumStock: 20,
      unit: "box",
      supplierId: supplier1.id,
    });

    // Create sample customers
    const customer1 = this.createCustomer({
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "555-123-7890",
      address: "123 Patient St, Healthy Town, HT 12345",
      notes: "Regular customer, has insurance"
    });

    const customer2 = this.createCustomer({
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "555-234-5678",
      address: "456 Wellness Ave, Care City, CC 67890",
      notes: "Has allergies to penicillin"
    });

    const customer3 = this.createCustomer({
      name: "Robert Johnson",
      email: "robert.johnson@email.com",
      phone: "555-345-6789",
      address: "789 Health Blvd, Wellbeing Village, WV 54321",
      notes: "Senior citizen, needs large print labels"
    });

    const customer4 = this.createCustomer({
      name: "Emily Wilson",
      email: "emily.wilson@email.com",
      phone: "555-456-7890",
      address: "101 Recovery Rd, Healing Springs, HS 43210",
      notes: "Prefers text message reminders"
    });

    // Create sample orders
    const orderDate = new Date();
    
    const order1 = this.createOrder({
      orderNumber: "ORD-5392",
      customerId: customer1.id,
      status: "completed",
      totalAmount: 125.00,
      notes: "Regular prescription refill"
    }, [
      {
        orderId: 0, // Will be filled during createOrder
        medicationId: 1,
        quantity: 2,
        unitPrice: 12.50,
        total: 25.00
      },
      {
        orderId: 0,
        medicationId: 5,
        quantity: 5,
        unitPrice: 6.99,
        total: 34.95
      }
    ]);

    const order2 = this.createOrder({
      orderNumber: "ORD-5391",
      customerId: customer2.id,
      status: "processing",
      totalAmount: 78.50,
      notes: "New prescription"
    }, [
      {
        orderId: 0,
        medicationId: 2,
        quantity: 3,
        unitPrice: 15.75,
        total: 47.25
      }
    ]);

    const order3 = this.createOrder({
      orderNumber: "ORD-5390",
      customerId: customer3.id,
      status: "completed",
      totalAmount: 214.75,
      notes: "Monthly medication supply"
    }, [
      {
        orderId: 0,
        medicationId: 3,
        quantity: 2,
        unitPrice: 22.99,
        total: 45.98
      },
      {
        orderId: 0,
        medicationId: 4,
        quantity: 3,
        unitPrice: 8.99,
        total: 26.97
      }
    ]);

    const order4 = this.createOrder({
      orderNumber: "ORD-5389",
      customerId: customer4.id,
      status: "pending",
      totalAmount: 45.20,
      notes: "One-time prescription"
    }, [
      {
        orderId: 0,
        medicationId: 5,
        quantity: 2,
        unitPrice: 6.99,
        total: 13.98
      }
    ]);
  }

  // Users methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Medications methods
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(medicationData: InsertMedication): Promise<Medication> {
    const id = this.currentMedicationId++;
    const medication: Medication = { ...medicationData, id };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: number, medicationData: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updatedMedication = { ...medication, ...medicationData };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }

  async getLowStockMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      (med) => med.currentStock < med.minimumStock
    );
  }

  async searchMedications(query: string): Promise<Medication[]> {
    const lowerCaseQuery = query.toLowerCase();
    return Array.from(this.medications.values()).filter(
      (med) => 
        med.name.toLowerCase().includes(lowerCaseQuery) ||
        med.description?.toLowerCase().includes(lowerCaseQuery) ||
        med.category.toLowerCase().includes(lowerCaseQuery) ||
        med.dosage.toLowerCase().includes(lowerCaseQuery)
    );
  }

  // Suppliers methods
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const id = this.currentSupplierId++;
    const supplier: Supplier = { ...supplierData, id };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: number, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { ...supplier, ...supplierData };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Customers methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { ...customerData, id };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Orders methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderWithItems(id: number): Promise<{order: Order, items: OrderItem[]} | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = this.orderItems.get(id) || [];
    return { order, items };
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...orderData, 
      id,
      date: new Date()
    };
    this.orders.set(id, order);
    
    // Create order items
    const orderItems: OrderItem[] = items.map(item => {
      const itemId = this.currentOrderItemId++;
      return {
        ...item,
        id: itemId,
        orderId: id
      };
    });
    
    this.orderItems.set(id, orderItems);
    
    return order;
  }

  async updateOrderStatus(id: number, status: 'pending' | 'processing' | 'completed' | 'cancelled'): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    this.orderItems.delete(id);
    return this.orders.delete(id);
  }

  async getRecentOrders(limit: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  // Supply Orders methods
  async getSupplyOrders(): Promise<SupplyOrder[]> {
    return Array.from(this.supplyOrders.values());
  }

  async getSupplyOrder(id: number): Promise<SupplyOrder | undefined> {
    return this.supplyOrders.get(id);
  }

  async getSupplyOrderWithItems(id: number): Promise<{order: SupplyOrder, items: SupplyOrderItem[]} | undefined> {
    const order = this.supplyOrders.get(id);
    if (!order) return undefined;
    
    const items = this.supplyOrderItems.get(id) || [];
    return { order, items };
  }

  async createSupplyOrder(orderData: InsertSupplyOrder, items: InsertSupplyOrderItem[]): Promise<SupplyOrder> {
    const id = this.currentSupplyOrderId++;
    const supplyOrder: SupplyOrder = { 
      ...orderData, 
      id,
      orderDate: new Date(),
      receivedDate: null
    };
    this.supplyOrders.set(id, supplyOrder);
    
    // Create supply order items
    const supplyOrderItems: SupplyOrderItem[] = items.map(item => {
      const itemId = this.currentSupplyOrderItemId++;
      return {
        ...item,
        id: itemId,
        supplyOrderId: id
      };
    });
    
    this.supplyOrderItems.set(id, supplyOrderItems);
    
    return supplyOrder;
  }

  async updateSupplyOrderStatus(id: number, status: 'pending' | 'ordered' | 'received' | 'cancelled'): Promise<SupplyOrder | undefined> {
    const order = this.supplyOrders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status,
      receivedDate: status === 'received' ? new Date() : order.receivedDate
    };
    this.supplyOrders.set(id, updatedOrder);
    
    // If received, update medication stock
    if (status === 'received') {
      const items = this.supplyOrderItems.get(id) || [];
      for (const item of items) {
        const medication = this.medications.get(item.medicationId);
        if (medication) {
          const updatedMedication = {
            ...medication,
            currentStock: medication.currentStock + item.quantity
          };
          this.medications.set(medication.id, updatedMedication);
        }
      }
    }
    
    return updatedOrder;
  }

  async deleteSupplyOrder(id: number): Promise<boolean> {
    this.supplyOrderItems.delete(id);
    return this.supplyOrders.delete(id);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const allMedications = await this.getMedications();
    const lowStockItems = await this.getLowStockMedications();
    const recentOrders = await this.getRecentOrders(30); // Last 30 orders for calculations
    
    // Calculate total revenue from today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = recentOrders.filter(
      order => new Date(order.date).getTime() >= today.getTime()
    );
    
    const todaysRevenue = todaysOrders.reduce(
      (sum, order) => sum + order.totalAmount, 0
    );
    
    // Calculate mock growth rates (in a real app, this would compare to previous periods)
    return {
      totalMedications: allMedications.length,
      medicationsGrowth: 3.2,
      todaysOrders: todaysOrders.length,
      ordersGrowth: 12,
      lowStockItems: lowStockItems.length,
      lowStockChange: 2,
      revenue: todaysRevenue,
      revenueGrowth: 8.1,
      salesData: {
        totalSales: 42389,
        customers: 1852,
        orders: 3426,
        avgOrderValue: 64.25
      }
    };
  }
}

export const storage = new MemStorage();
