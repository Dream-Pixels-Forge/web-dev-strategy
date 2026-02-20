# Skill : Gestion des Données & Persistance - Web Dev Strategist Edition

Focus sur l'intégrité des données, l'optimisation des requêtes et les meilleures pratiques pour la gestion de la persistance.

## 1. Choix Technologiques 

* **Relationnel :** PostgreSQL avec Prisma ORM (performance supérieure, TypeScript-first)
* **NoSQL :** MongoDB avec Mongoose (flexibilité pour données non-structurées)
* **Hybride :** Support multi-database pour applications complexes
* **Edge Computing :** Prisma Accelerate pour les applications globales

## 2. Architecture de Schéma Optimisée

### Design Patterns Principaux

```prisma
// User model with best practices
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String?  @unique @db.VarChar(50)
  name      String?
  avatar    String?  @db.VarChar(255)
  emailVerifiedAt DateTime?
  password  String
  role      Role     @default(USER)
  status    UserStatus @default(ACTIVE)
  
  // Audit fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  
  // Relations (optimized)
  posts    Post[]   @relation("UserPosts")
  profile  Profile?
  sessions Session[]
  
  // Indexes for performance
  @@index([email])
  @@index([status, createdAt])
  @@index([role])
  @@map("users")
}

// Profile model (one-to-one)
model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  bio         String?  @db.Text
  website     String?  @db.VarChar(255)
  location    String?  @db.VarChar(100)
  timezone    String   @default("UTC") @db.VarChar(50)
  language    String   @default("en") @db.VarChar(5)
  theme       Theme    @default(LIGHT)
  notifications NotificationSettings @default({})
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("profiles")
}

// Post model with optimized relations
model Post {
  id          String     @id @default(cuid())
  title       String     @db.VarChar(200)
  slug        String     @unique @db.VarChar(200)
  content     String?    @db.Text
  excerpt     String?    @db.VarChar(500)
  status      PostStatus @default(DRAFT)
  featured    Boolean    @default(false)
  publishedAt DateTime?
  
  // SEO fields
  metaTitle   String?    @db.VarChar(60)
  metaDescription String? @db.VarChar(160)
  metaImage   String?    @db.VarChar(255)
  
  // Relations with proper foreign keys
  authorId    String
  author      User       @relation("UserPosts", fields: [authorId], references: [id], onDelete: Cascade)
  
  categories  PostCategory[]
  tags        PostTag[]
  comments    Comment[]
  
  // Audit fields
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?
  
  // Performance indexes
  @@index([authorId, status, publishedAt])
  @@index([status, featured, publishedAt])
  @@index([slug])
  @@map("posts")
}

// Enum definitions for type safety
enum Role {
  USER
  ADMIN
  MODERATOR
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

// JSON type for complex settings
type NotificationSettings = {
  email: Boolean
  push: Boolean
  marketing: Boolean
  comments: Boolean
  mentions: Boolean
}
```

## 3. Optimisation des Requêtes Avancée

### Prévention du Problème N+1

```typescript
// ❌ Bad: Causes N+1 queries
const getAllPosts = async () => {
  const posts = await prisma.post.findMany({ where: { status: 'PUBLISHED' } });
  
  // This will cause N+1 queries!
  for (const post of posts) {
    post.author = await prisma.user.findUnique({ where: { id: post.authorId } });
  }
  
  return posts;
};

// ✅ Good: Uses include to prevent N+1
const getAllPostsOptimized = async () => {
  return await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });
};

// ✅ Even better: Selective include with pagination
const getPostsWithPagination = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.post.count({
      where: { status: 'PUBLISHED' },
    }),
  ]);
  
  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};
```

### Requêtes Complexes et Agrégations

```typescript
// Advanced filtering and search
const searchPosts = async (params: {
  query?: string;
  category?: string;
  author?: string;
  dateRange?: { from: Date; to: Date };
  page?: number;
  limit?: number;
}) => {
  const { query, category, author, dateRange, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;
  
  const where: any = {
    status: 'PUBLISHED',
  };
  
  // Text search
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } },
      { excerpt: { contains: query, mode: 'insensitive' } },
    ];
  }
  
  // Category filter
  if (category) {
    where.categories = {
      some: {
        category: {
          slug: category,
        },
      },
    };
  }
  
  // Author filter
  if (author) {
    where.author = {
      username: author,
    };
  }
  
  // Date range filter
  if (dateRange) {
    where.publishedAt = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);
  
  return { posts, total, page, limit };
};

// Aggregation queries for analytics
const getPostAnalytics = async (userId?: string) => {
  const where = userId ? { authorId: userId } : {};
  
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalComments,
    postsByMonth,
  ] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.count({ where: { ...where, status: 'PUBLISHED' } }),
    prisma.post.count({ where: { ...where, status: 'DRAFT' } }),
    prisma.postView.aggregate({ 
      where: { post: { ...where } },
      _sum: { views: true } 
    }),
    prisma.comment.aggregate({ 
      where: { post: { ...where, status: 'APPROVED' } },
      _count: true 
    }),
    // Posts by month for chart
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "posts"
      WHERE "authorId" = ${userId}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    `,
  ]);
  
  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews: totalViews._sum.views || 0,
    totalComments: totalComments._count,
    postsByMonth,
  };
};
```

## 4. Transactions et Intégrité des Données

```typescript
// Transaction for complex operations
const createPostWithCategories = async (
  postData: CreatePostData,
  categoryIds: string[]
) => {
  return await prisma.$transaction(async (tx) => {
    // Create the post
    const post = await tx.post.create({
      data: {
        ...postData,
        slug: generateSlug(postData.title),
      },
    });
    
    // Create post-category relationships
    if (categoryIds.length > 0) {
      await tx.postCategory.createMany({
        data: categoryIds.map(categoryId => ({
          postId: post.id,
          categoryId,
        })),
      });
    }
    
    // Update user stats
    await tx.user.update({
      where: { id: postData.authorId },
      data: {
        postsCount: {
          increment: 1,
        },
      },
    });
    
    return post;
  });
};

// Optimistic concurrency control
const updatePostWithOptimisticLocking = async (
  id: string,
  updateData: UpdatePostData,
  expectedVersion: number
) => {
  return await prisma.$transaction(async (tx) => {
    // Check version
    const currentPost = await tx.post.findUnique({
      where: { id },
      select: { version: true },
    });
    
    if (!currentPost) {
      throw new Error('Post not found');
    }
    
    if (currentPost.version !== expectedVersion) {
      throw new Error('Post has been modified by another user');
    }
    
    // Update with version increment
    const updatedPost = await tx.post.update({
      where: { id },
      data: {
        ...updateData,
        version: {
          increment: 1,
        },
      },
    });
    
    return updatedPost;
  });
};
```

## 5. Caching et Performance

```typescript
// Redis caching implementation
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class CacheService {
  private static instance: CacheService;
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
}

// Cached repository pattern
class PostRepository {
  private cache = CacheService.getInstance();
  
  async findById(id: string): Promise<Post | null> {
    const cacheKey = `post:${id}`;
    
    // Try cache first
    let post = await this.cache.get<Post>(cacheKey);
    
    if (!post) {
      // Get from database
      post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
          categories: { include: { category: true } },
        },
      });
      
      // Cache for 1 hour
      if (post) {
        await this.cache.set(cacheKey, post, 3600);
      }
    }
    
    return post;
  }
  
  async update(id: string, data: UpdatePostData): Promise<Post> {
    const post = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: true,
        categories: { include: { category: true } },
      },
    });
    
    // Invalidate cache
    await this.cache.del(`post:${id}`);
    await this.cache.invalidatePattern('posts:*');
    
    return post;
  }
}
```

## 6. Migrations et Versionnage

```typescript
// Migration script template
export async function up(prisma: PrismaClient) {
  // Add new column with default value
  await prisma.$executeRaw`
    ALTER TABLE "posts" 
    ADD COLUMN "viewCount" INTEGER DEFAULT 0 NOT NULL
  `;
  
  // Create index for performance
  await prisma.$executeRaw`
    CREATE INDEX "posts_viewCount_idx" ON "posts"("viewCount")
  `;
  
  // Create trigger for view counting
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION increment_view_count()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE "posts" 
      SET "viewCount" = "viewCount" + 1 
      WHERE "id" = NEW."postId";
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  await prisma.$executeRaw`
    CREATE TRIGGER "increment_post_view_count"
    AFTER INSERT ON "post_views"
    FOR EACH ROW
    EXECUTE FUNCTION increment_view_count();
  `;
}

export async function down(prisma: PrismaClient) {
  // Remove trigger
  await prisma.$executeRaw`DROP TRIGGER IF EXISTS "increment_post_view_count"`;
  await prisma.$executeRaw`DROP FUNCTION IF EXISTS increment_view_count()`;
  
  // Remove index
  await prisma.$executeRaw`DROP INDEX IF EXISTS "posts_viewCount_idx"`;
  
  // Remove column
  await prisma.$executeRaw`ALTER TABLE "posts" DROP COLUMN IF EXISTS "viewCount"`;
}
```

## 7. Backup et Recovery

```typescript
// Database backup service
class BackupService {
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.sql`;
    
    // Using pg_dump for PostgreSQL
    const command = `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`;
    
    return new Promise((resolve, reject) => {
      const process = spawn(command, { shell: true });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(backupFile);
        } else {
          reject(new Error(`Backup failed with code ${code}`));
        }
      });
      
      process.on('error', reject);
    });
  }
  
  async restoreBackup(backupFile: string): Promise<void> {
    const command = `psql ${process.env.DATABASE_URL} < ${backupFile}`;
    
    return new Promise((resolve, reject) => {
      const process = spawn(command, { shell: true });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Restore failed with code ${code}`));
        }
      });
      
      process.on('error', reject);
    });
  }
}
```

## 8. Monitoring et Observabilité

```typescript
// Database monitoring service
class DatabaseMonitor {
  async getHealthStatus(): Promise<DatabaseHealth> {
    try {
      // Check connection
      await prisma.$queryRaw`SELECT 1`;
      
      // Get performance metrics
      const [
        connectionCount,
        slowQueries,
        tableStats,
      ] = await Promise.all([
        prisma.$queryRaw`SELECT count(*) as count FROM pg_stat_activity`,
        prisma.$queryRaw`
          SELECT query, calls, total_time, mean_time 
          FROM pg_stat_statements 
          WHERE mean_time > 1000 
          ORDER BY mean_time DESC 
          LIMIT 10
        `,
        prisma.$queryRaw`
          SELECT schemaname, tablename, 
                 n_tup_ins as inserts,
                 n_tup_upd as updates,
                 n_tup_del as deletes
          FROM pg_stat_user_tables
          ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
          LIMIT 10
        `,
      ]);
      
      return {
        status: 'healthy',
        connectionCount: connectionCount[0]?.count || 0,
        slowQueries,
        tableStats,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
  
  async slowQueryLog(query: string, duration: number): Promise<void> {
    if (duration > 1000) { // Log queries slower than 1 second
      console.warn('Slow query detected:', {
        query,
        duration,
        timestamp: new Date(),
      });
      
      // Send to monitoring service
      await this.sendAlert({
        type: 'slow_query',
        query,
        duration,
      });
    }
  }
}
```