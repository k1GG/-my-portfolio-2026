import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin authentication functions
export const signInWithEmail = async (email, password) => {
  try {
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Demo mode - admin login would happen with:', email);
      // Simulate successful login in demo mode
      return { success: true, data: { user: { email } } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error signing in:', error.message);
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Demo mode - admin logout');
      return { success: true };
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error.message);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
};

// Listen for auth changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Database table names
export const PROJECTS_TABLE = 'projects';
export const SITE_METADATA_TABLE = 'site_metadata';

// Fetch site metadata from the database
export const fetchSiteMetadata = async () => {
  try {
    // Check if real Supabase credentials are configured
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Using demo mode - returning default metadata');
      return getDefaultMetadata();
    }

    const { data, error } = await supabase
      .from(SITE_METADATA_TABLE)
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.warn('Supabase error, using default metadata:', error.message);
      return getDefaultMetadata();
    }
    
    return data;
  } catch (error) {
    console.warn('Error fetching metadata:', error.message);
    return getDefaultMetadata();
  }
};

// Update site metadata in the database
export const updateSiteMetadata = async (updates) => {
  try {
    // Check if real Supabase credentials are configured
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Demo mode - metadata would be updated:', updates);
      return { success: true, data: updates };
    }

    // Map field names to match database column names
    const mappedUpdates = {
      about_description: updates.about_description,
      contact_email: updates.contact_email,
      contact_phone: updates.contact_phone,
      github_url: updates.contact_github || updates.github_url,
      linkedin_url: updates.contact_linkedin || updates.linkedin_url,
      twitter_url: updates.contact_twitter || updates.twitter_url
    };

    // Target row where id = 1 and update using .update() method
    const { data, error } = await supabase
      .from(SITE_METADATA_TABLE)
      .update(mappedUpdates)
      .eq('id', 1)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Supabase response after save:', { success: true, data });
    return { success: true, data };
  } catch (error) {
    console.error('Error updating metadata:', error.message);
    return { success: false, error: error.message };
  }
};

// Default metadata for demo mode
const getDefaultMetadata = () => {
  return {
    id: 1,
    about_title: 'About Me',
    about_subtitle: 'Full-Stack Developer & Creative Technologist',
    about_description: 'I am a passionate developer with expertise in building modern web applications. With a strong foundation in both front-end and back-end technologies, I create seamless digital experiences that solve real-world problems.',
    about_skills: ['React / Next.js', 'TypeScript', 'Node.js', 'Python', 'AWS / Cloud', 'UI/UX Design'],
    contact_email: 'hello@example.com',
    contact_github: 'https://github.com/yourusername',
    contact_linkedin: 'https://linkedin.com/in/yourusername',
    contact_twitter: 'https://twitter.com/yourusername',
    contact_phone: '+1234567890'
  };
};

// Fetch all projects from the database
export const fetchProjects = async () => {
  try {
    // Check if real Supabase credentials are configured
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Using demo mode - no real Supabase connection');
      return getDemoProjects();
    }

    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.warn('Supabase error, falling back to demo projects:', error.message);
      return getDemoProjects();
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching projects:', error.message);
    return getDemoProjects();
  }
};

// Add a new project to the database
export const addProject = async (project) => {
  try {
    // Check if real Supabase credentials are configured
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Demo mode - project would be added:', project);
      return { success: true, data: [{ ...project, id: Date.now() }] };
    }

    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .insert([project])
      .select();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding project:', error.message);
    return { success: false, error: error.message };
  }
};

// Update an existing project in the database
export const updateProject = async (projectId, updates) => {
  try {
    // Check if real Supabase credentials are configured
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Demo mode - project would be updated:', { projectId, updates });
      return { success: true, data: [{ ...updates, id: projectId }] };
    }

    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating project:', error.message);
    return { success: false, error: error.message };
  }
};

// Delete a project from the database
export const deleteProject = async (projectId) => {
  try {
    // Check if real Supabase credentials are configured
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Demo mode - project would be deleted:', projectId);
      return { success: true, data: [{ id: projectId }] };
    }

    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .delete()
      .eq('id', projectId)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting project:', error.message);
    return { success: false, error: error.message };
  }
};

// Delete an image from Supabase Storage
export const deleteProjectImage = async (filePath) => {
  try {
    // Check if real Supabase credentials are configured
    if (supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl.includes('supabase.co')) {
      console.log('Demo mode - image would be deleted:', filePath);
      return { success: true };
    }

    const { error } = await supabase.storage
      .from('project-images')
      .remove([filePath]);
    
    if (error) {
      console.warn('Warning deleting image:', error.message);
      // Don't throw - image deletion failure shouldn't block project deletion
    }
    
    return { success: true };
  } catch (error) {
    console.warn('Error deleting image:', error.message);
    return { success: false, error: error.message };
  }
};

// Demo projects for when Supabase is not configured
const getDemoProjects = () => {
  return [
    {
      id: 1,
      name: 'E-Commerce Platform',
      url: 'https://example.com/ecommerce',
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      description: 'A full-featured e-commerce platform with payment integration, inventory management, and real-time analytics.'
    },
    {
      id: 2,
      name: 'AI Dashboard',
      url: 'https://example.com/ai-dashboard',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      description: 'Intelligent analytics dashboard powered by machine learning, featuring predictive insights and automated reporting.'
    },
    {
      id: 3,
      name: 'Social Media App',
      url: 'https://example.com/social-app',
      image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
      description: 'Modern social media application with real-time messaging, story features, and content sharing capabilities.'
    },
    {
      id: 4,
      name: 'SaaS Analytics',
      url: 'https://example.com/saas-analytics',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      description: 'Enterprise analytics platform for SaaS businesses with custom dashboards and data visualization tools.'
    },
    {
      id: 5,
      name: 'Mobile Fitness App',
      url: 'https://example.com/fitness-app',
      image_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop',
      description: 'Cross-platform fitness application with workout tracking, nutrition planning, and progress monitoring.'
    },
    {
      id: 6,
      name: 'Crypto Portfolio',
      url: 'https://example.com/crypto-portfolio',
      image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&h=400&fit=crop',
      description: 'Cryptocurrency portfolio tracker with real-time prices, alerts, and investment analysis features.'
    }
  ];
};
