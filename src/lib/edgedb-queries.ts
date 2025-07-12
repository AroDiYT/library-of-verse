import client from './edgedb';

// User queries
export const userQueries = {
  // Find user by email
  findByEmail: async (email: string) => {
    return await client.querySingle(`
      select User {
        id,
        email,
        password_hash,
        username,
        is_admin,
        role,
        pen_name,
        created_at,
        last_login,
        is_active
      }
      filter .email = <str>$email
    `, { email });
  },

  // Find user by username
  findByUsername: async (username: string) => {
    return await client.querySingle(`
      select User {
        id,
        email,
        password_hash,
        username,
        is_admin,
        role,
        pen_name,
        created_at,
        last_login,
        is_active
      }
      filter .username = <str>$username
    `, { username });
  },

  // Find user by ID
  findById: async (id: string) => {
    return await client.querySingle(`
      select User {
        id,
        email,
        password_hash,
        username,
        is_admin,
        role,
        pen_name,
        created_at,
        last_login,
        is_active
      }
      filter .id = <uuid>$id
    `, { id });
  },

  // Create new user
  create: async (userData: {
    email: string;
    password_hash: string;
    username: string;
    role?: string;
    is_admin?: boolean;
    pen_name?: string;
  }) => {
    return await client.querySingle(`
      insert User {
        email := <str>$email,
        password_hash := <str>$password_hash,
        username := <str>$username,
        role := <str>$role ?? 'reader',
        is_admin := <bool>$is_admin ?? false,
        pen_name := <optional str>$pen_name
      }
    `, userData);
  },

  // Update user
  update: async (id: string, updates: Partial<{
    email: string;
    username: string;
    pen_name: string;
    last_login: Date;
    is_active: boolean;
  }>) => {
    const updateClauses = [];
    const params: any = { id };

    if (updates.email !== undefined) {
      updateClauses.push('email := <str>$email');
      params.email = updates.email;
    }
    if (updates.username !== undefined) {
      updateClauses.push('username := <str>$username');
      params.username = updates.username;
    }
    if (updates.pen_name !== undefined) {
      updateClauses.push('pen_name := <optional str>$pen_name');
      params.pen_name = updates.pen_name;
    }
    if (updates.last_login !== undefined) {
      updateClauses.push('last_login := <datetime>$last_login');
      params.last_login = updates.last_login;
    }
    if (updates.is_active !== undefined) {
      updateClauses.push('is_active := <bool>$is_active');
      params.is_active = updates.is_active;
    }

    if (updateClauses.length === 0) return null;

    return await client.querySingle(`
      update User
      filter .id = <uuid>$id
      set {
        ${updateClauses.join(',\n        ')}
      }
    `, params);
  },

  // Get all users (admin only)
  getAll: async () => {
    return await client.query(`
      select User {
        id,
        email,
        username,
        is_admin,
        role,
        pen_name,
        created_at,
        last_login,
        is_active
      }
      order by .created_at desc
    `);
  },

  // Delete user
  delete: async (id: string) => {
    return await client.querySingle(`
      delete User
      filter .id = <uuid>$id
    `, { id });
  }
};

// Session queries
export const sessionQueries = {
  // Find session by ID
  findById: async (sessionId: string) => {
    return await client.querySingle(`
      select Session {
        id,
        user: {
          id,
          email,
          username,
          is_admin,
          role,
          pen_name,
          is_active
        },
        expires_at,
        created_at
      }
      filter .id = <str>$sessionId and .expires_at > datetime_current()
    `, { sessionId });
  },

  // Create new session
  create: async (sessionId: string, userId: string, expiresAt: Date) => {
    return await client.querySingle(`
      insert Session {
        id := <str>$sessionId,
        user := (select User filter .id = <uuid>$userId),
        expires_at := <datetime>$expiresAt
      }
    `, { sessionId, userId, expiresAt });
  },

  // Delete session
  delete: async (sessionId: string) => {
    return await client.querySingle(`
      delete Session
      filter .id = <str>$sessionId
    `, { sessionId });
  },

  // Clean expired sessions
  cleanExpired: async () => {
    return await client.query(`
      delete Session
      filter .expires_at < datetime_current()
    `);
  }
};

// Novel queries
export const novelQueries = {
  // Get all novels
  getAll: async () => {
    return await client.query(`
      select Novel {
        id,
        title,
        slug,
        description,
        cover_image_url,
        genre,
        status,
        is_featured,
        sort_order,
        created_at,
        updated_at
      }
      order by .sort_order asc, .created_at desc
    `);
  },

  // Get novel by ID
  getById: async (id: string) => {
    return await client.querySingle(`
      select Novel {
        id,
        title,
        slug,
        description,
        cover_image_url,
        genre,
        status,
        is_featured,
        sort_order,
        created_at,
        updated_at,
        author: {
          id,
          username,
          pen_name
        }
      }
      filter .id = <uuid>$id
    `, { id });
  },

  // Get novel by slug
  getBySlug: async (slug: string) => {
    return await client.querySingle(`
      select Novel {
        id,
        title,
        slug,
        description,
        cover_image_url,
        genre,
        status,
        is_featured,
        sort_order,
        created_at,
        updated_at,
        author: {
          id,
          username,
          pen_name
        }
      }
      filter .slug = <str>$slug
    `, { slug });
  },

  // Create novel
  create: async (novelData: {
    title: string;
    slug: string;
    description?: string;
    cover_image_url?: string;
    genre?: string;
    status?: string;
    is_featured?: boolean;
    sort_order?: number;
    author_id?: string;
  }) => {
    return await client.querySingle(`
      insert Novel {
        title := <str>$title,
        slug := <str>$slug,
        description := <optional str>$description,
        cover_image_url := <optional str>$cover_image_url,
        genre := <str>$genre ?? 'Dark Fantasy',
        status := <str>$status ?? 'active',
        is_featured := <bool>$is_featured ?? false,
        sort_order := <int32>$sort_order ?? 0,
        author := (select User filter .id = <uuid>$author_id) if exists $author_id else {}
      }
    `, novelData);
  },

  // Update novel
  update: async (id: string, updates: Partial<{
    title: string;
    slug: string;
    description: string;
    cover_image_url: string;
    genre: string;
    status: string;
    is_featured: boolean;
    sort_order: number;
  }>) => {
    const updateClauses = [];
    const params: any = { id };

    if (updates.title !== undefined) {
      updateClauses.push('title := <str>$title');
      params.title = updates.title;
    }
    if (updates.slug !== undefined) {
      updateClauses.push('slug := <str>$slug');
      params.slug = updates.slug;
    }
    if (updates.description !== undefined) {
      updateClauses.push('description := <optional str>$description');
      params.description = updates.description;
    }
    if (updates.cover_image_url !== undefined) {
      updateClauses.push('cover_image_url := <optional str>$cover_image_url');
      params.cover_image_url = updates.cover_image_url;
    }
    if (updates.genre !== undefined) {
      updateClauses.push('genre := <str>$genre');
      params.genre = updates.genre;
    }
    if (updates.status !== undefined) {
      updateClauses.push('status := <str>$status');
      params.status = updates.status;
    }
    if (updates.is_featured !== undefined) {
      updateClauses.push('is_featured := <bool>$is_featured');
      params.is_featured = updates.is_featured;
    }
    if (updates.sort_order !== undefined) {
      updateClauses.push('sort_order := <int32>$sort_order');
      params.sort_order = updates.sort_order;
    }

    if (updateClauses.length === 0) return null;

    return await client.querySingle(`
      update Novel
      filter .id = <uuid>$id
      set {
        ${updateClauses.join(',\n        ')},
        updated_at := datetime_current()
      }
    `, params);
  },

  // Delete novel
  delete: async (id: string) => {
    return await client.querySingle(`
      delete Novel
      filter .id = <uuid>$id
    `, { id });
  }
};

export default client;
