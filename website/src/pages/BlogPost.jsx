import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FirestoreService from '../services/firestore';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import MainNavbar from '../components/MainNavbar';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await FirestoreService.getBlogById(id);
        if (data) setBlog(data);
        else navigate('/blog');
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) return null;

  // Helper to fix all-uppercase text
  const fixCaps = (text) => {
    if (!text) return '';
    const upperCount = (text.match(/[A-Z]/g) || []).length;
    const lowerCount = (text.match(/[a-z]/g) || []).length;
    if (upperCount > lowerCount * 2) { 
      // Convert to lowercase then capitalize first letter of sentences
      return text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
    }
    return text;
  };

  const formattedTitle = fixCaps(blog.title);
  const formattedExcerpt = fixCaps(blog.excerpt);

  // Split content by newlines for paragraphs
  const paragraphs = blog.content.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      
      {/* Header */}
      <MainNavbar />

      <main className="pb-20 px-6" style={{ paddingTop: '80px' }}>
        <article className="max-w-3xl mx-auto">
          {/* Article Header */}
          <header className="mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-4 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                <span className="flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-outfit text-white mb-6 leading-tight">
                {formattedTitle}
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                {formattedExcerpt}
              </p>
            </motion.div>
          </header>

          {/* Cover Image */}
          {blog.coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-16 shadow-2xl border border-glass-border relative"
            >
              <img 
                src={blog.coverImage} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
            </motion.div>
          )}

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="prose prose-invert prose-lg max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-8"
          >
            {paragraphs.map((para, index) => {
              const cleanPara = fixCaps(para);

              // Parse markdown images (allow whitespace or being anywhere)
              const imageMatch = cleanPara.match(/!\[(.*?)\]\((.*?)\)/);
              if (imageMatch) {
                // Check if the URL is somewhat valid or just a raw string
                const imgUrl = imageMatch[2].trim();
                return (
                  <div key={index} className="my-10 rounded-2xl overflow-hidden shadow-2xl border border-glass-border bg-slate-900/50 flex flex-col items-center">
                    <img 
                      src={imgUrl} 
                      alt={imageMatch[1]} 
                      className="w-full h-auto object-cover max-h-[500px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden w-full p-8 text-center bg-slate-800/50 border-t border-glass-border">
                      <p className="text-red-400 mb-2">Image failed to load</p>
                      <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm hover:underline break-all">
                        {imgUrl}
                      </a>
                    </div>
                    {imageMatch[1] && <p className="text-center text-sm text-slate-400 mt-2 p-3 italic">{fixCaps(imageMatch[1])}</p>}
                  </div>
                );
              }

              // Parse headings (allow leading whitespace)
              const h3Match = cleanPara.match(/^\s*###\s+(.*)/);
              if (h3Match) return <h3 key={index} className="text-2xl font-bold text-white mt-10 mb-4 font-outfit">{h3Match[1]}</h3>;
              
              const h2Match = cleanPara.match(/^\s*##\s+(.*)/);
              if (h2Match) return <h2 key={index} className="text-3xl font-bold text-cyan-300 mt-12 mb-6 font-outfit tracking-tight">{h2Match[1]}</h2>;
              
              const h1Match = cleanPara.match(/^\s*#\s+(.*)/);
              if (h1Match) return <h1 key={index} className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300 mt-14 mb-8 font-outfit">{h1Match[1]}</h1>;

              // Parse list items
              const listMatch = cleanPara.match(/^\s*-\s+(.*)/);
              if (listMatch) {
                return (
                  <li key={index} className="ml-6 mb-3 list-disc text-slate-300 marker:text-cyan-400">
                    {parseInlineStyles(listMatch[1])}
                  </li>
                );
              }

              // Parse bold text
              const parseInlineStyles = (text) => {
                const parts = text.split(/(\*\*.*?\*\*)/g);
                return parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });
              };

              return (
                <p key={index} className="mb-6 text-lg leading-relaxed text-slate-300">
                  {parseInlineStyles(cleanPara)}
                </p>
              );
            })}
          </motion.div>

          {/* Share & Footer */}
          <div className="mt-16 pt-8 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src="/logo.svg" alt="Doctor" className="w-12 h-12 rounded-full border border-glass-border p-1 bg-slate-900" />
              <div>
                <p className="font-bold text-white">Written by our Experts</p>
                <p className="text-sm text-slate-400">Radhika Super Speciality Dental Hospital</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: blog.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center gap-2 p-3 bg-slate-900 border border-glass-border rounded-xl text-text-muted hover:text-white transition-all clickable"
            >
              <Share2 size={18} />
              Share Article
            </button>
          </div>
        </article>
      </main>

      {/* CTA Footer */}
      <section className="py-20 px-6 bg-slate-900/50 border-t border-glass-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-outfit text-white mb-4">Have questions about your oral health?</h2>
          <p className="text-slate-400 mb-8">Our specialists are here to help. Schedule an appointment today for a comprehensive checkup.</p>
          <a 
            href="https://wa.me/917780449492?text=I%20would%20like%20to%20book%20an%20appointment"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block clickable px-8 py-4"
          >
            Book a Consultation
          </a>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
