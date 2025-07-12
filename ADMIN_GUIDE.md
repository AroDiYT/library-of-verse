# Forged Pacts - Admin & Reading Guide

## Overview

Your dark fantasy novel website now includes a comprehensive admin dashboard for managing novels and chapters, plus a beautiful reading experience for users. The system supports both rich text (WYSIWYG) and Markdown editing.

## Admin Dashboard Features

### 📚 Chapter Management
- **Rich Text Editor**: Full WYSIWYG editor with formatting, lists, quotes, and more
- **Markdown Mode**: Toggle to write in Markdown for faster content creation
- **Chapter Organization**: Automatic numbering and organization
- **Publishing Control**: Draft/publish states for content management
- **Word Count**: Automatic calculation for reading time estimates

### 🎯 Content Features
- **Excerpts**: Short descriptions for chapter listings
- **Reading Time**: Automatically calculated based on word count
- **SEO-friendly URLs**: Clean chapter URLs for better user experience
- **Navigation**: Previous/Next chapter navigation in reading view

## Getting Started

### Default Admin Account
- **Email**: `admin@forgedpacts.com`
- **Password**: `admin123`

### Accessing the Admin Dashboard
1. Navigate to `/auth` and log in with admin credentials
2. Click "Admin Dashboard" in the navigation (only visible to admin users)
3. Access "Manage Chapters" to start creating content

## Creating Chapters

### Using Rich Text Editor
1. Go to Admin Dashboard → Manage Chapters
2. Click "Add New Chapter"
3. Fill in chapter details:
   - **Title**: Chapter name
   - **Chapter Number**: Sequential numbering
   - **Excerpt**: Brief description for listings
   - **Content**: Use the rich text editor for formatting
4. Check "Publish immediately" to make it visible to readers
5. Click "Create Chapter"

### Using Markdown Mode
1. In the chapter editor, toggle the switch to "Markdown"
2. Write content using standard Markdown syntax:
   ```markdown
   # Chapter Title
   
   Regular paragraph text.
   
   ## Subheading
   
   **Bold text** and *italic text*
   
   > Blockquotes for dialogue or emphasis
   
   ---
   
   Horizontal rules for scene breaks
   ```

## Reading Experience

### For Readers
- Navigate to `/chapters` to see all published chapters
- Click "Read Chapter" to access individual chapters
- Enjoy a beautiful, readable layout optimized for long-form content
- Use Previous/Next navigation to move between chapters

### Chapter Display Features
- **Reading time estimates** based on average reading speed
- **Word count** display
- **Publication dates**
- **Responsive design** for all devices
- **Custom typography** optimized for reading
- **Dark theme** matching the site's aesthetic

## Content Format Support

### Rich Text (HTML)
- Full formatting support through ReactQuill editor
- Headers, paragraphs, lists, quotes, bold, italic
- Embedded media support
- Tables and advanced formatting

### Markdown
- Automatic detection of Markdown content
- GitHub Flavored Markdown support
- Custom styled components for headings, quotes, etc.
- Scene break support with horizontal rules

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── chapters/           # Chapter management interface
│   ├── chapters/
│   │   ├── page.tsx           # Chapter listing
│   │   └── [id]/
│   │       └── page.tsx       # Individual chapter reader
│   └── api/
│       ├── chapters/
│       │   └── [id]/          # Chapter API endpoints
│       └── admin/
│           └── chapters/       # Admin chapter API
├── components/
│   ├── Navigation.tsx         # Site navigation
│   └── Footer.tsx            # Site footer
└── lib/
    ├── database.ts           # Database queries
    └── auth.ts              # Authentication logic
```

## API Endpoints

### Public Endpoints
- `GET /api/chapters/[id]` - Get specific chapter (requires auth)

### Admin Endpoints
- `GET /api/admin/chapters` - List all chapters
- `POST /api/admin/chapters` - Create new chapter
- `PUT /api/admin/chapters/[id]` - Update chapter
- `DELETE /api/admin/chapters/[id]` - Delete chapter

## Database Schema

### Chapters Table
```sql
CREATE TABLE chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  chapter_number INTEGER NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  word_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Styling Features

### Chapter Reading Styles
- Optimized line spacing and font sizes
- Custom heading styles with color gradients
- Blockquote styling for dialogue
- Scene break separators
- Focus mode with optimal line length

### Responsive Design
- Mobile-friendly chapter navigation
- Adaptive typography
- Touch-friendly interface elements

## Next Steps

### Recommended Enhancements
1. **User Reading Progress**: Track where users left off
2. **Chapter Comments**: Allow reader feedback
3. **Search Functionality**: Find specific chapters or content
4. **Chapter Categories**: Organize by story arcs or books
5. **Export Features**: PDF/EPUB generation
6. **Analytics Dashboard**: Track reading statistics

### Advanced Features
- **Multiple Book Support**: Expand beyond single novel
- **Character Database**: Link characters to chapters
- **Timeline View**: Visual story progression
- **Reader Bookmarks**: Save favorite passages
- **Social Features**: Reader discussions and reviews

## Troubleshooting

### Common Issues
1. **Chapters not showing**: Check if they're published
2. **Rich text not saving**: Ensure content isn't empty
3. **Navigation broken**: Verify chapter numbers are sequential
4. **Styling issues**: Check if content has conflicting HTML/Markdown

### Getting Help
- Check browser console for JavaScript errors
- Verify database connectivity
- Ensure all required packages are installed
- Review server logs for API errors

---

Your novel website is now ready for content creation and reader engagement! 🚀📚
