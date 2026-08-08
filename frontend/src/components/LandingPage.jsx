import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ScrollFrameCard from './ScrollFrameCard';
import { Layout, Compass, ShieldCheck, Users, ArrowRight, Sparkles, CheckCircle2, User, LogOut } from 'lucide-react';

const LandingPage = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="landing-page-container">
      {/* Top Navigation Bar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-icon-bg">
            <Layout size={20} className="text-blue-600" />
          </div>
          <span className="logo-text">Interior Studio</span>
        </div>

        <div className="nav-links">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.4rem 0.9rem', borderRadius: '9999px', color: '#1e40af', fontSize: '0.875rem', fontWeight: '700' }}>
                <User size={16} color="#2563eb" /> Welcome
              </div>
              <Link to="/login" className="nav-btn-primary">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
              <button onClick={logout} className="nav-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="nav-btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Side-by-Side Split Hero Section with Sticky Scroll Animation */}
      <section className="scroll-animation-section">
        <div className="split-hero-container">
          
          {/* Left Column: Pure Interior Design Content */}
          <div className="hero-text-side">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>👋 Welcome</span>
            </div>

            <h1 className="hero-title">
              Transform Spatial Concepts into Luxury Realities
            </h1>

            <p className="hero-subtitle">
              Streamline your interior design studio workflows. Manage 3D spatial models, client portals, and project execution seamlessly.
            </p>

            <div className="hero-feature-bullets">
              <div className="bullet-card">
                <div className="bullet-icon-box">
                  <Compass size={18} />
                </div>
                <div>
                  <strong>3D Spatial & Studio Visualization</strong>
                  <p>Scrub through floor plans, material palettes, and 3D renders from blueprint concepts to luxury finishes.</p>
                </div>
              </div>

              <div className="bullet-card">
                <div className="bullet-icon-box">
                  <Users size={18} />
                </div>
                <div>
                  <strong>Interactive Client Collaboration Portal</strong>
                  <p>Provide clients with real-time project phase tracking, design approvals, and budget transparency.</p>
                </div>
              </div>

              <div className="bullet-card">
                <div className="bullet-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong>End-to-End Site & Vendor Management</strong>
                  <p>Track site execution progress, contractor tasks, and material procurement with role-based controls.</p>
                </div>
              </div>
            </div>

            <div className="hero-actions">
              <Link to="/register" className="hero-action-primary">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="hero-action-secondary">
                Sign In to Studio
              </Link>
            </div>
          </div>

          {/* Right Column: Sticky Video / Canvas Card */}
          <div className="hero-card-side">
            <ScrollFrameCard totalFrames={90} />
          </div>

        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="landing-features">
        <div className="features-header">
          <h2>Engineered for Designers, Clients & Project Managers</h2>
          <p>Streamlined workflow tools built specifically for interior design management.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon blue">
              <Compass size={24} />
            </div>
            <h3>Designer Studio</h3>
            <p>Create, customize, and manage 3D spatial models and material specifications in real time.</p>
            <ul className="feature-list">
              <li><CheckCircle2 size={14} /> Material & Floor palette manager</li>
              <li><CheckCircle2 size={14} /> Client presentation mode</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <Users size={24} />
            </div>
            <h3>Client Portal</h3>
            <p>Give clients complete visibility into their interior transformation progress and milestones.</p>
            <ul className="feature-list">
              <li><CheckCircle2 size={14} /> Live phase updates</li>
              <li><CheckCircle2 size={14} /> Budget & payment tracking</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">
              <ShieldCheck size={24} />
            </div>
            <h3>Project Tracking</h3>
            <p>Admin and employee management for site execution, vendor tracking, and timeline delivery.</p>
            <ul className="feature-list">
              <li><CheckCircle2 size={14} /> Role-based authentication</li>
              <li><CheckCircle2 size={14} /> Automated status reports</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="landing-cta">
        <div className="cta-content">
          <h2>Ready to Transform Your Interior Projects?</h2>
          <p>Join thousands of designers managing high-end interior projects seamlessly.</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-primary-btn">
              Create Account Now <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="cta-secondary-btn">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Interior Studio Management. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
