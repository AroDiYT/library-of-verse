import client from './edgedb';

// Chapter queries
export const chapterQueries = {
  // Get all chapters for a novel
  getByNovel: async (novelId: string) => {
    return await client.query(`
      select Chapter {
        id,
        title,
        chapter_number,
        content,
        excerpt,
        word_count,
        is_published,
        published_at,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      filter .novel.id = <uuid>$novelId
      order by .chapter_number asc
    `, { novelId });
  },

  // Get chapter by ID
  getById: async (id: string) => {
    return await client.querySingle(`
      select Chapter {
        id,
        title,
        chapter_number,
        content,
        excerpt,
        word_count,
        is_published,
        published_at,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        },
        author: {
          id,
          username,
          pen_name
        }
      }
      filter .id = <uuid>$id
    `, { id });
  },

  // Get all chapters (admin/writer view)
  getAll: async (filters?: { novel_id?: string; is_published?: boolean }) => {
    let filterClause = '';
    const params: any = {};

    if (filters?.novel_id) {
      filterClause += ' filter .novel.id = <uuid>$novel_id';
      params.novel_id = filters.novel_id;
    }
    if (filters?.is_published !== undefined) {
      filterClause += filterClause ? ' and .is_published = <bool>$is_published' : ' filter .is_published = <bool>$is_published';
      params.is_published = filters.is_published;
    }

    return await client.query(`
      select Chapter {
        id,
        title,
        chapter_number,
        content,
        excerpt,
        word_count,
        is_published,
        published_at,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        },
        author: {
          id,
          username,
          pen_name
        }
      }
      ${filterClause}
      order by .novel.title asc, .chapter_number asc
    `, params);
  },

  // Create chapter
  create: async (chapterData: {
    novel_id: string;
    title: string;
    chapter_number: number;
    content: string;
    excerpt?: string;
    word_count?: number;
    is_published?: boolean;
    author_id?: string;
  }) => {
    return await client.querySingle(`
      insert Chapter {
        novel := (select Novel filter .id = <uuid>$novel_id),
        title := <str>$title,
        chapter_number := <int32>$chapter_number,
        content := <str>$content,
        excerpt := <optional str>$excerpt,
        word_count := <optional int32>$word_count,
        is_published := <bool>$is_published ?? false,
        published_at := <datetime>datetime_current() if (<bool>$is_published ?? false) else <datetime>{},
        author := (select User filter .id = <uuid>$author_id) if exists $author_id else {}
      }
    `, chapterData);
  },

  // Update chapter
  update: async (id: string, updates: Partial<{
    title: string;
    chapter_number: number;
    content: string;
    excerpt: string;
    word_count: number;
    is_published: boolean;
  }>) => {
    const updateClauses = [];
    const params: any = { id };

    if (updates.title !== undefined) {
      updateClauses.push('title := <str>$title');
      params.title = updates.title;
    }
    if (updates.chapter_number !== undefined) {
      updateClauses.push('chapter_number := <int32>$chapter_number');
      params.chapter_number = updates.chapter_number;
    }
    if (updates.content !== undefined) {
      updateClauses.push('content := <str>$content');
      params.content = updates.content;
    }
    if (updates.excerpt !== undefined) {
      updateClauses.push('excerpt := <optional str>$excerpt');
      params.excerpt = updates.excerpt;
    }
    if (updates.word_count !== undefined) {
      updateClauses.push('word_count := <optional int32>$word_count');
      params.word_count = updates.word_count;
    }
    if (updates.is_published !== undefined) {
      updateClauses.push('is_published := <bool>$is_published');
      updateClauses.push('published_at := <datetime>datetime_current() if <bool>$is_published else <datetime>{}');
      params.is_published = updates.is_published;
    }

    if (updateClauses.length === 0) return null;

    return await client.querySingle(`
      update Chapter
      filter .id = <uuid>$id
      set {
        ${updateClauses.join(',\n        ')},
        updated_at := datetime_current()
      }
    `, params);
  },

  // Delete chapter
  delete: async (id: string) => {
    return await client.querySingle(`
      delete Chapter
      filter .id = <uuid>$id
    `, { id });
  },

  // Get next chapter
  getNextChapter: async (chapterNumber: number, novelId: string) => {
    return await client.querySingle(`
      select Chapter {
        id,
        title,
        chapter_number,
        excerpt,
        is_published
      }
      filter .chapter_number > <int32>$chapterNumber and .novel.id = <uuid>$novelId
      order by .chapter_number asc
      limit 1
    `, { chapterNumber, novelId });
  },

  // Get previous chapter
  getPrevChapter: async (chapterNumber: number, novelId: string) => {
    return await client.querySingle(`
      select Chapter {
        id,
        title,
        chapter_number,
        excerpt,
        is_published
      }
      filter .chapter_number < <int32>$chapterNumber and .novel.id = <uuid>$novelId
      order by .chapter_number desc
      limit 1
    `, { chapterNumber, novelId });
  },

  // Get next published chapter
  getNextPublishedChapter: async (chapterNumber: number, novelId: string) => {
    return await client.querySingle(`
      select Chapter {
        id,
        title,
        chapter_number,
        excerpt,
        is_published
      }
      filter .chapter_number > <int32>$chapterNumber and .novel.id = <uuid>$novelId and .is_published = true
      order by .chapter_number asc
      limit 1
    `, { chapterNumber, novelId });
  },

  // Get previous published chapter
  getPrevPublishedChapter: async (chapterNumber: number, novelId: string) => {
    return await client.querySingle(`
      select Chapter {
        id,
        title,
        chapter_number,
        excerpt,
        is_published
      }
      filter .chapter_number < <int32>$chapterNumber and .novel.id = <uuid>$novelId and .is_published = true
      order by .chapter_number desc
      limit 1
    `, { chapterNumber, novelId });
  }
};

// Character queries
export const characterQueries = {
  // Get all characters for a novel
  getByNovel: async (novelId: string, includeUnpublished: boolean = false) => {
    const filterClause = includeUnpublished 
      ? 'filter .novel.id = <uuid>$novelId'
      : 'filter .novel.id = <uuid>$novelId and .is_published = true';

    return await client.query(`
      select Character {
        id,
        name,
        description,
        bio,
        role_type,
        character_type,
        age,
        occupation,
        location,
        personality_traits,
        abilities,
        relationships,
        appearance,
        backstory,
        motivation,
        theme_color,
        image_url,
        is_published,
        sort_order,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      ${filterClause}
      order by .sort_order asc, .role_type asc, .name asc
    `, { novelId });
  },

  // Get character by ID
  getById: async (id: string) => {
    return await client.querySingle(`
      select Character {
        id,
        name,
        description,
        bio,
        role_type,
        character_type,
        age,
        occupation,
        location,
        personality_traits,
        abilities,
        relationships,
        appearance,
        backstory,
        motivation,
        theme_color,
        image_url,
        is_published,
        sort_order,
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

  // Get all characters (admin/writer view)
  getAll: async (filters?: { novel_id?: string; is_published?: boolean; role_type?: string }) => {
    let filterClauses = [];
    const params: any = {};

    if (filters?.novel_id) {
      filterClauses.push('.novel.id = <uuid>$novel_id');
      params.novel_id = filters.novel_id;
    }
    if (filters?.is_published !== undefined) {
      filterClauses.push('.is_published = <bool>$is_published');
      params.is_published = filters.is_published;
    }
    if (filters?.role_type) {
      filterClauses.push('.role_type = <str>$role_type');
      params.role_type = filters.role_type;
    }

    const filterClause = filterClauses.length > 0 ? `filter ${filterClauses.join(' and ')}` : '';

    return await client.query(`
      select Character {
        id,
        name,
        description,
        bio,
        role_type,
        character_type,
        age,
        occupation,
        location,
        personality_traits,
        abilities,
        relationships,
        appearance,
        backstory,
        motivation,
        theme_color,
        image_url,
        is_published,
        sort_order,
        created_at,
        updated_at,
        novel: {
          id,
          title,
          slug
        }
      }
      ${filterClause}
      order by .novel.title asc, .sort_order asc, .role_type asc, .name asc
    `, params);
  },

  // Create character
  create: async (characterData: {
    novel_id: string;
    name: string;
    description?: string;
    bio?: string;
    role_type?: string;
    character_type?: string;
    age?: string;
    occupation?: string;
    location?: string;
    personality_traits?: string;
    abilities?: string;
    relationships?: string;
    appearance?: string;
    backstory?: string;
    motivation?: string;
    theme_color?: string;
    image_url?: string;
    is_published?: boolean;
    sort_order?: number;
  }) => {
    return await client.querySingle(`
      insert Character {
        novel := (select Novel filter .id = <uuid>$novel_id),
        name := <str>$name,
        description := <optional str>$description,
        bio := <optional str>$bio,
        role_type := <str>$role_type ?? 'Side',
        character_type := <str>$character_type ?? 'human',
        age := <optional str>$age,
        occupation := <optional str>$occupation,
        location := <optional str>$location,
        personality_traits := <optional str>$personality_traits,
        abilities := <optional str>$abilities,
        relationships := <optional str>$relationships,
        appearance := <optional str>$appearance,
        backstory := <optional str>$backstory,
        motivation := <optional str>$motivation,
        theme_color := <str>$theme_color ?? '#ef4444',
        image_url := <optional str>$image_url,
        is_published := <bool>$is_published ?? false,
        sort_order := <int32>$sort_order ?? 0
      }
    `, characterData);
  },

  // Update character
  update: async (id: string, updates: Partial<{
    name: string;
    description: string;
    bio: string;
    role_type: string;
    character_type: string;
    age: string;
    occupation: string;
    location: string;
    personality_traits: string;
    abilities: string;
    relationships: string;
    appearance: string;
    backstory: string;
    motivation: string;
    theme_color: string;
    image_url: string;
    is_published: boolean;
    sort_order: number;
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
      update Character
      filter .id = <uuid>$id
      set {
        ${updateClauses.join(',\n        ')},
        updated_at := datetime_current()
      }
    `, params);
  },

  // Delete character
  delete: async (id: string) => {
    return await client.querySingle(`
      delete Character
      filter .id = <uuid>$id
    `, { id });
  }
};
