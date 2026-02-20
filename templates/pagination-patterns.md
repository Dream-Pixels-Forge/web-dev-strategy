# Pagination Patterns

This template provides patterns for implementing pagination in web applications, including offset-based, cursor-based, and infinite scroll patterns.

## Offset-Based Pagination

### 1. Backend - Express with Prisma
```javascript
// routes/posts.js
const express = require('express');
const { prisma } = require('../lib/prisma');
const router = express.Router();

router.get('/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.post.count()
    ]);

    res.json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Backend - Mongoose
```javascript
// controllers/postController.js
const Post = require('../models/Post');

async function getPosts(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email'),
      Post.countDocuments()
    ]);

    res.json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + posts.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getPosts };
```

### 3. Frontend - React with Pagination Controls
```javascript
// components/PostList.jsx
import { useState, useEffect } from 'react';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts(pagination.page);
  }, [pagination.page]);

  const fetchPosts = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts?page=${page}&limit=${pagination.limit}`);
      const data = await response.json();

      setPosts(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="posts">
            {posts.map(post => (
              <div key={post.id} className="post">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </button>

            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PostList;
```

## Cursor-Based Pagination

### 1. Backend - Prisma
```javascript
// routes/posts.js
router.get('/posts', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const cursor = req.query.cursor;

  try {
    const posts = await prisma.post.findMany({
      take: limit + 1, // Fetch one extra to check if there's more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1 // Skip the cursor
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    });

    const hasNext = posts.length > limit;
    const data = hasNext ? posts.slice(0, -1) : posts;
    const nextCursor = hasNext ? data[data.length - 1].id : null;

    res.json({
      data,
      pagination: {
        nextCursor,
        hasNext
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Backend - Mongoose
```javascript
// controllers/postController.js
async function getPosts(req, res) {
  const limit = parseInt(req.query.limit) || 10;
  const cursor = req.query.cursor;

  try {
    const query = cursor
      ? { _id: { $lt: cursor } }
      : {};

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('author', 'name email');

    const hasNext = posts.length > limit;
    const data = hasNext ? posts.slice(0, -1) : posts;
    const nextCursor = hasNext ? data[data.length - 1]._id : null;

    res.json({
      data,
      pagination: {
        nextCursor,
        hasNext
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 3. Frontend - React with Cursor Pagination
```javascript
// components/PostList.jsx
import { useState, useEffect } from 'react';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (cursor = null) => {
    setLoading(true);
    try {
      const url = cursor
        ? `/api/posts?cursor=${cursor}&limit=10`
        : '/api/posts?limit=10';

      const response = await fetch(url);
      const data = await response.json();

      setPosts(prev => cursor ? [...prev, ...data.data] : data.data);
      setNextCursor(data.pagination.nextCursor);
      setHasNext(data.pagination.hasNext);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loading) {
      fetchPosts(nextCursor);
    }
  };

  return (
    <div>
      <div className="posts">
        {posts.map(post => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>

      {hasNext && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

export default PostList;
```

## Infinite Scroll Pattern

### 1. React with Intersection Observer
```javascript
// components/InfinitePostList.jsx
import { useState, useEffect, useRef, useCallback } from 'react';

function InfinitePostList() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  const lastPostRef = useCallback(node => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts?page=${page}&limit=10`);
      const data = await response.json();

      setPosts(prev => [...prev, ...data.data]);
      setHasMore(data.pagination.hasNext);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="posts">
        {posts.map((post, index) => {
          if (posts.length === index + 1) {
            return (
              <div ref={lastPostRef} key={post.id} className="post">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>
            );
          } else {
            return (
              <div key={post.id} className="post">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>
            );
          }
        })}
      </div>

      {loading && <div>Loading more posts...</div>}
      {!hasMore && <div>No more posts to load</div>}
    </div>
  );
}

export default InfinitePostList;
```

### 2. React with react-infinite-scroll-component
```javascript
// components/InfinitePostList.jsx
import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

function InfinitePostList() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?page=${page}&limit=10`);
      const data = await response.json();

      setPosts(prev => [...prev, ...data.data]);
      setHasMore(data.pagination.hasNext);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchPosts}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
      endMessage={<p>No more posts to load</p>}
    >
      <div className="posts">
        {posts.map(post => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}

export default InfinitePostList;
```

## Search with Pagination

```javascript
// routes/posts.js
router.get('/posts/search', async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } }
          ]
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } }
          ]
        }
      })
    ]);

    res.json({
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Pagination with Filters

```javascript
// routes/posts.js
router.get('/posts', async (req, res) => {
  const { page = 1, limit = 10, category, status, sortBy = 'createdAt', order = 'desc' } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (category) where.category = category;
  if (status) where.status = status;

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          author: { select: { id: true, name: true } }
        }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: { category, status, sortBy, order }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Reusable Pagination Hook

```javascript
// hooks/usePagination.js
import { useState, useEffect } from 'react';

function usePagination(fetchFunction, initialPage = 1, initialLimit = 10) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction({ page, limit });
      setData(result.data);
      setTotal(result.pagination.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (newPage) => {
    setPage(newPage);
  };

  const nextPage = () => {
    if (page < Math.ceil(total / limit)) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
}

export default usePagination;
```
