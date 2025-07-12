# Forged Pacts - Setup Guide

## What's Installed
- **SQLite Database** with better-sqlite3 (file-based, zero configuration)
- **Authentication System** with bcrypt password hashing
- **Session Management** with JWT tokens
- **Admin Dashboard** for content management

## Database
- **Location**: `./database/forgedpacts.db` (created automatically)
- **Schema**: `./database/schema.sql` (applied automatically)
- **No external database needed** - SQLite is built-in!

## Default Admin Account
- **Email**: admin@forgedpacts.com
- **Password**: admin123
- **Note**: Change this password in production!

## How to Start
1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Sign up for a regular account OR login as admin
4. Admin users get access to `/admin` dashboard

## Features Added
✅ **User Authentication** (signup/login/logout)  
✅ **Protected Chapter Reading** (login required)  
✅ **Admin Dashboard** for content management  
✅ **SQLite Database** with raw SQL queries  
✅ **Session Management** with secure cookies  
✅ **Responsive Design** for all devices  

## Next Steps
- Add chapters via admin dashboard (when created)
- Customize admin functions
- Add more content types
- Deploy to production

## Database Tables
- `users` - User accounts and authentication
- `chapters` - Novel chapters and content
- `characters` - Character profiles
- `reading_progress` - User reading tracking
- `sessions` - Authentication sessions

## Security Features
- Password hashing with bcrypt
- HTTP-only session cookies
- Admin role protection
- SQL injection prevention
