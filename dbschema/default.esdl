module default {

  # User types
  type User {
    required email: str {
      constraint exclusive;
    };
    required password_hash: str;
    required username: str {
      constraint exclusive;
    };
    is_admin: bool {
      default := false;
    };
    role: str {
      default := 'reader';
      constraint one_of('admin', 'writer', 'reader');
    };
    pen_name: optional str;
    created_at: datetime {
      default := datetime_current();
    };
    last_login: optional datetime;
    is_active: bool {
      default := true;
    };
    
    # Relationships
    multi chapters := .<author[is Chapter];
    multi novels := .<author[is Novel];
    multi suggestions := .<user[is Suggestion];
    multi suggestion_votes := .<user[is SuggestionVote];
    multi reading_progress := .<user[is ReadingProgress];
    multi sessions := .<user[is Session];
  }

  # Novel type
  type Novel {
    required title: str;
    required slug: str {
      constraint exclusive;
    };
    description: optional str;
    cover_image_url: optional str;
    genre: str {
      default := 'Dark Fantasy';
    };
    status: str {
      default := 'active';
      constraint one_of('active', 'completed', 'hiatus', 'draft');
    };
    is_featured: bool {
      default := false;
    };
    sort_order: int32 {
      default := 0;
    };
    created_at: datetime {
      default := datetime_current();
    };
    updated_at: datetime {
      default := datetime_current();
    };
    
    # Optional author relationship
    author: optional User;
    
    # Relationships
    multi chapters := .<novel[is Chapter];
    multi characters := .<novel[is Character];
    multi content_sections := .<novel[is ContentSection];
    multi region_cards := .<novel[is RegionCard];
  }

  # Chapter type
  type Chapter {
    required novel: Novel;
    required title: str;
    required chapter_number: int32;
    required content: str;
    excerpt: optional str;
    word_count: optional int32;
    is_published: bool {
      default := false;
    };
    published_at: optional datetime;
    created_at: datetime {
      default := datetime_current();
    };
    updated_at: datetime {
      default := datetime_current();
    };
    
    # Optional author for admin editing
    author: optional User;
    
    # Relationships
    multi reading_progress := .<chapter[is ReadingProgress];
  }

  # Character type
  type Character {
    required novel: Novel;
    required name: str;
    description: optional str;
    bio: optional str;
    role_type: str {
      default := 'Side';
      constraint one_of('MC', 'Antagonist', 'Side', 'Supporting');
    };
    character_type: str {
      default := 'human';
      constraint one_of('demon', 'fae', 'human', 'hybrid', 'other', 'void_entity');
    };
    age: optional str;
    occupation: optional str;
    location: optional str;
    personality_traits: optional str;
    abilities: optional str;
    relationships: optional str;
    appearance: optional str;
    backstory: optional str;
    motivation: optional str;
    theme_color: str {
      default := '#ef4444';
    };
    image_url: optional str;
    is_published: bool {
      default := false;
    };
    sort_order: int32 {
      default := 0;
    };
    created_at: datetime {
      default := datetime_current();
    };
    updated_at: datetime {
      default := datetime_current();
    };
  }

  # Reading progress type
  type ReadingProgress {
    required user: User;
    required chapter: Chapter;
    progress_percentage: float32 {
      default := 0.0;
    };
    completed_at: optional datetime;
    created_at: datetime {
      default := datetime_current();
    };
    updated_at: datetime {
      default := datetime_current();
    };
    
    constraint exclusive on ((.user, .chapter));
  }

  # Session type
  type Session {
    required id: str {
      constraint exclusive;
    };
    required user: User;
    required expires_at: datetime;
    created_at: datetime {
      default := datetime_current();
    };
  }

  # Suggestion type
  type Suggestion {
    required title: str;
    required description: str;
    category: str {
      default := 'Feature';
    };
    status: str {
      default := 'pending';
      constraint one_of('pending', 'under_review', 'approved', 'implemented', 'rejected');
    };
    priority: str {
      default := 'medium';
      constraint one_of('low', 'medium', 'high');
    };
    required user: User;
    admin_notes: optional str;
    created_at: datetime {
      default := datetime_current();
    };
    updated_at: datetime {
      default := datetime_current();
    };
    
    # Relationships
    multi votes := .<suggestion[is SuggestionVote];
  }

  # Suggestion vote type
  type SuggestionVote {
    required suggestion: Suggestion;
    required user: User;
    created_at: datetime {
      default := datetime_current();
    };
    
    constraint exclusive on ((.suggestion, .user));
  }

  # Content section type
  type ContentSection {
    required novel: Novel;
    required section_key: str;
    required title: str;
    required content: str;
    content_type: str {
      default := 'markdown';
      constraint one_of('markdown', 'html', 'text');
    };
    required section_type: str;
    is_published: bool {
      default := true;
    };
    sort_order: int32 {
      default := 0;
    };
    metadata: optional str; # JSON string
    created_at: datetime {
      default := datetime_current();
    };
    updated_at: datetime {
      default := datetime_current();
    };
    
    constraint exclusive on ((.novel, .section_key));
  }

  # Region card type
  type RegionCard {
    required novel: Novel;
    required name: str;
    description: optional str;
    image_url: optional str;
    continent: optional str;
    sort_order: int32 {
      default := 0;
    };
    theme_color: str {
      default := '#ef4444';
    };
    border_color: str {
      default := 'border-gray-700';
    };
    background_color: str {
      default := 'bg-gray-900';
    };
    hover_color: str {
      default := 'hover:border-red-700/50';
    };
    icon: str {
      default := '🏔️';
    };
    layout_style: str {
      default := 'vertical';
    };
    created_at: datetime {
      default := datetime_current();
    };
    updated_at: datetime {
      default := datetime_current();
    };
  }

}
