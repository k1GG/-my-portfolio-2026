# Portfolio Website

A professional, single-page portfolio website built with React, Tailwind CSS, and Framer Motion, integrated with Supabase for live database functionality.

## Features

- **Hero Section**: High-end dark-themed with animated mesh background and glassmorphism navigation
- **Project Gallery**: Responsive 3-column grid with 3D-tilt hover effects and staggered animations
- **Add Project Modal**: Floating '+' button with glassmorphism modal form
- **Live Updates**: Canvas confetti burst on project submission
- **Gradient Placeholders**: Automatic colorful gradient placeholders with project initials for missing images
- **Responsive Design**: Fully responsive for mobile and desktop

## Tech Stack

- React 19
- Tailwind CSS v4
- Framer Motion
- Supabase (Database)
- Canvas Confetti

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase (Optional - Demo Mode Works Out of Box)

The app works in demo mode by default with sample projects. To connect to a real Supabase database:

1. Create a Supabase project at https://supabase.com
2. Go to Project Settings > API
3. Copy your `Project URL` and `anon public` key
4. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Create a table named `projects` with these columns:
   - `id` (int8, primary key, auto-generated)
   - `name` (text, required)
   - `url` (text, required)
   - `image_url` (text, optional)
   - `description` (text, optional)

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
src/
├── lib/
│   └── supabase.js       # Supabase client and API functions
├── components/
│   └── (component files)
├── App.jsx               # Main application component
├── main.jsx              # React entry point
└── index.css             # Global styles and Tailwind
```

## Customization

### Colors and Theme

Edit `tailwind.config.js` to customize:
- Color palette
- Animation timings
- Custom keyframes

### Glassmorphism Effects

Modify the `.glass`, `.glass-nav`, and `.glass-modal` classes in `src/index.css` to adjust transparency and blur effects.

## License

MIT
