import React, { useState, useEffect } from 'react';
import FirestoreService from '../services/firestore';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({ title: '', excerpt: '', coverImage: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = FirestoreService.getBlogs((data) => {
      setBlogs(data);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        coverImage: blog.coverImage || '',
        content: blog.content || ''
      });
    } else {
      setEditingBlog(null);
      setFormData({ title: '', excerpt: '', coverImage: '', content: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    setFormData({ title: '', excerpt: '', coverImage: '', content: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingBlog) {
        await FirestoreService.updateBlog(editingBlog.id, formData);
      } else {
        await FirestoreService.addBlog(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Error saving blog post.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await FirestoreService.deleteBlog(id);
      } catch (err) {
        console.error(err);
        alert('Error deleting post.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div>
          <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Radhika Super Speciality</p>
          <h1 className="text-3xl font-bold font-outfit">Blog Management</h1>
          <p className="text-text-muted text-sm mt-1 tracking-wide uppercase">Manage Oral Health Hub Content</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(blog => (
          <motion.div 
            key={blog.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-glass-border rounded-2xl overflow-hidden flex flex-col hover:border-primary/50 transition-all group"
          >
            <div className="h-48 bg-slate-800 relative overflow-hidden flex items-center justify-center">
              {blog.coverImage ? (
                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <ImageIcon size={48} className="text-slate-700" />
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold font-outfit mb-2 line-clamp-2">{blog.title}</h3>
              <p className="text-sm text-text-muted mb-4 line-clamp-3 flex-1">{blog.excerpt}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-glass-border">
                <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(blog)}
                    className="p-2 bg-slate-800 rounded-lg text-text-muted hover:text-primary transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 bg-red-500/10 rounded-lg text-danger hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {blogs.length === 0 && (
          <div className="col-span-full py-20 text-center text-text-muted border border-dashed border-glass-border rounded-2xl">
            <p>No blog posts found. Create your first one!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{editingBlog ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={handleCloseModal} className="p-2 text-text-muted hover:text-white bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Title</label>
                <input
                  required
                  type="text"
                  placeholder="Enter blog post title"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Excerpt (Short Description)</label>
                <textarea
                  required
                  rows="2"
                  placeholder="A brief summary for the card view"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary resize-none"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">Content (Use empty lines for paragraphs)</label>
                <textarea
                  required
                  rows="12"
                  placeholder="Write your article content here..."
                  className="w-full bg-slate-900 border border-glass-border rounded-xl px-5 py-4 outline-none focus:border-primary resize-y"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="flex-1 py-4 rounded-xl border border-glass-border font-medium hover:bg-slate-800 transition-all"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary py-4"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : (editingBlog ? 'Update Post' : 'Publish Post')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
