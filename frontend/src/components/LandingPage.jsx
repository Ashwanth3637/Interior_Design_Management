import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight, ShieldCheck, Palette, Sparkles, Star, Award, Layers, Clock, MessageCircle, Home } from 'lucide-react';
import livingRoomImg from '../assets/modern_living_room_1786169766310.png';
import kitchenImg from '../assets/luxury_kitchen_1786169786299.png';
import bedroomImg from '../assets/master_bedroom_1786169805566.png';
import officeImg from '../assets/minimalist_office_1786169869898.png';

const LandingPage = () => {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#0f172a', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Top Utility Bar */}
      <div style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '0.5rem 3rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Phone size={14} color="#2563eb" /> <strong>Call Us:</strong> <a href="tel:9345271959" style={{ color: '#e2e8f0', textDecoration: 'none' }}>+91 9345271959</a>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Mail size={14} color="#2563eb" /> <strong>Email:</strong> <a href="mailto:ashwanth2567@gmail.com" style={{ color: '#e2e8f0', textDecoration: 'none' }}>ashwanth2567@gmail.com</a>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#e2e8f0', fontWeight: '500' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} color="#2563eb" /> Mon–Sat: 9:00 AM – 6:00 PM
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="#2563eb" /> Chennai • Coimbatore • Erode
          </span>
        </div>
      </div>

      {/* Navigation Header with Custom SVG Logo */}
      <nav style={{ padding: '1.25rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Custom IC House Badge Logo */}
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.25rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)', position: 'relative' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '0.55rem', fontWeight: '900', color: '#ffffff', background: '#0f172a', padding: '1px 3px', borderRadius: '4px' }}>IC</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
              InteriorCraft <span style={{ color: '#2563eb' }}>Studio</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Interior Design & Project Management</span>
          </div>
        </div>

        {/* Dynamic Nav Active State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.95rem', fontWeight: '600' }}>
          <a 
            href="#" 
            onClick={() => setActiveNav('home')} 
            style={{ color: activeNav === 'home' ? '#2563eb' : '#475569', textDecoration: 'none', transition: 'color 0.2s ease', borderBottom: activeNav === 'home' ? '2px solid #2563eb' : 'none', paddingBottom: '0.2rem' }}
          >
            Home
          </a>
          <a 
            href="#about" 
            onClick={() => setActiveNav('about')} 
            style={{ color: activeNav === 'about' ? '#2563eb' : '#475569', textDecoration: 'none', transition: 'color 0.2s ease', borderBottom: activeNav === 'about' ? '2px solid #2563eb' : 'none', paddingBottom: '0.2rem' }}
          >
            About Us
          </a>
          <a 
            href="#portfolio" 
            onClick={() => setActiveNav('portfolio')} 
            style={{ color: activeNav === 'portfolio' ? '#2563eb' : '#475569', textDecoration: 'none', transition: 'color 0.2s ease', borderBottom: activeNav === 'portfolio' ? '2px solid #2563eb' : 'none', paddingBottom: '0.2rem' }}
          >
            Portfolio
          </a>
          <a 
            href="#services" 
            onClick={() => setActiveNav('services')} 
            style={{ color: activeNav === 'services' ? '#2563eb' : '#475569', textDecoration: 'none', transition: 'color 0.2s ease', borderBottom: activeNav === 'services' ? '2px solid #2563eb' : 'none', paddingBottom: '0.2rem' }}
          >
            Services
          </a>
          <a 
            href="#testimonials" 
            onClick={() => setActiveNav('testimonials')} 
            style={{ color: activeNav === 'testimonials' ? '#2563eb' : '#475569', textDecoration: 'none', transition: 'color 0.2s ease', borderBottom: activeNav === 'testimonials' ? '2px solid #2563eb' : 'none', paddingBottom: '0.2rem' }}
          >
            Testimonials
          </a>
          <a 
            href="#contact" 
            onClick={() => setActiveNav('contact')} 
            style={{ color: activeNav === 'contact' ? '#2563eb' : '#475569', textDecoration: 'none', transition: 'color 0.2s ease', borderBottom: activeNav === 'contact' ? '2px solid #2563eb' : 'none', paddingBottom: '0.2rem' }}
          >
            Contact
          </a>
          
          <Link to="/login" className="hover-btn" style={{ backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}>
            Customer & Staff Login <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '4rem 3rem', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <div>
          <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
            <Sparkles size={16} /> Interior Design & Home Renovation
          </span>
          <h1 style={{ fontSize: '2.85rem', fontWeight: '800', lineHeight: 1.2, color: '#0f172a', margin: '0 0 1.25rem 0', letterSpacing: '-0.02em' }}>
            Designing Beautiful Spaces for <span style={{ color: '#2563eb' }}>Everyday Living</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '560px' }}>
            We help homeowners and businesses design modern interiors with complete project management from planning to handover.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="hover-btn" style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '0.85rem 1.8rem', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}>
              Start Your Project <ArrowRight size={18} />
            </Link>
            <a href="tel:9345271959" className="hover-btn" style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.85rem 1.5rem', borderRadius: '10px', fontWeight: '600', textDecoration: 'none', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={18} color="#2563eb" /> Call Designer
            </a>
          </div>

          {/* Believable Metrics */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>120+</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Completed Projects</p>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>95%</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>On-Time Delivery</p>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>4.8 ★</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Customer Rating</p>
            </div>
          </div>
        </div>

        {/* Hero Main Showcase Image with Zoom Container */}
        <div className="img-zoom-container" style={{ borderRadius: '20px', border: '2px solid #000000', boxShadow: '0 20px 30px -10px rgba(0,0,0,0.15)', position: 'relative', backgroundColor: '#ffffff', overflow: 'hidden' }}>
          <img 
            src="/living_room_line_art_sketch.png" 
            alt="Living Room 2D Line Art Design" 
            className="img-zoom"
            style={{ width: '100%', height: '480px', objectFit: 'cover', borderRadius: '18px' }} 
          />
        </div>
      </section>

      {/* Company Info Bar */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1.75rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Established</span>
            <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>Since 2022</strong>
          </div>
          <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Projects Delivered</span>
            <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>120+ Completed</strong>
          </div>
          <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Service Cities</span>
            <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>Chennai, Coimbatore, Erode</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Design Services</span>
            <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>3D Design & Execution</strong>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{ padding: '3.5rem 3rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About Us</span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0 1rem 0' }}>Crafting Functional & Modern Interiors</h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
            InteriorCraft Studio is a Tamil Nadu–based interior design company specializing in residential and commercial spaces. 
            We focus on quality craftsmanship, transparent pricing, and timely project delivery through our integrated role-based workflow.
          </p>
        </div>
      </section>

      {/* Portfolio Section (Reduced Vertical Spacing by 30-40px, Consistent 3D Renders) */}
      <section id="portfolio" style={{ padding: '3.5rem 3rem', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio</span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0f172a', margin: '0.4rem 0 0.5rem 0' }}>Our Recent Interior Projects</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Take a look at our rendered living rooms, kitchens, bedrooms, and commercial workspace concepts.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {/* Card 1: Living Room (3D Render) */}
          <div className="hover-card" style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div className="img-zoom-container">
              <img src={livingRoomImg} alt="Modern Living Room 3D Render" className="img-zoom" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>Living Room</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0.6rem 0 0.3rem 0', color: '#0f172a' }}>Modern Living Space</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Wooden ceiling paneling, comfortable seating arrangement, and warm ambient lights.</p>
            </div>
          </div>

          {/* Card 2: Kitchen */}
          <div className="hover-card" style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div className="img-zoom-container">
              <img src={kitchenImg} alt="Modular Kitchen" className="img-zoom" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>Modular Kitchen</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0.6rem 0 0.3rem 0', color: '#0f172a' }}>Contemporary Kitchen Design</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Under-cabinet strip lighting, quartz countertop island, and matte storage drawers.</p>
            </div>
          </div>

          {/* Card 3: Bedroom */}
          <div className="hover-card" style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div className="img-zoom-container">
              <img src={bedroomImg} alt="Master Bedroom" className="img-zoom" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>Master Bedroom</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0.6rem 0 0.3rem 0', color: '#0f172a' }}>Modern Bedroom Design</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Upholstered bed headboard, side sconces, wooden flooring, and cozy rug setup.</p>
            </div>
          </div>

          {/* Card 4: Commercial Office Render */}
          <div className="hover-card" style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div className="img-zoom-container">
              <img src={officeImg} alt="Executive Office" className="img-zoom" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>Commercial Workspace</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0.6rem 0 0.3rem 0', color: '#0f172a' }}>Executive Office Suite</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Wood wall panelling, glass partitioning, executive lounge setup, and city skyline view.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" style={{ padding: '3.5rem 3rem', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Our Services</span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0f172a', margin: '0.4rem 0 0.5rem 0' }}>Why Work With InteriorCraft?</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Our management portal tracks every step from initial planning to site handover.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div className="hover-card" style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Palette size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>3D Interior Design Services</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>Our designers upload 2D floor plans & 3D renders directly to your client portal for review and feedback.</p>
          </div>

          <div className="hover-card" style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Clear Itemized Quotations</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>Itemized breakdowns for materials, carpentry, electrical work, and labor so you know exact costs.</p>
          </div>

          <div className="hover-card" style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Site Progress Updates</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>Daily progress logs uploaded directly by site engineers along with status notes and payment receipts.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{ padding: '3.5rem 3rem', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Reviews</span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0f172a', margin: '0.4rem 0 0.5rem 0' }}>What Our Clients Say</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Feedback from homeowners and clients we have worked with across Tamil Nadu.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          <div className="hover-card" style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '0.75rem' }}>⭐⭐⭐⭐⭐</div>
            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.25rem' }}>
              "The team completed our home renovation on time and kept us updated throughout the project. The 3D layout matched the final output really well."
            </p>
            <div style={{ fontWeight: '700', color: '#0f172a' }}>Priya S.</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Client • Chennai</div>
          </div>

          <div className="hover-card" style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '0.75rem' }}>⭐⭐⭐⭐⭐</div>
            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.25rem' }}>
              "The design suggestions were practical and matched our budget perfectly. The online client portal made tracking progress very convenient."
            </p>
            <div style={{ fontWeight: '700', color: '#0f172a' }}>Arun K.</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Client • Coimbatore</div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '4rem 3rem', backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#60a5fa', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase' }}>Contact Us</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.5rem 0 1rem 0', color: '#ffffff' }}>Get in Touch With Our Team</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Contact us to discuss your interior requirements or sign in to your account to review updates.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Phone / WhatsApp</span>
                  <a href="tel:9345271959" style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700', textDecoration: 'none' }}>+91 9345271959</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Email Address</span>
                  <a href="mailto:ashwanth2567@gmail.com" style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700', textDecoration: 'none' }}>ashwanth2567@gmail.com</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Office Hours</span>
                  <span style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700' }}>Mon – Sat: 9:00 AM – 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '2.5rem', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Project Login Portal</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>Sign in to access your dashboard, design uploads, and milestone progress.</p>

            <Link to="/login" className="hover-btn" style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}>
              Customer & Staff Login <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/919345271959?text=Hello%20InteriorCraft%20Studio,%20I%20would%20like%20to%20enquire%20about%20interior%20design%20services." 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle size={20} /> WhatsApp
      </a>

      {/* Professional Copyright Footer */}
      <footer style={{ backgroundColor: '#020617', color: '#64748b', padding: '1.5rem 3rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid #1e293b' }}>
        © 2026 InteriorCraft Studio. All Rights Reserved. • Email: ashwanth2567@gmail.com • Contact: +91 9345271959
      </footer>
    </div>
  );
};

export default LandingPage;
