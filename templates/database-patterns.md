# Database Patterns

This template provides patterns for database operations, connection management, and ORM usage to ensure reliable and efficient data access.

## Connection Patterns

### 1. MongoDB with Mongoose
```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = connectDB;
```

### 2. PostgreSQL with Prisma
```javascript
// lib/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'minimal',
});

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDB };
```

### 3. PostgreSQL with pg Pool
```javascript
// config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;
```

## CRUD Patterns

### 1. Mongoose CRUD
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  roles: [{ type: String }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// services/userService.js
class UserService {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id).select('-passwordHash');
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async update(id, updates) {
    return await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async list(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filters)
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filters)
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new UserService();
```

### 2. Prisma CRUD
```javascript
// services/userService.js
const { prisma } = require('../lib/prisma');

class UserService {
  async create(data) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true
      }
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        roles: true
      }
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    });
  }

  async delete(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }

  async list(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where: filters })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new UserService();
```

### 3. Raw SQL with pg
```javascript
// services/userService.js
const pool = require('../config/db');

class UserService {
  async create(userData) {
    const { email, name, passwordHash } = userData;
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, name, passwordHash]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT id, email, name, is_active, roles FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

    const result = await pool.query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING id, email, name, is_active`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  async list(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        'SELECT id, email, name, is_active, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      pool.query('SELECT COUNT(*) FROM users')
    ]);

    return {
      users: dataResult.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }
}

module.exports = new UserService();
```

## Transaction Patterns

### 1. Mongoose Transactions
```javascript
// services/orderService.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

async function createOrder(orderData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create order
    const [order] = await Order.create([orderData], { session });

    // Update product inventory
    for (const item of orderData.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { createOrder };
```

### 2. Prisma Transactions
```javascript
// services/orderService.js
const { prisma } = require('../lib/prisma');

async function createOrder(orderData) {
  return await prisma.$transaction(async (tx) => {
    // Create order
    const order = await tx.order.create({
      data: {
        userId: orderData.userId,
        total: orderData.total,
        items: {
          create: orderData.items
        }
      }
    });

    // Update product inventory
    for (const item of orderData.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    return order;
  });
}

module.exports = { createOrder };
```

### 3. PostgreSQL Transactions
```javascript
// services/orderService.js
const pool = require('../config/db');

async function createOrder(orderData) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
      [orderData.userId, orderData.total]
    );
    const orderId = orderResult.rows[0].id;

    // Insert order items and update inventory
    for (const item of orderData.items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.quantity, item.price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');
    return { id: orderId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { createOrder };
```

## Query Optimization Patterns

### 1. Indexing
```javascript
// models/User.js (Mongoose)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: 'text' });

// Prisma Schema
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())

  @@index([createdAt])
  @@index([name])
}
```

### 2. Eager Loading
```javascript
// Mongoose
const user = await User.findById(id)
  .populate('orders')
  .populate('profile');

// Prisma
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    orders: true,
    profile: true
  }
});
```

### 3. Projection/Selection
```javascript
// Mongoose - only select needed fields
const users = await User.find().select('name email');

// Prisma - only select needed fields
const users = await prisma.user.findMany({
  select: {
    name: true,
    email: true
  }
});
```

## Repository Pattern

```javascript
// repositories/BaseRepository.js
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(conditions) {
    return await this.model.findOne(conditions);
  }

  async findMany(conditions = {}, options = {}) {
    return await this.model.find(conditions, null, options);
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(conditions = {}) {
    return await this.model.countDocuments(conditions);
  }
}

// repositories/UserRepository.js
const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  async findActiveUsers() {
    return await this.model.find({ isActive: true });
  }
}

module.exports = new UserRepository();
```
