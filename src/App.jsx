import { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { fetchProjects, addProject, updateSiteMetadata, fetchSiteMetadata, updateProject, deleteProject, deleteProjectImage, supabase, signInWithEmail, signOut } from './lib/supabase';

// ============================================
// CONFIG: Edit your contact links here
// ============================================
const CONTACT_LINKS = {
  email: 'hello@example.com',
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  twitter: 'https://twitter.com/yourusername',
  phone: '+1234567890',
};

// ============================================
// CONFIG: Edit your about section content
// ============================================
const ABOUT_CONTENT = {
  title: 'About Me',
  subtitle: 'Full-Stack Developer & Creative Technologist',
  description: 'I am a passionate developer with expertise in building modern web applications. With a strong foundation in both front-end and back-end technologies, I create seamless digital experiences that solve real-world problems.',
  skills: [
    'React / Next.js',
    'TypeScript',
    'Node.js',
    'Python',
    'AWS / Cloud',
    'UI/UX Design',
  ],
};

// Generate initials from project name
const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Generate gradient colors based on name
const getGradientColors = (name) => {
  const gradients = [
    'from-cyan-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-cyan-500',
    'from-yellow-500 to-orange-500',
    'from-green-500 to-teal-500',
    'from-indigo-500 to-blue-500',
  ];
  const index = name ? name.charCodeAt(0) % gradients.length : 0;
  return gradients[index];
};

// Project Card Component with 3D tilt effect
const ProjectCard = ({ project, index, onEdit, onDelete, isAdmin }) => {
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Project Image or Gradient Placeholder */}
      <div className="relative h-48 overflow-hidden">
        {project.image_url && !imageError ? (
          <img
            src={project.image_url}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradientColors(project.name)} flex items-center justify-center`}>
            <span className="text-4xl font-bold text-white drop-shadow-lg">
              {getInitials(project.name)}
            </span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
        
        {/* Action Buttons - Edit & Delete - Only show for admin */}
        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              className="p-2 rounded-lg bg-dark-900/80 border border-white/20 text-gray-400 hover:text-cyan-400 hover:border-cyan-400 transition-all duration-300"
              title="Edit Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(project); }}
              className="p-2 rounded-lg bg-dark-900/80 border border-white/20 text-gray-400 hover:text-red-400 hover:border-red-400 transition-all duration-300"
              title="Delete Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="p-5 gap-0.5 flex flex-col">
        <h3 className="text-xl font-semibold text-white mb-0.5 group-hover:text-cyan-400 transition-colors">
          {project.name}
        </h3>
        <p className="text-gray-400 text-sm mb-0.5 line-clamp-2">
          {project.description || 'No description available'}
        </p>
        
        {/* Visit Button */}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
          >
            Visit Project
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  );
};

// Navigation Component
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
        >
          Portfolio
        </motion.div>
        
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Projects', 'About', 'Contact'].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium"
            >
              {item}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-32">
      {/* Mesh Background - absolute within section */}
      <div className="absolute inset-0 z-[-1] mesh-bg">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center justify-center gap-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-cyan-400 text-lg font-medium tracking-widest uppercase">
            WELCOME TO MY WORLD
          </h2>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white my-10 leading-tight"
        >
          Crafting{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Digital Experiences
          </span>
          {' '}That Matter
        </motion.h1>

        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-400 text-lg md:text-xl mb-12 leading-relaxed"
          >
            A passionate developer building innovative solutions with cutting-edge technology.
            Explore my work and let's create something amazing together.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-row gap-x-8"
        >
          <a href="#projects" className="btn-primary">
            View Projects
          </a>
          <a href="#contact" className="btn-secondary">
            Get In Touch
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-cyan-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Add Project Modal Component
const AddProjectModal = ({ isOpen, onClose, onProjectAdded, editProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name || '',
        url: editProject.url || '',
        description: editProject.description || ''
      });
      setExistingImageUrl(editProject.image_url || '');
      setImagePreview(editProject.image_url || '');
    } else {
      setFormData({ name: '', url: '', description: '' });
      setImageFile(null);
      setImagePreview(null);
      setExistingImageUrl('');
    }
  }, [editProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = existingImageUrl;

      // 1. If there's a new image file, upload it to Supabase Storage
      if (imageFile) {
        // If there's an old image, delete it first
        if (existingImageUrl && existingImageUrl.includes('supabase')) {
          const urlParts = existingImageUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `project-uploads/${fileName}`;
          await deleteProjectImage(filePath);
        }

        // Generate a unique file name
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const newFilePath = `project-uploads/${fileName}`;

        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(newFilePath, imageFile);

        if (uploadError) throw uploadError;

        // Get the Public URL
        const { data: urlData } = supabase.storage
          .from('project-images')
          .getPublicUrl(newFilePath);

        imageUrl = urlData.publicUrl;
      }

      // 2. Save or Update Project in Database
      const projectData = {
        name: formData.name,
        url: formData.url,
        description: formData.description,
        image_url: imageUrl
      };

      let result;
      if (editProject) {
        // Update existing project
        result = await updateProject(editProject.id, projectData);
      } else {
        // Add new project
        result = await addProject(projectData);
      }
      
      if (result.success) {
        // Trigger confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00d9ff', '#a855f7', '#ec4899']
        });
        
        onProjectAdded();
        setFormData({ name: '', url: '', description: '' });
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl('');
        onClose();
      }
    } catch (error) {
      console.error('Error saving project:', error.message);
      alert('Error saving project: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6"
          >
            <div className="glass-modal rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{editProject ? 'Edit Project' : 'Add New Project'}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="My Awesome Project"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Project URL *
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    required
                    placeholder="https://example.com"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Project Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-gray-400 text-xs mb-2">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border border-white/10"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief description of your project..."
                    className="input-field resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (editProject ? 'Updating...' : 'Uploading...') : (editProject ? 'Update Project' : 'Add Project')}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Floating Add Button
const FloatingAddButton = ({ onClick }) => {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg hover:shadow-cyan-500/30 transition-shadow"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </motion.button>
  );
};

// Projects Section
const ProjectsSection = ({ projects, onEdit, onDelete, isAdmin }) => {
  return (
    <section id="projects" className="min-h-screen py-32 px-6 md:px-12 relative z-10 bg-dark-900">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">
            My <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Projects</span>
          </h2>
        </motion.div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No projects yet. Add your first project!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// About Section with live editing
const AboutSection = ({ metadata, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditData({
      about_title: metadata?.about_title || 'About Me',
      about_subtitle: metadata?.about_subtitle || 'Full-Stack Developer & Creative Technologist',
      about_description: metadata?.about_description || '',
      about_skills: metadata?.about_skills || []
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSiteMetadata(editData);
    if (result.success) {
      onUpdate({ ...metadata, ...editData });
    }
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...editData.about_skills];
    newSkills[index] = value;
    setEditData({ ...editData, about_skills: newSkills });
  };

  const addSkill = () => {
    setEditData({ ...editData, about_skills: [...editData.about_skills, 'New Skill'] });
  };

  const removeSkill = (index) => {
    const newSkills = editData.about_skills.filter((_, i) => i !== index);
    setEditData({ ...editData, about_skills: newSkills });
  };

  const title = metadata?.about_title || 'About Me';
  const subtitle = metadata?.about_subtitle || 'Full-Stack Developer & Creative Technologist';
  const description = metadata?.about_description || 'I am a passionate developer with expertise in building modern web applications...';
  const skills = metadata?.about_skills || [];

  return (
    <section id="about" className="min-h-screen py-32 px-6 md:px-12 relative z-10 bg-dark-900">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">
              About <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Me</span>
            </h2>
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Edit About Section"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-cyan-400 text-lg mt-4"
              >
                <input
                  type="text"
                  value={editData.about_subtitle}
                  onChange={(e) => setEditData({ ...editData, about_subtitle: e.target.value })}
                  className="bg-transparent border-b border-cyan-500 text-center w-full focus:outline-none text-cyan-400"
                />
              </motion.p>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-cyan-400 text-lg mt-0.5"
              >
                {subtitle}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Image/Avatar */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <div className="w-56 h-56 md:w-72 md:h-72 rounded-xl bg-dark-800/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    {title.charAt(0)}
                  </span>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    type="text"
                    value={editData.about_title}
                    onChange={(e) => setEditData({ ...editData, about_title: e.target.value })}
                    className="text-2xl md:text-3xl font-bold text-white mb-6 bg-transparent border-b border-white/20 w-full focus:outline-none focus:border-cyan-500"
                  />
                  <textarea
                    value={editData.about_description}
                    onChange={(e) => setEditData({ ...editData, about_description: e.target.value })}
                    className="text-gray-400 text-lg mb-8 leading-relaxed bg-dark-800/50 rounded-lg p-4 w-full focus:outline-none focus:border-cyan-500 border border-white/10 resize-none"
                    rows={4}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h3>
                  <p className="text-gray-400 text-lg mb-4 leading-loose">{description}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skills */}
            <div className="mb-2">
              <h4 className="text-white font-semibold mb-0.5">Skills & Technologies</h4>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-3"
                  >
                    {editData.about_skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium focus:outline-none focus:border-cyan-500 w-32"
                        />
                        <button
                          onClick={() => removeSkill(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      + Add Skill
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-3"
                  >
                    {skills.map((skill, index) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <AnimatePresence>
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex gap-4"
                >
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  href="#contact"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Let's Connect
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.a>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = ({ metadata, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleContactClick = (type) => {
    if (isEditing) return;
    const contactLinks = metadata || CONTACT_LINKS;
    if (type === 'email') {
      window.location.href = `mailto:${contactLinks.contact_email || CONTACT_LINKS.email}`;
    } else if (type === 'phone') {
      window.location.href = `tel:${contactLinks.contact_phone || CONTACT_LINKS.phone}`;
    } else if (type === 'github') {
      window.open(contactLinks.github_url || contactLinks.contact_github || CONTACT_LINKS.github, '_blank', 'noopener,noreferrer');
    } else if (type === 'linkedin') {
      window.open(contactLinks.linkedin_url || contactLinks.contact_linkedin || CONTACT_LINKS.linkedin, '_blank', 'noopener,noreferrer');
    } else if (type === 'twitter') {
      window.open(contactLinks.twitter_url || contactLinks.contact_twitter || CONTACT_LINKS.twitter, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEdit = () => {
    setEditData({
      contact_email: metadata?.contact_email || CONTACT_LINKS.email,
      github_url: metadata?.github_url || metadata?.contact_github || CONTACT_LINKS.github,
      linkedin_url: metadata?.linkedin_url || metadata?.contact_linkedin || CONTACT_LINKS.linkedin,
      twitter_url: metadata?.twitter_url || metadata?.contact_twitter || CONTACT_LINKS.twitter,
      contact_phone: metadata?.contact_phone || CONTACT_LINKS.phone,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSiteMetadata(editData);
    if (result.success) {
      onUpdate({ ...metadata, ...editData });
    }
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <section id="contact" className="min-h-screen py-32 px-6 md:px-12 relative z-10 bg-dark-900">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">
              Get In <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Touch</span>
            </h2>
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
          {isEditing ? (
            <div className="mt-0.5 max-w-2xl mx-auto space-y-3">
              <input
                type="text"
                value={editData.contact_email || ''}
                onChange={(e) => setEditData({ ...editData, contact_email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white"
              />
              <input
                type="text"
                value={editData.github_url || ''}
                onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
                placeholder="GitHub URL"
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white"
              />
              <input
                type="text"
                value={editData.linkedin_url || ''}
                onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                placeholder="LinkedIn URL"
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white"
              />
              <input
                type="text"
                value={editData.twitter_url || ''}
                onChange={(e) => setEditData({ ...editData, twitter_url: e.target.value })}
                placeholder="Twitter URL"
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white"
              />
              <input
                type="text"
                value={editData.contact_phone || ''}
                onChange={(e) => setEditData({ ...editData, contact_phone: e.target.value })}
                placeholder="Phone"
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white"
              />
              <div className="flex gap-2 justify-center mt-0.5">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto leading-loose">
              Have a project in mind or want to collaborate? Feel free to reach out!
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
          {/* Email */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => handleContactClick('email')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass p-6 rounded-xl text-left group cursor-pointer max-w-[350px]"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Email</h3>
              <p className="text-gray-400 text-sm truncate">{metadata?.contact_email || CONTACT_LINKS.email}</p>
            </div>
          </motion.button>

          {/* GitHub */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onClick={() => handleContactClick('github')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass p-6 rounded-xl text-left group cursor-pointer max-w-[350px]"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500/20 to-dark-800/50 flex items-center justify-center group-hover:from-gray-500/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">GitHub</h3>
              <p className="text-gray-400 text-sm truncate">View my repositories</p>
            </div>
          </motion.button>

          {/* LinkedIn */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={() => handleContactClick('linkedin')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass p-6 rounded-xl text-left group cursor-pointer max-w-[350px]"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">LinkedIn</h3>
              <p className="text-gray-400 text-sm truncate">Connect with me</p>
            </div>
          </motion.button>

          {/* Twitter */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            onClick={() => handleContactClick('twitter')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass p-6 rounded-xl text-left group cursor-pointer max-w-[350px]"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-sky-600/20 flex items-center justify-center group-hover:from-sky-500/30 group-hover:to-sky-600/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Twitter</h3>
              <p className="text-gray-400 text-sm truncate">Follow me</p>
            </div>
          </motion.button>

          {/* Phone */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            onClick={() => handleContactClick('phone')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass p-6 rounded-xl text-left group cursor-pointer max-w-[350px]"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center group-hover:from-green-500/30 group-hover:to-emerald-600/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Phone</h3>
              <p className="text-gray-400 text-sm">{metadata?.contact_phone || CONTACT_LINKS.phone}</p>
            </div>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = ({ siteMetadata, isAdmin, isViewer, onLogout }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract contact info from metadata
  const githubUrl = siteMetadata?.contact_github || 'https://github.com/yourusername';
  const linkedinUrl = siteMetadata?.contact_linkedin || 'https://linkedin.com/in/yourusername';
  const twitterUrl = siteMetadata?.contact_twitter || 'https://twitter.com/yourusername';

  return (
    <footer className="bg-dark-900/80 backdrop-blur-xl border-t border-white/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand & Logo Area */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Portfolio
            </h3>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Building digital solutions with engineering precision and management insight.
            </p>
          </div>

          {/* Quick Links Navigation */}
          <nav className="text-center">
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="flex flex-wrap justify-center gap-6">
              <li>
                <a 
                  href="#home" 
                  className="text-gray-400 hover:text-cyan-400 transition-all duration-300 text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#projects" 
                  className="text-gray-400 hover:text-cyan-400 transition-all duration-300 text-sm"
                >
                  Projects
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="text-gray-400 hover:text-cyan-400 transition-all duration-300 text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-gray-400 hover:text-cyan-400 transition-all duration-300 text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          {/* Social & Connection Icons */}
          <div className="flex gap-6">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/5 overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/5 overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/5 overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright & Legal Bar */}
      <div className="border-t border-white/10 px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Portfolio. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {/* Logout Button - Show for both admin and viewer */}
            {(isAdmin || isViewer) ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-all duration-300 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            ) : (
              <span className="text-gray-600 text-sm">Welcome, Guest</span>
            )}
            
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-all duration-300 text-sm group"
            >
              <span>Back to Top</span>
              <svg 
                className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteMetadata, setSiteMetadata] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    // Check localStorage for persisted admin state
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [isViewer, setIsViewer] = useState(() => {
    // Check localStorage for persisted viewer state
    return localStorage.getItem('isViewer') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load projects function
  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, []);

  // Load projects on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, metadataData] = await Promise.all([
          fetchProjects(),
          fetchSiteMetadata()
        ]);
        setProjects(projectsData);
        setSiteMetadata(metadataData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle admin login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    
    const result = await signInWithEmail(loginEmail, loginPassword);
    
    if (result.success) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setLoginEmail('');
      setLoginPassword('');
      showToast('Admin logged in successfully!', 'success');
    } else {
      showToast('Login failed: ' + result.error, 'error');
    }
    
    setLoginLoading(false);
  };

  // Handle viewer login (no password required)
  const handleViewerLogin = (e) => {
    e.preventDefault();
    setIsViewer(true);
    localStorage.setItem('isViewer', 'true');
    showToast('Welcome! You are now viewing as a guest.', 'success');
  };

  // Handle logout
  const handleLogout = async () => {
    // If admin, sign out from Supabase
    if (isAdmin) {
      await signOut();
    }
    setIsAdmin(false);
    setIsViewer(false);
    localStorage.setItem('isAdmin', 'false');
    localStorage.setItem('isViewer', 'false');
    setLoginEmail('');
    setLoginPassword('');
    showToast('Logged out successfully!', 'success');
  };

  // Show login page before main content (if not logged in as admin or viewer)
  if (!isAdmin && !isViewer) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Portfolio
            </h1>
            <p className="text-gray-400">Sign in to continue</p>
          </div>
          
          <div className="space-y-6">
            {/* Admin Login Section */}
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Admin Login</h2>
              <p className="text-gray-400 text-sm mb-4">Full access to manage projects</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loginLoading ? 'Logging in...' : 'Login as Admin'}
                </button>
              </form>
            </div>
            
            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            
            {/* Viewer Login Section */}
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">View as Guest</h2>
              <p className="text-gray-400 text-sm mb-4">Browse the portfolio without editing</p>
              <button
                onClick={handleViewerLogin}
                className="w-full px-4 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Enter as Viewer
              </button>
            </div>
          </div>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            Protected by Supabase Authentication
          </p>
        </motion.div>
      </div>
    );
  }

  const handleProjectAdded = () => {
    loadProjects();
  };

  // Handle Edit - open modal with project data
  const handleEdit = (project) => {
    setEditProject(project);
    setIsModalOpen(true);
  };

  // Handle Delete - show confirmation dialog
  const handleDelete = async (project) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`);
    
    if (confirmed) {
      try {
        // Delete the image from storage if it exists
        if (project.image_url && project.image_url.includes('supabase')) {
          // Extract file path from URL
          const urlParts = project.image_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `project-uploads/${fileName}`;
          await deleteProjectImage(filePath);
        }
        
        // Delete from database
        const result = await deleteProject(project.id);
        
        if (result.success) {
          showToast('Project deleted successfully!', 'success');
          loadProjects();
        } else {
          showToast('Failed to delete project: ' + result.error, 'error');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Error deleting project', 'error');
      }
    }
  };

  // Handle modal close - reset edit project
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditProject(null);
  };

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      <Navigation />
      
      <main>
        <HeroSection />
        <ProjectsSection projects={projects} onEdit={handleEdit} onDelete={handleDelete} isAdmin={isAdmin} />
        <AboutSection metadata={siteMetadata} onUpdate={setSiteMetadata} />
        <ContactSection metadata={siteMetadata} onUpdate={setSiteMetadata} />
      </main>
      
      <Footer siteMetadata={siteMetadata} isAdmin={isAdmin} isViewer={isViewer} onLogout={handleLogout} />
      
      {isAdmin && <FloatingAddButton onClick={() => setIsModalOpen(true)} />}
      
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onProjectAdded={handleProjectAdded}
        editProject={editProject}
      />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
