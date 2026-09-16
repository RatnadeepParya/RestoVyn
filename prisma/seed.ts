import {
  PrismaClient,
  StaffRole,
  StaffStatus,
  TableStatus,
  OrderType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  StockMovementType,
  WastageReason,
} from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  // PBKDF2 standard cryptographic hash (compatible without native compilation dependencies)
  const salt = "restovyn_fixed_salt_for_dev_seed_123";
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function hashPin(pin: string): string {
  const salt = "restovyn_pin_salt_dev_seed";
  return crypto.pbkdf2Sync(pin, salt, 5000, 32, "sha256").toString("hex");
}

async function main() {
  console.log("🌱 Starting RestoVyn database seed...");

  // 1. Roles and Permissions
  const roleNames = Object.values(StaffRole);
  const createdRoles: Record<string, string> = {};

  const permissionsList = [
    "ORDER_CREATE",
    "ORDER_EDIT",
    "ORDER_CANCEL",
    "ORDER_ITEM_CANCEL",
    "ORDER_DISCOUNT",
    "ORDER_VIEW",
    "KOT_CREATE",
    "KOT_CANCEL",
    "PAYMENT_CREATE",
    "PAYMENT_REFUND",
    "PAYMENT_VOID",
    "TABLE_TRANSFER",
    "TABLE_MERGE",
    "INVENTORY_VIEW",
    "INVENTORY_ADJUST",
    "PURCHASE_CREATE",
    "EXPENSE_CREATE",
    "EXPENSE_APPROVE",
    "REPORT_VIEW",
    "REPORT_EXPORT",
    "STAFF_MANAGE",
    "MENU_MANAGE",
    "SETTINGS_MANAGE",
    "DAY_CLOSE",
    "BACKUP_MANAGE",
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { action: perm },
      update: {},
      create: { action: perm, description: `Permission to perform ${perm}` },
    });
  }

  const allPerms = await prisma.permission.findMany();

  for (const roleName of roleNames) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `Default system role for ${roleName}`,
      },
    });
    createdRoles[roleName] = role.id;

    // Link permissions
    let rolePerms = allPerms;
    if (roleName === StaffRole.CAPTAIN) {
      rolePerms = allPerms.filter((p) =>
        [
          "ORDER_CREATE",
          "ORDER_EDIT",
          "ORDER_VIEW",
          "KOT_CREATE",
          "TABLE_TRANSFER",
          "TABLE_MERGE",
        ].includes(p.action),
      );
    } else if (roleName === StaffRole.CASHIER) {
      rolePerms = allPerms.filter((p) =>
        [
          "ORDER_CREATE",
          "ORDER_VIEW",
          "KOT_CREATE",
          "PAYMENT_CREATE",
          "ORDER_DISCOUNT",
        ].includes(p.action),
      );
    } else if (roleName === StaffRole.KITCHEN) {
      rolePerms = allPerms.filter((p) =>
        ["KOT_CREATE", "ORDER_VIEW"].includes(p.action),
      );
    }

    for (const p of rolePerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: p.id,
        },
      });
    }
  }

  // 2. Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { code: "RV-MAIN" },
    update: {},
    create: {
      name: "RestoVyn Fine Dining & Bistro",
      code: "RV-MAIN",
      address: "Plot 42, Park Street, Kolkata, WB - 700016",
      phone: "+91 33 2289 4000",
      email: "contact@restovyn.internal",
      gstin: "19AAACR1234F1Z5",
      currencyCode: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata",
      businessHourStart: "06:00",
      invoicePrefix: "INV-2026-",
      orderPrefix: "ORD-",
      kotPrefix: "KOT-",
    },
  });

  // 3. Printers
  const defaultPrinter = await prisma.printer.create({
    data: {
      restaurantId: restaurant.id,
      name: "Cashier Thermal Printer 80mm",
      printerType: "THERMAL_80MM",
      connectionUri: "tcp://192.168.1.200:9100",
      isDefaultPOS: true,
      assignments: {
        create: [{ role: "RECEIPT" }, { role: "INVOICE" }],
      },
    },
  });

  // 4. Kitchen Stations
  const stations = [
    { name: "Main Kitchen", code: "MAIN" },
    { name: "Tandoor Station", code: "TANDOOR" },
    { name: "Bar & Beverages", code: "BAR" },
    { name: "Dessert & Bakery", code: "DESSERT" },
    { name: "Chinese & Wok", code: "CHINESE" },
  ];

  const stationMap: Record<string, string> = {};
  for (const s of stations) {
    const station = await prisma.kitchenStation.upsert({
      where: {
        restaurantId_code: { restaurantId: restaurant.id, code: s.code },
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        name: s.name,
        code: s.code,
        printerId: defaultPrinter.id,
      },
    });
    stationMap[s.code] = station.id;
  }

  // 5. Staff & Users (20 staff members)
  const defaultPasswordHash = hashPassword("Admin@12345");
  const defaultPinHash = hashPin("1234"); // PIN: 1234

  const staffProfiles = [
    {
      name: "Ratnadeep Parya",
      role: StaffRole.OWNER,
      code: "EMP001",
      username: "ratnadeep",
      email: "owner@restovyn.internal",
      phone: "9876543210",
    },
    {
      name: "Amit Sharma",
      role: StaffRole.MANAGER,
      code: "EMP002",
      username: "amit_manager",
      email: "amit@restovyn.internal",
      phone: "9876543211",
    },
    {
      name: "Priya Mukherjee",
      role: StaffRole.CASHIER,
      code: "EMP003",
      username: "priya_cashier",
      email: "priya@restovyn.internal",
      phone: "9876543212",
    },
    {
      name: "Rahul Sen",
      role: StaffRole.CAPTAIN,
      code: "EMP004",
      username: "rahul_captain",
      email: "rahul@restovyn.internal",
      phone: "9876543213",
    },
    {
      name: "Vikram Das",
      role: StaffRole.CAPTAIN,
      code: "EMP005",
      username: "vikram_captain",
      email: "vikram@restovyn.internal",
      phone: "9876543214",
    },
    {
      name: "Sanjay Roy",
      role: StaffRole.KITCHEN,
      code: "EMP006",
      username: "sanjay_chef",
      email: "sanjay@restovyn.internal",
      phone: "9876543215",
    },
    {
      name: "Debashis Paul",
      role: StaffRole.INVENTORY_MANAGER,
      code: "EMP007",
      username: "debashis_inv",
      email: "debashis@restovyn.internal",
      phone: "9876543216",
    },
    {
      name: "Ananya Guha",
      role: StaffRole.ACCOUNTANT,
      code: "EMP008",
      username: "ananya_acc",
      email: "ananya@restovyn.internal",
      phone: "9876543217",
    },
  ];

  // Fill up to 20 staff members
  for (let i = 9; i <= 20; i++) {
    const role = i % 2 === 0 ? StaffRole.CAPTAIN : StaffRole.KITCHEN;
    staffProfiles.push({
      name: `Staff Member ${i}`,
      role,
      code: `EMP${i.toString().padStart(3, "0")}`,
      username: `staff_${i}`,
      email: `staff${i}@restovyn.internal`,
      phone: `98765432${i.toString().padStart(2, "0")}`,
    });
  }

  const createdStaffList: Array<{ id: string; role: StaffRole; name: string }> =
    [];

  for (const p of staffProfiles) {
    const user = await prisma.user.upsert({
      where: { username: p.username },
      update: {},
      create: {
        username: p.username,
        email: p.email,
        phone: p.phone,
        passwordHash: defaultPasswordHash,
        pinHash: defaultPinHash,
        isActive: true,
      },
    });

    const staff = await prisma.staff.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        restaurantId: restaurant.id,
        userId: user.id,
        roleId: createdRoles[p.role],
        employeeCode: p.code,
        name: p.name,
        phone: p.phone,
        email: p.email,
        status: StaffStatus.ACTIVE,
      },
    });
    createdStaffList.push({ id: staff.id, role: p.role, name: p.name });
  }

  // 6. Floors (3 Floors), Sections & Tables (30 Tables)
  const floorsData = [
    {
      name: "Ground Floor",
      sections: ["AC Dining", "Family Lounge", "Outdoor Courtyard"],
    },
    { name: "First Floor", sections: ["Executive Suite", "Private Dining"] },
    { name: "Rooftop Garden", sections: ["Open Sky Bar", "Cabana Section"] },
  ];

  let tableCounter = 1;
  const createdTables: Array<{ id: string; number: string }> = [];

  for (let fIdx = 0; fIdx < floorsData.length; fIdx++) {
    const fData = floorsData[fIdx];
    const floor = await prisma.floor.create({
      data: {
        restaurantId: restaurant.id,
        name: fData.name,
        sortOrder: fIdx + 1,
      },
    });

    for (const secName of fData.sections) {
      const section = await prisma.section.create({
        data: {
          floorId: floor.id,
          name: secName,
        },
      });

      // 3 to 4 tables per section totaling 30+ tables
      const count = fIdx === 0 ? 4 : 3;
      for (let t = 0; t < count; t++) {
        const tableNum = `T${tableCounter.toString().padStart(2, "0")}`;
        const table = await prisma.table.create({
          data: {
            restaurantId: restaurant.id,
            floorId: floor.id,
            sectionId: section.id,
            tableNumber: tableNum,
            name: `Table ${tableCounter}`,
            capacity: ((tableCounter % 3) + 1) * 2, // 2, 4, or 6 seater
            posX: (t % 3) * 150 + 50,
            posY: Math.floor(t / 3) * 150 + 50,
            status: TableStatus.AVAILABLE,
          },
        });
        createdTables.push({ id: table.id, number: table.tableNumber });
        tableCounter++;
      }
    }
  }

  // 7. Menu Categories (15 Categories) & 100 Menu Items
  const categoryNames = [
    "Soups & Shorbhas",
    "Starters - Veg",
    "Starters - Non Veg",
    "Tandoori Kebabs",
    "Main Course - Paneer & Veg",
    "Main Course - Chicken",
    "Main Course - Mutton",
    "Seafood Specialties",
    "Biryani & Rice",
    "Indian Breads",
    "Chinese Starters",
    "Chinese Mains & Noodles",
    "Desserts & Sweets",
    "Beverages & Mocktails",
    "Hot Teas & Coffees",
  ];

  const createdCategories: Array<{ id: string; name: string }> = [];
  for (let i = 0; i < categoryNames.length; i++) {
    const cat = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        name: categoryNames[i],
        description: `Delightful authentic selections in ${categoryNames[i]}`,
        sortOrder: i + 1,
      },
    });
    createdCategories.push({ id: cat.id, name: cat.name });
  }

  // 100 Menu Items distributed across categories
  const sampleItemsList = [
    { name: "Tomato Dhania Shorba", cat: 0, price: 18000, station: "MAIN" },
    { name: "Murgh Yakhni Shorba", cat: 0, price: 24000, station: "MAIN" },
    { name: "Hot & Sour Veg Soup", cat: 0, price: 19000, station: "CHINESE" },
    {
      name: "Sweet Corn Chicken Soup",
      cat: 0,
      price: 22000,
      station: "CHINESE",
    },
    { name: "Paneer Tikka Shashlik", cat: 1, price: 34000, station: "TANDOOR" },
    { name: "Dahi Ke Kebab", cat: 1, price: 32000, station: "MAIN" },
    {
      name: "Crispy Corn Salt & Pepper",
      cat: 1,
      price: 28000,
      station: "CHINESE",
    },
    { name: "Hara Bhara Kebab", cat: 1, price: 29000, station: "MAIN" },
    { name: "Chicken Seekh Kebab", cat: 2, price: 38000, station: "TANDOOR" },
    {
      name: "Galouti Kebab with Ulta Tawa Paratha",
      cat: 2,
      price: 46000,
      station: "MAIN",
    },
    { name: "Amritsari Fish Fry", cat: 2, price: 42000, station: "MAIN" },
    { name: "Murgh Malai Tikka", cat: 3, price: 41000, station: "TANDOOR" },
    { name: "Tandoori Chicken Full", cat: 3, price: 54000, station: "TANDOOR" },
    { name: "Tandoori Chicken Half", cat: 3, price: 32000, station: "TANDOOR" },
    { name: "Bhatti Da Murgh", cat: 3, price: 42000, station: "TANDOOR" },
    { name: "Paneer Butter Masala", cat: 4, price: 36000, station: "MAIN" },
    { name: "Palak Paneer", cat: 4, price: 34000, station: "MAIN" },
    { name: "Kadhai Paneer", cat: 4, price: 35000, station: "MAIN" },
    {
      name: "Dal Makhani Bukhara Style",
      cat: 4,
      price: 32000,
      station: "MAIN",
    },
    {
      name: "Yellow Dal Tadka Double Chaunk",
      cat: 4,
      price: 26000,
      station: "MAIN",
    },
    {
      name: "Butter Chicken Grand Trunk",
      cat: 5,
      price: 44000,
      station: "MAIN",
    },
    { name: "Chicken Tikka Masala", cat: 5, price: 42000, station: "MAIN" },
    { name: "Kadhai Chicken", cat: 5, price: 41000, station: "MAIN" },
    { name: "Murgh Rara Masala", cat: 5, price: 45000, station: "MAIN" },
    {
      name: "Mutton Rogan Josh Kashmiri",
      cat: 6,
      price: 52000,
      station: "MAIN",
    },
    { name: "Mutton Bhuna Gosht", cat: 6, price: 54000, station: "MAIN" },
    { name: "Mutton Korma Awadhi", cat: 6, price: 56000, station: "MAIN" },
    { name: "Prawn Malai Curry", cat: 7, price: 58000, station: "MAIN" },
    { name: "Fish Tikka Masala", cat: 7, price: 49000, station: "MAIN" },
    {
      name: "Kolkata Dum Chicken Biryani",
      cat: 8,
      price: 38000,
      station: "MAIN",
    },
    {
      name: "Awadhi Mutton Dum Biryani",
      cat: 8,
      price: 48000,
      station: "MAIN",
    },
    { name: "Hyderabadi Veg Biryani", cat: 8, price: 31000, station: "MAIN" },
    { name: "Steamed Basmati Rice", cat: 8, price: 16000, station: "MAIN" },
    {
      name: "Jeera Rice with Desi Ghee",
      cat: 8,
      price: 19000,
      station: "MAIN",
    },
    { name: "Butter Naan", cat: 9, price: 7000, station: "TANDOOR" },
    { name: "Garlic Butter Naan", cat: 9, price: 9000, station: "TANDOOR" },
    { name: "Tandoori Roti", cat: 9, price: 4000, station: "TANDOOR" },
    { name: "Laccha Paratha", cat: 9, price: 8000, station: "TANDOOR" },
    { name: "Chilli Chicken Dry", cat: 10, price: 36000, station: "CHINESE" },
    { name: "Chilli Paneer Dry", cat: 10, price: 31000, station: "CHINESE" },
    { name: "Veg Hakka Noodles", cat: 11, price: 26000, station: "CHINESE" },
    { name: "Chicken Fried Rice", cat: 11, price: 31000, station: "CHINESE" },
    {
      name: "Gulab Jamun with Rabri",
      cat: 12,
      price: 18000,
      station: "DESSERT",
    },
    { name: "Shahi Tukda", cat: 12, price: 21000, station: "DESSERT" },
    { name: "Rasmalai Kesar", cat: 12, price: 19000, station: "DESSERT" },
    {
      name: "Fresh Lime Soda Sweet & Salt",
      cat: 13,
      price: 12000,
      station: "BAR",
    },
    { name: "Virgin Mojito Mint", cat: 13, price: 18000, station: "BAR" },
    { name: "Mango Lassi", cat: 13, price: 16000, station: "BAR" },
    { name: "Masala Chai Kulhad", cat: 14, price: 8000, station: "BAR" },
    {
      name: "Filter Coffee South Indian",
      cat: 14,
      price: 11000,
      station: "BAR",
    },
  ];

  // Extend up to 100 items by generating items across all categories
  for (let extra = sampleItemsList.length + 1; extra <= 100; extra++) {
    const catIdx = extra % 15;
    const stCode =
      catIdx === 9 || catIdx === 3
        ? "TANDOOR"
        : catIdx >= 10 && catIdx <= 11
          ? "CHINESE"
          : catIdx === 12
            ? "DESSERT"
            : catIdx >= 13
              ? "BAR"
              : "MAIN";
    sampleItemsList.push({
      name: `Chef Special Delicacy ${extra}`,
      cat: catIdx,
      price: (200 + (extra % 30) * 10) * 100,
      station: stCode,
    });
  }

  const createdMenuItems: Array<{
    id: string;
    name: string;
    basePrice: number;
  }> = [];

  for (let i = 0; i < sampleItemsList.length; i++) {
    const item = sampleItemsList[i];
    const catId = createdCategories[item.cat].id;
    const stId = stationMap[item.station];

    const menuItem = await prisma.menuItem.create({
      data: {
        categoryId: catId,
        kitchenStationId: stId,
        name: item.name,
        sku: `SKU-${(i + 1).toString().padStart(4, "0")}`,
        description: `Freshly prepared chef specialty ${item.name}`,
        basePrice: item.price,
        taxRatePercent: 5.0,
        prepTimeMinutes: 15 + (i % 10),
        isAvailable: true,
        isFeatured: i < 10,
        // Add variants, modifiers, and addons to selected items
        variants:
          i % 5 === 0
            ? {
                create: [
                  { name: "Regular", priceDelta: 0 },
                  { name: "Large", priceDelta: 8000 },
                ],
              }
            : undefined,
        modifiers:
          i % 4 === 0
            ? {
                create: [
                  { name: "Spice Level", option: "Mild", priceDelta: 0 },
                  { name: "Spice Level", option: "Medium", priceDelta: 0 },
                  { name: "Spice Level", option: "Hot Spicy", priceDelta: 0 },
                ],
              }
            : undefined,
        addons:
          i % 3 === 0
            ? {
                create: [
                  { name: "Extra Butter / Ghee", price: 3000 },
                  { name: "Extra Cheese Topping", price: 5000 },
                ],
              }
            : undefined,
      },
    });
    createdMenuItems.push({
      id: menuItem.id,
      name: menuItem.name,
      basePrice: menuItem.basePrice,
    });
  }

  // 8. Units & Ingredients (20 Ingredients)
  const kg = await prisma.unit.create({
    data: { name: "Kilogram", abbreviation: "kg" },
  });
  const liter = await prisma.unit.create({
    data: { name: "Liter", abbreviation: "l" },
  });
  const gram = await prisma.unit.create({
    data: { name: "Gram", abbreviation: "g" },
  });
  const piece = await prisma.unit.create({
    data: { name: "Piece", abbreviation: "pc" },
  });

  const rawIngredients = [
    { name: "Basmati Rice Premium", unit: kg.id, stock: 150.0, cost: 9500 },
    { name: "Boneless Fresh Chicken", unit: kg.id, stock: 80.0, cost: 24000 },
    { name: "Fresh Paneer Block", unit: kg.id, stock: 45.0, cost: 32000 },
    { name: "Pure Desi Cow Ghee", unit: liter.id, stock: 30.0, cost: 65000 },
    {
      name: "Mustard Oil Cold Pressed",
      unit: liter.id,
      stock: 50.0,
      cost: 16000,
    },
    { name: "Refined Cooking Oil", unit: liter.id, stock: 90.0, cost: 13000 },
    { name: "Onions Fresh Red", unit: kg.id, stock: 120.0, cost: 3500 },
    { name: "Tomatoes Ripe Red", unit: kg.id, stock: 90.0, cost: 4000 },
    { name: "Ginger Paste", unit: kg.id, stock: 25.0, cost: 12000 },
    { name: "Garlic Paste", unit: kg.id, stock: 25.0, cost: 12000 },
    {
      name: "Kashmiri Red Chilli Powder",
      unit: kg.id,
      stock: 15.0,
      cost: 45000,
    },
    { name: "Turmeric Powder Organic", unit: kg.id, stock: 10.0, cost: 25000 },
    { name: "Garam Masala Blend", unit: kg.id, stock: 12.0, cost: 75000 },
    {
      name: "Dairy Amul Butter 500g",
      unit: piece.id,
      stock: 60.0,
      cost: 27500,
    },
    { name: "Fresh Cream 1L", unit: piece.id, stock: 40.0, cost: 21000 },
    { name: "Full Cream Milk", unit: liter.id, stock: 70.0, cost: 6500 },
    { name: "Whole Wheat Atta", unit: kg.id, stock: 100.0, cost: 4200 },
    { name: "Maida Fine Refined", unit: kg.id, stock: 80.0, cost: 3800 },
    { name: "Black Urad Lentils Dal", unit: kg.id, stock: 40.0, cost: 14000 },
    { name: "Fresh Mutton Cuts", unit: kg.id, stock: 35.0, cost: 72000 },
  ];

  const createdIngredients: Array<{ id: string; name: string }> = [];
  for (let i = 0; i < rawIngredients.length; i++) {
    const ing = rawIngredients[i];
    const createdIng = await prisma.ingredient.create({
      data: {
        restaurantId: restaurant.id,
        name: ing.name,
        sku: `ING-${(i + 1).toString().padStart(3, "0")}`,
        unitId: ing.unit,
        currentStock: ing.stock,
        minStockLevel: 10.0,
        costPerUnit: ing.cost,
      },
    });
    createdIngredients.push({ id: createdIng.id, name: createdIng.name });

    // Initial stock movement
    await prisma.stockMovement.create({
      data: {
        ingredientId: createdIng.id,
        movementType: StockMovementType.OPENING_STOCK,
        quantity: ing.stock,
        balanceAfter: ing.stock,
        reason: "Initial opening stock intake",
      },
    });
  }

  // 9. Suppliers (10 Suppliers)
  const supplierNames = [
    "Bengal Agri Farms Ltd",
    "Heritage Poultry & Meats",
    "Amul Dairy Distributors",
    "Golden Spices Wholesalers",
    "Metro Cash & Carry Wholesale",
    "Kolkata Fresh Veggies Co",
    "Ocean Harvest Sea Foods",
    "Shree Krishna Grain Mills",
    "Eastern Beverages Depot",
    "Clean Hygiene Supplies",
  ];

  for (let i = 0; i < supplierNames.length; i++) {
    await prisma.supplier.create({
      data: {
        restaurantId: restaurant.id,
        name: supplierNames[i],
        phone: `+91 33 2450 ${1000 + i}`,
        email: `sales@supplier${i + 1}.internal`,
        address: `Wholesale Market Hub, Yard ${i + 1}, Kolkata`,
        gstin: `19SUPPL${1000 + i}Z1`,
        openingBalance: 0,
        currentBalance: 0,
      },
    });
  }

  // 10. Customers (100 Customers)
  const firstNames = [
    "Aarav",
    "Vivaan",
    "Aditya",
    "Vihaan",
    "Arjun",
    "Sai",
    "Reyansh",
    "Ayaan",
    "Krishna",
    "Ishaan",
    "Diya",
    "Saanvi",
    "Aanya",
    "Aadhya",
    "Pari",
    "Ananya",
    "Myra",
    "Riya",
    "Ira",
    "Avani",
  ];
  const lastNames = [
    "Mukherjee",
    "Banerjee",
    "Chatterjee",
    "Bose",
    "Dutta",
    "Sengupta",
    "Ghosh",
    "Chakraborty",
    "Mitra",
    "Roy",
  ];

  const createdCustomers: Array<{ id: string; name: string; phone: string }> =
    [];
  for (let i = 1; i <= 100; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const cPhone = `9830${i.toString().padStart(6, "0")}`;
    const cust = await prisma.customer.create({
      data: {
        restaurantId: restaurant.id,
        name: `${fn} ${ln}`,
        phone: cPhone,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.internal`,
        totalOrders: i % 5,
        totalSpend: (i % 5) * 85000,
        loyaltyAccount: {
          create: {
            pointsBalance: (i % 5) * 40,
          },
        },
      },
    });
    createdCustomers.push({ id: cust.id, name: cust.name, phone: cust.phone });
  }

  // 11. Sample Active & Completed Orders with Invoices & Payments
  const captains = createdStaffList.filter((s) => s.role === StaffRole.CAPTAIN);
  const sampleCaptain = captains[0];

  for (let o = 1; o <= 5; o++) {
    const table = createdTables[o - 1];
    const customer = createdCustomers[o - 1];

    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        orderNumber: `ORD-2026-${(1000 + o).toString()}`,
        orderType: OrderType.DINE_IN,
        status:
          o === 1
            ? OrderStatus.SERVED
            : o === 2
              ? OrderStatus.CONFIRMED
              : OrderStatus.COMPLETED,
        tableId: table.id,
        captainId: sampleCaptain.id,
        customerId: customer.id,
        subtotal: 76000,
        discountTotal: 0,
        taxTotal: 3800,
        serviceCharge: 3800,
        grandTotal: 83600,
        items: {
          create: [
            {
              menuItemId: createdMenuItems[0].id,
              quantity: 2,
              unitPrice: 18000,
              subtotal: 36000,
              totalPrice: 36000,
            },
            {
              menuItemId: createdMenuItems[4].id,
              quantity: 1,
              unitPrice: 34000,
              subtotal: 34000,
              totalPrice: 34000,
            },
          ],
        },
      },
    });

    if (o > 2) {
      // Completed order with Invoice & Payment
      const invoice = await prisma.invoice.create({
        data: {
          restaurantId: restaurant.id,
          orderId: order.id,
          invoiceNumber: `INV-2026-${(5000 + o).toString()}`,
          customerId: customer.id,
          subtotal: 76000,
          taxTotal: 3800,
          serviceCharge: 3800,
          grandTotal: 83600,
          paidAmount: 83600,
          dueAmount: 0,
          isPaid: true,
          items: {
            create: [
              {
                name: createdMenuItems[0].name,
                quantity: 2,
                unitPrice: 18000,
                totalPrice: 36000,
              },
              {
                name: createdMenuItems[4].name,
                quantity: 1,
                unitPrice: 34000,
                totalPrice: 34000,
              },
            ],
          },
        },
      });

      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          paymentMethod: PaymentMethod.UPI,
          amount: 83600,
          status: PaymentStatus.SUCCESS,
          transactionRef: `UPI-UTR-98765432${o}`,
          receivedBy: sampleCaptain.id,
        },
      });
    }
  }

  // 12. Sample Expenses
  await prisma.expense.create({
    data: {
      restaurantId: restaurant.id,
      category: "Maintenance",
      amount: 450000, // ₹4,500.00
      paymentMethod: PaymentMethod.CASH,
      description: "AC Servicing and Filter Cleaning in Ground Floor Hall",
      createdById: createdStaffList[1].id,
      approvedById: createdStaffList[0].id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`- 1 Restaurant: ${restaurant.name}`);
  console.log(`- 3 Floors, ${createdTables.length} Tables`);
  console.log(`- 15 Categories, 100 Menu Items`);
  console.log(`- 20 Staff Members (Owner: ratnadeep / Admin@12345, PIN: 1234)`);
  console.log(`- 100 Customers with Loyalty Accounts`);
  console.log(`- 20 Ingredients with Initial Stock`);
  console.log(`- 10 Suppliers`);
  console.log(`- Sample Orders & Invoices populated`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
