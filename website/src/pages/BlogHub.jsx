import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FirestoreService from '../services/firestore';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import MainNavbar from '../components/MainNavbar';

const BlogHub = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = FirestoreService.getBlogs((data) => {
      setBlogs(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-outfit selection:bg-primary/30 relative">
      
      <MainNavbar />


      {/* Hero Section */}
      <section className="pb-20 px-6 relative overflow-hidden" style={{ paddingTop: '80px' }}>
        <div className="absolute inset-0 bg-radial-gradient opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4">Read & Learn</p>
            <h1 className="text-5xl md:text-7xl font-bold font-outfit text-white mb-6 leading-tight">
              Oral Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">Hub</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Expert advice, treatment guides, and tips for maintaining a beautiful, healthy smile from our specialists.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center text-slate-500 py-20">
              <p className="text-xl">No articles published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-slate-900 border border-glass-border rounded-3xl overflow-hidden flex flex-col group cursor-pointer clickable hover:border-primary/50 transition-all duration-300 shadow-xl"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                >
                  <div className="h-56 bg-slate-800 relative overflow-hidden flex items-center justify-center">
                    {blog.coverImage ? (
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <ImageIcon size={48} className="text-slate-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                  </div>
                  <div className="p-8 flex flex-col flex-1 relative bg-slate-900">
                    <span className="text-primary text-[10px] font-bold tracking-widest uppercase mb-3">
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3 className="text-2xl font-bold font-outfit text-white mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-slate-400 mb-6 line-clamp-3 leading-relaxed flex-1">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      Read Article <ArrowRight size={16} className="ml-2" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative border-t border-glass-border">
        <div className="absolute inset-0 bg-radial-gradient opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-6">Need Professional Care?</h2>
          <p className="text-xl text-slate-400 mb-10">Schedule a consultation with our expert team today.</p>
          <a 
            href="https://wa.me/917780449492?text=I%20would%20like%20to%20book%20an%20appointment"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block clickable text-lg px-8 py-4"
          >
            Book Appointment
          </a>
        </div>
      </section>
    </div>
  );
};

export default BlogHub;
