import client from './edgedb';

// Region Card queries
export const regionCardQueries = {
  // Get all region cards for a novel
  getByNovel: async (novelId: string) => {
    return await client.query(`
      select RegionCard {
        id,
        name,
        description,
        image_url,
        continent,
        sort_order,
        theme_color,
        border_color,
        background_color,
        hover_color,
        icon,
        layout_style,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      filter .novel.id = <uuid>$novelId
      order by .sort_order asc, .name asc
    `, { novelId });
  },

  // Get region card by ID
  getById: async (id: string) => {
    return await client.querySingle(`
      select RegionCard {
        id,
        name,
        description,
        image_url,
        continent,
        sort_order,
        theme_color,
        border_color,
        background_color,
        hover_color,
        icon,
        layout_style,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      filter .id = <uuid>$id
    `, { id });
  },

  // Get all region cards
  getAll: async (novelId?: string) => {
    const filterClause = novelId ? 'filter .novel.id = <uuid>$novelId' : '';
    const params = novelId ? { novelId } : {};

    return await client.query(`
      select RegionCard {
        id,
        name,
        description,
        image_url,
        continent,
        sort_order,
        theme_color,
        border_color,
        background_color,
        hover_color,
        icon,
        layout_style,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      ${filterClause}
      order by .novel.title asc, .sort_order asc, .name asc
    `, params);
  },

  // Create region card
  create: async (cardData: {
    novel_id: string;
    name: string;
    description?: string;
    image_url?: string;
    continent?: string;
    sort_order?: number;
    theme_color?: string;
    border_color?: string;
    background_color?: string;
    hover_color?: string;
    icon?: string;
    layout_style?: string;
  }) => {
    return await client.querySingle(`
      insert RegionCard {
        novel := (select Novel filter .id = <uuid>$novel_id),
        name := <str>$name,
        description := <optional str>$description,
        image_url := <optional str>$image_url,
        continent := <optional str>$continent,
        sort_order := <int32>$sort_order ?? 0,
        theme_color := <str>$theme_color ?? '#ef4444',
        border_color := <str>$border_color ?? 'border-gray-700',
        background_color := <str>$background_color ?? 'bg-gray-900',
        hover_color := <str>$hover_color ?? 'hover:border-red-700/50',
        icon := <str>$icon ?? '🏔️',
        layout_style := <str>$layout_style ?? 'vertical'
      }
    `, cardData);
  },

  // Update region card
  update: async (id: string, updates: Partial<{
    name: string;
    description: string;
    image_url: string;
    continent: string;
    sort_order: number;
    theme_color: string;
    border_color: string;
    background_color: string;
    hover_color: string;
    icon: string;
    layout_style: string;
  }>) => {
    const updateClauses = [];
    const params: any = { id };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'string') {
          updateClauses.push(`${key} := <optional str>$${key}`);
        } else if (typeof value === 'number') {
          updateClauses.push(`${key} := <int32>$${key}`);
        }
        params[key] = value;
      }
    });

    if (updateClauses.length === 0) return null;

    return await client.querySingle(`
      update RegionCard
      filter .id = <uuid>$id
      set {
        ${updateClauses.join(',\n        ')},
        updated_at := datetime_current()
      }
    `, params);
  },

  // Delete region card
  delete: async (id: string) => {
    return await client.querySingle(`
      delete RegionCard
      filter .id = <uuid>$id
    `, { id });
  }
};

// Content Section queries
export const contentSectionQueries = {
  // Get content sections by type and novel
  getByType: async (sectionType: string, novelId: string = '1') => {
    return await client.query(`
      select ContentSection {
        id,
        section_key,
        title,
        content,
        content_type,
        section_type,
        is_published,
        sort_order,
        metadata,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      filter .section_type = <str>$sectionType and .novel.id = <uuid>$novelId and .is_published = true
      order by .sort_order asc, .title asc
    `, { sectionType, novelId });
  },

  // Get content section by key and novel
  getByKey: async (sectionKey: string, novelId: string = '1') => {
    return await client.querySingle(`
      select ContentSection {
        id,
        section_key,
        title,
        content,
        content_type,
        section_type,
        is_published,
        sort_order,
        metadata,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      filter .section_key = <str>$sectionKey and .novel.id = <uuid>$novelId
    `, { sectionKey, novelId });
  },

  // Get content section by ID
  getById: async (id: string) => {
    return await client.querySingle(`
      select ContentSection {
        id,
        section_key,
        title,
        content,
        content_type,
        section_type,
        is_published,
        sort_order,
        metadata,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      filter .id = <uuid>$id
    `, { id });
  },

  // Get all content sections
  getAll: async (filters?: { novel_id?: string; section_type?: string; is_published?: boolean }) => {
    let filterClauses = [];
    const params: any = {};

    if (filters?.novel_id) {
      filterClauses.push('.novel.id = <uuid>$novel_id');
      params.novel_id = filters.novel_id;
    }
    if (filters?.section_type) {
      filterClauses.push('.section_type = <str>$section_type');
      params.section_type = filters.section_type;
    }
    if (filters?.is_published !== undefined) {
      filterClauses.push('.is_published = <bool>$is_published');
      params.is_published = filters.is_published;
    }

    const filterClause = filterClauses.length > 0 ? `filter ${filterClauses.join(' and ')}` : '';

    return await client.query(`
      select ContentSection {
        id,
        section_key,
        title,
        content,
        content_type,
        section_type,
        is_published,
        sort_order,
        metadata,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      ${filterClause}
      order by .novel.title asc, .section_type asc, .sort_order asc, .title asc
    `, params);
  },

  // Create content section
  create: async (sectionData: {
    novel_id: string;
    section_key: string;
    title: string;
    content: string;
    content_type?: string;
    section_type: string;
    is_published?: boolean;
    sort_order?: number;
    metadata?: string;
  }) => {
    return await client.querySingle(`
      insert ContentSection {
        novel := (select Novel filter .id = <uuid>$novel_id),
        section_key := <str>$section_key,
        title := <str>$title,
        content := <str>$content,
        content_type := <str>$content_type ?? 'markdown',
        section_type := <str>$section_type,
        is_published := <bool>$is_published ?? true,
        sort_order := <int32>$sort_order ?? 0,
        metadata := <optional str>$metadata
      }
    `, sectionData);
  },

  // Update content section
  update: async (id: string, updates: Partial<{
    title: string;
    content: string;
    content_type: string;
    section_type: string;
    is_published: boolean;
    sort_order: number;
    metadata: string;
  }>) => {
    const updateClauses = [];
    const params: any = { id };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'string') {
          updateClauses.push(`${key} := <optional str>$${key}`);
        } else if (typeof value === 'boolean') {
          updateClauses.push(`${key} := <bool>$${key}`);
        } else if (typeof value === 'number') {
          updateClauses.push(`${key} := <int32>$${key}`);
        }
        params[key] = value;
      }
    });

    if (updateClauses.length === 0) return null;

    return await client.querySingle(`
      update ContentSection
      filter .id = <uuid>$id
      set {
        ${updateClauses.join(',\n        ')},
        updated_at := datetime_current()
      }
    `, params);
  },

  // Delete content section
  delete: async (id: string) => {
    return await client.querySingle(`
      delete ContentSection
      filter .id = <uuid>$id
    `, { id });
  }
};

// Suggestion queries
export const suggestionQueries = {
  // Get all suggestions
  getAll: async (filters?: { status?: string; category?: string; user_id?: string }) => {
    let filterClauses = [];
    const params: any = {};

    if (filters?.status) {
      filterClauses.push('.status = <str>$status');
      params.status = filters.status;
    }
    if (filters?.category) {
      filterClauses.push('.category = <str>$category');
      params.category = filters.category;
    }
    if (filters?.user_id) {
      filterClauses.push('.user.id = <uuid>$user_id');
      params.user_id = filters.user_id;
    }

    const filterClause = filterClauses.length > 0 ? `filter ${filterClauses.join(' and ')}` : '';

    return await client.query(`
      select Suggestion {
        id,
        title,
        description,
        category,
        status,
        priority,
        admin_notes,
        created_at,
        updated_at,
        user: {
          id,
          username,
          pen_name
        },
        votes: {
          id,
          user: {
            id,
            username
          }
        }
      }
      ${filterClause}
      order by .created_at desc
    `, params);
  },

  // Get suggestion by ID
  getById: async (id: string) => {
    return await client.querySingle(`
      select Suggestion {
        id,
        title,
        description,
        category,
        status,
        priority,
        admin_notes,
        created_at,
        updated_at,
        user: {
          id,
          username,
          pen_name
        },
        votes: {
          id,
          user: {
            id,
            username
          }
        }
      }
      filter .id = <uuid>$id
    `, { id });
  },

  // Create suggestion
  create: async (suggestionData: {
    title: string;
    description: string;
    category?: string;
    user_id: string;
  }) => {
    return await client.querySingle(`
      insert Suggestion {
        title := <str>$title,
        description := <str>$description,
        category := <str>$category ?? 'Feature',
        user := (select User filter .id = <uuid>$user_id)
      }
    `, suggestionData);
  },

  // Update suggestion
  update: async (id: string, updates: Partial<{
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    admin_notes: string;
  }>) => {
    const updateClauses = [];
    const params: any = { id };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateClauses.push(`${key} := <optional str>$${key}`);
        params[key] = value;
      }
    });

    if (updateClauses.length === 0) return null;

    return await client.querySingle(`
      update Suggestion
      filter .id = <uuid>$id
      set {
        ${updateClauses.join(',\n        ')},
        updated_at := datetime_current()
      }
    `, params);
  },

  // Delete suggestion
  delete: async (id: string) => {
    return await client.querySingle(`
      delete Suggestion
      filter .id = <uuid>$id
    `, { id });
  },

  // Vote on suggestion
  addVote: async (suggestionId: string, userId: string) => {
    return await client.querySingle(`
      insert SuggestionVote {
        suggestion := (select Suggestion filter .id = <uuid>$suggestionId),
        user := (select User filter .id = <uuid>$userId)
      }
    `, { suggestionId, userId });
  },

  // Remove vote
  removeVote: async (suggestionId: string, userId: string) => {
    return await client.querySingle(`
      delete SuggestionVote
      filter .suggestion.id = <uuid>$suggestionId and .user.id = <uuid>$userId
    `, { suggestionId, userId });
  }
};
