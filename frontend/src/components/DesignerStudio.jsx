import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Palette,
  Briefcase,
  Upload,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  ArrowLeft,
  X,
  Send,
  Layers,
  FileText,
  Sparkles,
  Plus,
  Save,
  FolderOpen,
  RotateCcw,
  MessageSquare,
  LayoutGrid,
  FileCode,
  Image as ImageIcon,
  User,
  Home,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const DesignerStudio = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('assigned'); // assigned, revisions, floorplan, renders, moodboard, catalogue

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');

  // Filtered and Sorted Projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = searchQuery === '' ||
      (p.projectName && p.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.projectId && p.projectId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesType = typeFilter === 'All' || p.projectType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'Name') return (a.projectName || '').localeCompare(b.projectName || '');
    if (sortBy === 'Progress') return (b.progressPercentage || 0) - (a.progressPercentage || 0);
    return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
  });

  // Editable Form Data for Project Modal
  const [editFormData, setEditFormData] = useState({
    projectId: '',
    projectName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    location: '',
    projectType: 'Residential',
    budget: 0,
    assignedDesigner: '',
    siteEngineer: '',
    status: 'In Progress',
    progressPercentage: 0
  });

  const [savingProject, setSavingProject] = useState(false);

  // Upload Design Form State
  const [designTitle, setDesignTitle] = useState('');
  const [designType, setDesignType] = useState('2D Floor Plan');
  const [designFileUrl, setDesignFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Material Entry State
  const [matName, setMatName] = useState('');
  const [matBrand, setMatBrand] = useState('');
  const [matQty, setMatQty] = useState(1);
  const [matUnit, setMatUnit] = useState('Units');
  const [matEstPrice, setMatEstPrice] = useState('');
  const [addingMaterial, setAddingMaterial] = useState(false);

  // Image Preview Modal
  const [previewItem, setPreviewItem] = useState(null);

  // Open Project Modal
  const openProjectModal = (p) => {
    setSelectedProject(p);
    setEditFormData({
      projectId: p.projectId || '',
      projectName: p.projectName || '',
      clientName: p.clientName || '',
      clientEmail: p.clientEmail || '',
      clientPhone: p.clientPhone || '',
      location: p.location || '',
      projectType: p.projectType || 'Residential',
      budget: p.budget || 0,
      assignedDesigner: p.assignedDesigner || '',
      siteEngineer: p.siteEngineer || p.projectManager || 'Unassigned',
      status: p.status || 'In Progress',
      progressPercentage: p.progressPercentage || 0
    });
    setIsStudioModalOpen(true);
  };

  // Fetch Designer's Assigned Projects
  const fetchDesignerData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const isDesignerRole = ['Designer', 'INTERIOR_DESIGNER', 'Interior Designer'].includes(user?.role);
      const url = isDesignerRole
        ? `http://localhost:5001/api/projects?limit=50&assignedDesigner=${encodeURIComponent(user?.name || '')}`
        : 'http://localhost:5001/api/projects?limit=50';

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(data.data || []);
        if (data.data?.length > 0) {
          // Sync selected project if modal is active
          if (selectedProject) {
            const updated = data.data.find(p => p._id === selectedProject._id);
            if (updated) setSelectedProject(updated);
          }
        }
      } else {
        if (res.status === 401 || data.message?.includes('Token') || data.message?.includes('authorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        if (isInitial) setError(data.message || 'Failed to fetch assigned projects');
      }
    } catch (err) {
      if (isInitial) setError('Network error connecting to projects endpoint');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignerData(true);
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'instant' });
    const interval = setInterval(() => {
      fetchDesignerData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Save Project Details
  const handleSaveProjectDetails = async (e) => {
    if (e) e.preventDefault();
    if (!selectedProject) return;
    try {
      setSavingProject(true);
      setError('');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Project specifications updated successfully!');
        setSelectedProject(data.data);
        setIsStudioModalOpen(false);
        fetchDesignerData();
      } else {
        setError(data.message || 'Failed to update project specifications');
      }
    } catch (err) {
      setError('Network error saving project specs');
    } finally {
      setSavingProject(false);
    }
  };

  // Handle Upload Design
  const handleUploadDesign = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!designTitle || !designFileUrl) {
      setError('Please enter a design title and valid image URL');
      return;
    }
    try {
      setUploading(true);
      setError('');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}/designs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: designTitle,
          designType,
          fileUrl: designFileUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Design '${designTitle}' uploaded successfully!`);
        setDesignTitle('');
        setDesignFileUrl('');
        setSelectedProject(data.data);
        fetchDesignerData();
      } else {
        setError(data.message || 'Failed to upload design concept');
      }
    } catch (err) {
      setError('Network error uploading design');
    } finally {
      setUploading(false);
    }
  };

  // Handle Add Material Spec
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!matName || !matEstPrice) {
      setError('Please specify material name and estimated price');
      return;
    }
    try {
      setAddingMaterial(true);
      setError('');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          materialName: matName,
          brand: matBrand,
          quantity: matQty,
          unit: matUnit,
          estimatedPrice: matEstPrice
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Material '${matName}' added to project catalogue!`);
        setMatName('');
        setMatBrand('');
        setMatQty(1);
        setMatEstPrice('');
        setSelectedProject(data.data);
        fetchDesignerData();
      } else {
        setError(data.message || 'Failed to add material spec');
      }
    } catch (err) {
      setError('Network error adding material');
    } finally {
      setAddingMaterial(false);
    }
  };

  // Delete Design File
  const handleDeleteDesign = async (designId) => {
    if (!selectedProject || !designId) return;
    if (!window.confirm('Are you sure you want to delete this design concept?')) return;
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}/designs/${designId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Design concept removed successfully!');
        setSelectedProject(data.data);
        fetchDesignerData();
      } else {
        setError(data.message || 'Failed to remove design');
      }
    } catch (err) {
      setError('Network error deleting design');
    }
  };

  // Delete Material Spec
  const handleDeleteMaterial = async (matId) => {
    if (!selectedProject || !matId) return;
    if (!window.confirm('Remove this material item from catalogue?')) return;
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}/materials/${matId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Material item removed successfully!');
        setSelectedProject(data.data);
        fetchDesignerData();
      } else {
        setError(data.message || 'Failed to delete material');
      }
    } catch (err) {
      setError('Network error deleting material');
    }
  };

  // Submit Designs or Revision for Client Review Approval
  const handleSubmitForApproval = async () => {
    if (!selectedProject) return;
    const isRevision = selectedProject.designApprovalStatus === 'Revision Requested' || selectedProject.workflowStage === 'Revision Requested';
    const statusPayload = isRevision ? 'Revision Submitted' : 'Pending Review';
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}/approve-design`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusPayload, feedback: '' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(isRevision ? `Revision Submitted successfully! Design Version updated to v${data.data.designVersion || 2}.` : `Designs submitted for Client Review! Status updated to 'Pending Review'.`);
        setSelectedProject(data.data);
        fetchDesignerData();
      } else {
        setError(data.message || 'Failed to submit designs for review');
      }
    } catch (err) {
      setError('Network error submitting designs for approval');
    }
  };

  // Admin: Remove / Unassign Designer from Project
  const handleRemoveDesigner = async (projectId) => {
    if (!window.confirm('Are you sure you want to remove the assigned designer from this project?')) return;
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assignedDesigner: 'Unassigned' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Designer unassigned from project successfully');
        if (selectedProject?._id === projectId) setIsStudioModalOpen(false);
        fetchDesignerData();
      } else {
        setError(data.message || 'Failed to unassign designer');
      }
    } catch (err) {
      setError('Network error unassigning designer');
    }
  };

  // Admin: Delete Project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to completely delete this project?')) return;
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Project removed successfully');
        if (selectedProject?._id === projectId) setIsStudioModalOpen(false);
        fetchDesignerData();
      } else {
        setError(data.message || 'Failed to delete project');
      }
    } catch (err) {
      setError('Network error deleting project');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem' }}>
          <Link to="/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>Dashboard</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0f172a' }}>Designer Studio</span>
        </div>

        {/* Top Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Palette size={30} color="#2563eb" /> Designer Studio
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Logged in as <strong>{user?.name || 'Interior Designer'}</strong>. Manage assigned projects, upload 2D/3D layouts, and submit designs for client review.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Top Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Assigned Projects</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{projects.length}</h2>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Pending Revisions</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {projects.filter(p => p.designApprovalStatus === 'Revision Requested' || p.workflowStage === 'Revision Requested').length}
              </h2>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Completed Projects</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {projects.filter(p => p.status === 'Completed' && (p.progressPercentage || 0) >= 100).length}
              </h2>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Average Rating</span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>4.8⭐</h2>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <span>{error}</span>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setError('')} />
          </div>
        )}
        {successMsg && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <span>{successMsg}</span>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setSuccessMsg('')} />
          </div>
        )}

        {/* Search, Filter & Tab Controls */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('assigned')}
              style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'assigned' ? '#2563eb' : '#f1f5f9', color: activeTab === 'assigned' ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FolderOpen size={16} /> Assigned ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('revisions')}
              style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'revisions' ? '#eab308' : '#f1f5f9', color: activeTab === 'revisions' ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RotateCcw size={16} /> Request Revisions ({projects.filter(p => p.designApprovalStatus === 'Revision Requested' || p.workflowStage === 'Revision Requested' || p.designApprovalStatus === 'Changes Requested').length})
            </button>
            <button
              onClick={() => setActiveTab('clientPhotos')}
              style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'clientPhotos' ? '#16a34a' : '#f1f5f9', color: activeTab === 'clientPhotos' ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ImageIcon size={16} /> Client Site Photos ({projects.reduce((acc, p) => acc + (p.sitePhotos?.length || 0), 0)})
            </button>
          </div>

          {/* Search & Filters Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="🔍 Search Projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.85rem 0.5rem 2.2rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155', backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">Status: All</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155', backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">Type: All</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155', backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Latest">Sort: Latest</option>
              <option value="Name">Sort: Name</option>
              <option value="Progress">Sort: Progress</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '1rem' }}>
            Loading assigned project workspace...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center' }}>
            <Briefcase size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Matching Projects Found</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Try adjusting your search criteria or clear your active filters.</p>
          </div>
        ) : activeTab === 'clientPhotos' ? (
          /* CLIENT SITE PHOTOS DEDICATED VIEW */
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', padding: '1.5rem' }}>
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={22} color="#16a34a" /> Client Site Photos & Tile Estimator Directory
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                Review room photos uploaded by clients with automated square footage & tile requirements for your 2D and 3D interior design plans.
              </p>
            </div>

            {projects.filter(p => p.sitePhotos && p.sitePhotos.length > 0).length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: '700' }}>No Client Site Photos Uploaded Yet</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Site photos uploaded by clients in their Client Portal will automatically appear here with room tile estimates.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {projects.filter(p => p.sitePhotos && p.sitePhotos.length > 0).map((proj) => (
                  <div key={proj._id} style={{ backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '800' }}>{proj.projectName}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Client: <strong>{proj.clientName}</strong> ({proj.clientEmail}) • Project ID: {proj.projectId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openProjectModal(proj)}
                        style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Upload size={14} /> Open Design Studio
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                      {proj.sitePhotos.map((photo, pIdx) => (
                        <div key={pIdx} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                          <img src={photo.fileUrl} alt={photo.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                          <div style={{ padding: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                              <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>{photo.roomType}</span>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            <h5 style={{ margin: '0 0 0.4rem 0', color: '#0f172a', fontSize: '0.9rem', fontWeight: '700' }}>{photo.title}</h5>
                            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem 0.65rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700', color: '#166534' }}>
                              <span>📐 Area: {photo.sqFeetEstimate} Sq.Ft</span>
                              <span>🧱 ~{photo.tilesCountEstimate} Tiles</span>
                            </div>
                            {photo.notes && <p style={{ margin: '0.4rem 0 0 0', color: '#64748b', fontSize: '0.75rem', fontStyle: 'italic' }}>"{photo.notes}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'revisions' ? (
          /* REVISION REQUESTS PAGE */
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fefce8', fontWeight: '700', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={20} color="#ca8a04" /> Projects Requiring Changes & Client Revision Feedback
            </div>

            {filteredProjects.filter(p => p.designApprovalStatus === 'Revision Requested' || p.workflowStage === 'Revision Requested' || p.designApprovalStatus === 'Changes Requested').length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <CheckCircle size={40} color="#16a34a" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>No Pending Revision Requests</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>All designs are either pending initial review or already approved by clients!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '0.9rem 1.25rem' }}>Project</th>
                      <th style={{ padding: '0.9rem 1.25rem' }}>Client</th>
                      <th style={{ padding: '0.9rem 1.25rem' }}>Status</th>
                      <th style={{ padding: '0.9rem 1.25rem' }}>Client Comments / Requested Changes</th>
                      <th style={{ padding: '0.9rem 1.25rem' }}>Version</th>
                      <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.filter(p => p.designApprovalStatus === 'Revision Requested' || p.workflowStage === 'Revision Requested' || p.designApprovalStatus === 'Changes Requested').map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#0f172a' }}>{p.projectName}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>{p.clientName}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {p.designApprovalStatus || 'Revision Requested'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#0f172a', fontWeight: '600', maxWidth: '320px' }}>
                          💬 "{p.clientFeedback || 'Client requested revisions on 2D floor plan & 3D renders.'}"
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#2563eb' }}>
                          v{p.designVersion || 1}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => openProjectModal(p)}
                            style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                          >
                            <Upload size={14} /> Upload Revised Design
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Projects Grid */}
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>
              {['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN'].includes(user?.role) ? 'All System Projects & Types' : 'My Assigned Projects'} ({filteredProjects.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {filteredProjects.map((p) => {
                const progressPct = p.progressPercentage || 0;
                const createdDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Aug 2026';
                const deadlineDate = p.startDate ? new Date(new Date(p.startDate).getTime() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Oct 2026';

                return (
                  <div
                    key={p._id}
                    className="saas-card"
                    onClick={() => openProjectModal(p)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #E5E7EB',
                      padding: '24px',
                      minHeight: '340px',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div>
                      {/* Top ID & Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {p.projectId} • {p.projectType}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ backgroundColor: p.status === 'Completed' ? '#f0fdf4' : p.status === 'In Progress' ? '#eff6ff' : '#f8fafc', color: p.status === 'Completed' ? '#16a34a' : p.status === 'In Progress' ? '#2563eb' : '#64748b', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {p.status}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                            Updated 2h ago
                          </span>
                        </div>
                      </div>

                      {/* Title & Client */}
                      <h3 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>{p.projectName}</h3>
                      <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        Client: <strong style={{ color: '#334155' }}>{p.clientName}</strong> ({p.location})
                      </p>

                      {/* Dates */}
                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.775rem', color: '#64748b', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} color="#94a3b8" /> Created: <strong style={{ color: '#334155' }}>{createdDate}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={14} color="#94a3b8" /> Deadline: <strong style={{ color: '#334155' }}>{deadlineDate}</strong>
                        </div>
                      </div>

                      {/* Visual Animated Progress Bar */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.8rem', fontWeight: '600' }}>
                          <span style={{ color: '#475569' }}>Completion Progress</span>
                          <span style={{ color: '#2563eb', fontWeight: '700' }}>{progressPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: progressPct >= 100 ? '#16a34a' : '#2563eb', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                        </div>
                      </div>

                      {/* Client Site Photos & Tile Estimator Badge */}
                      {p.sitePhotos && p.sitePhotos.length > 0 && (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '1.25rem', fontSize: '0.775rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                            <span style={{ fontWeight: '700', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              📸 {p.sitePhotos.length} Client Site Photo(s) Uploaded
                            </span>
                            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.1rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                              Tile Estimator Active
                            </span>
                          </div>
                          <div style={{ color: '#15803d', fontSize: '0.75rem', fontWeight: '600' }}>
                            📐 Total Area: {p.sitePhotos.reduce((sum, item) => sum + (item.sqFeetEstimate || 0), 0)} Sq.Ft | 🧱 Tiles Required: ~{p.sitePhotos.reduce((sum, item) => sum + (item.tilesCountEstimate || 0), 0)} Tiles (2x2 ft)
                          </div>
                        </div>
                      )}

                      {/* Interactive Workflow Stepper Line */}
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '1.25rem', fontSize: '0.725rem', color: '#475569' }}>
                        <span style={{ fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Workflow Stage:</span>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                          <span style={{ color: '#16a34a', fontWeight: '700' }}>✔ Requirement</span> →
                          <span style={{ color: progressPct >= 20 ? '#16a34a' : '#64748b', fontWeight: '700' }}>{progressPct >= 20 ? '✔ Floor Plan' : '⬜ Floor Plan'}</span> →
                          <span style={{ color: progressPct >= 40 ? '#16a34a' : '#64748b', fontWeight: '700' }}>{progressPct >= 40 ? '✔ 3D Design' : '⬜ 3D Design'}</span> →
                          <span style={{ color: p.designApprovalStatus === 'Approved' ? '#16a34a' : p.designApprovalStatus === 'Revision Requested' ? '#d97706' : '#2563eb', fontWeight: '700' }}>
                            {p.designApprovalStatus === 'Approved' ? '✔ Client Review' : '🟡 Client Review'}
                          </span> →
                          <span style={{ color: progressPct >= 80 ? '#16a34a' : '#94a3b8' }}>{progressPct >= 80 ? '✔ Execution' : '⬜ Execution'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.25rem' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProjectModal(p);
                        }}
                        style={{
                          flex: 1,
                          height: '42px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <FolderOpen size={16} /> Open Project
                      </button>

                      {['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN'].includes(user?.role) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(p._id);
                          }}
                          title="Delete Project"
                          style={{
                            width: '40px',
                            height: '42px',
                            borderRadius: '10px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DEDICATED PROJECT DETAILS & SPECIFICATIONS MODAL */}
      {isStudioModalOpen && selectedProject && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>

            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', sticky: 'top', backgroundColor: '#ffffff', zIndex: 10 }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: '800' }}>
                  Edit Project Details
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Enter project specifications and client contract details.
                </p>
              </div>
              <X size={24} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsStudioModalOpen(false)} />
            </div>

            {/* Modal Form Content */}
            <div style={{ padding: '1.75rem' }}>

              {/* CLIENT REVISION REQUEST BANNER */}
              {(selectedProject.designApprovalStatus === 'Revision Requested' || selectedProject.workflowStage === 'Revision Requested') && (
                <div style={{ backgroundColor: '#fefce8', border: '1.5px solid #fef08a', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a16207', fontWeight: '800', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    <RotateCcw size={18} /> Client Requested Revisions (Design Version v{selectedProject.designVersion || 1})
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#854d0e', fontSize: '0.9rem', fontWeight: '600' }}>
                    💬 Client Feedback: "{selectedProject.clientFeedback || 'Please update the 2D layout and 3D render designs as per client requirements.'}"
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#a16207' }}>
                    Upload your updated 2D/3D design files below and click <strong>"Submit Revision for Client Review"</strong> to send Version {(selectedProject.designVersion || 1) + 1} back to client.
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveProjectDetails}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Project ID *</label>
                    <input
                      type="text"
                      disabled
                      value={editFormData.projectId}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.9rem', outline: 'none', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Project Title *</label>
                    <input
                      type="text"
                      name="projectName"
                      required
                      value={editFormData.projectName}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      required
                      value={editFormData.clientName}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Client Email *</label>
                    <input
                      type="email"
                      name="clientEmail"
                      required
                      value={editFormData.clientEmail}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Client Phone *</label>
                    <input
                      type="text"
                      name="clientPhone"
                      required
                      value={editFormData.clientPhone}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Site Location *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={editFormData.location}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Project Type</label>
                    <select
                      name="projectType"
                      value={editFormData.projectType}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Renovation">Renovation</option>
                      <option value="Modular Kitchen">Modular Kitchen</option>
                      <option value="Full Villa Interior">Full Villa Interior</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Project Budget (₹) *</label>
                    <input
                      type="number"
                      name="budget"
                      required
                      value={editFormData.budget}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Assigned Designer *</label>
                    <input
                      type="text"
                      name="assignedDesigner"
                      required
                      value={editFormData.assignedDesigner}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Assigned Site Engineer</label>
                    <input
                      type="text"
                      name="siteEngineer"
                      value={editFormData.siteEngineer}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Project Status</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Progress Completion (%) (Updated by Site Engineer)</label>
                    <input
                      type="number"
                      name="progressPercentage"
                      readOnly
                      disabled
                      value={editFormData.progressPercentage}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.9rem', outline: 'none', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                {/* Section: Client Uploaded Site Photos & Tile Estimator */}
                {selectedProject?.sitePhotos && selectedProject.sitePhotos.length > 0 && (
                  <div style={{ marginTop: '1.25rem', padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      📸 Client Uploaded Site Photos ({selectedProject.sitePhotos.length})
                    </h4>
                    <p style={{ margin: '0 0 1rem 0', color: '#15803d', fontSize: '0.8rem' }}>
                      Review client's room photos & square footage estimates to determine tile counts and material specifications easily.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem' }}>
                      {selectedProject.sitePhotos.map((photo, pIdx) => (
                        <div key={pIdx} style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #dcfce7', overflow: 'hidden', padding: '0.6rem' }}>
                          <img src={photo.fileUrl} alt={photo.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.4rem' }} />
                          <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#0f172a' }}>{photo.title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700', marginTop: '0.2rem' }}>
                            📐 {photo.sqFeetEstimate} Sq.Ft → 🧱 ~{photo.tilesCountEstimate} Tiles (2x2 ft)
                          </div>
                          {photo.notes && <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.2rem' }}>"{photo.notes}"</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Upload Design File */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.85rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🎨 Upload Design File (2D Floor Plan / 3D Renders / Catalogues)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Design Title (e.g. Master Bedroom 3D Render)"
                      value={designTitle}
                      onChange={(e) => setDesignTitle(e.target.value)}
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <select
                      value={designType}
                      onChange={(e) => setDesignType(e.target.value)}
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value="2D Floor Plan">2D Floor Plan</option>
                      <option value="3D Render">3D Render</option>
                      <option value="Moodboard">Moodboard</option>
                      <option value="Material Catalogue">Material Catalogue</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="File Image / Blueprint URL (e.g. https://images.unsplash.com/...)"
                      value={designFileUrl}
                      onChange={(e) => setDesignFileUrl(e.target.value)}
                      style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={handleUploadDesign}
                      style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Design'}
                    </button>
                  </div>

                  {/* Uploaded Designs List */}
                  {selectedProject.designs?.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.85rem', marginTop: '1.25rem' }}>
                      {selectedProject.designs.map((ds) => (
                        <div key={ds._id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                          <img src={ds.fileUrl} alt={ds.title} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                          <div style={{ padding: '0.55rem' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0f172a' }}>{ds.title}</div>
                            <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '600' }}>{ds.designType}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section: Add Material Spec */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.85rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📦 Add Material Spec & Estimated Price (Designer / PM)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '0.65rem' }}>
                    <input
                      type="text"
                      placeholder="Material Name (e.g. Waterproof Plywood)"
                      value={matName}
                      onChange={(e) => setMatName(e.target.value)}
                      style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <input
                      type="text"
                      placeholder="Brand (e.g. CenturyPly)"
                      value={matBrand}
                      onChange={(e) => setMatBrand(e.target.value)}
                      style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={matQty}
                        onChange={(e) => setMatQty(e.target.value)}
                        style={{ width: '65px', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                      />
                      <input
                        type="text"
                        placeholder="Units"
                        value={matUnit}
                        onChange={(e) => setMatUnit(e.target.value)}
                        style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder="Estimated Price in ₹ (e.g. 36000)"
                      value={matEstPrice}
                      onChange={(e) => setMatEstPrice(e.target.value)}
                      style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button
                      type="button"
                      disabled={addingMaterial}
                      onClick={handleAddMaterial}
                      style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                    >
                      {addingMaterial ? 'Adding...' : 'Add Material Spec'}
                    </button>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setIsStudioModalOpen(false)}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitForApproval}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', backgroundColor: '#eab308', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(234, 179, 8, 0.35)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Send size={16} /> {(selectedProject.designApprovalStatus === 'Revision Requested' || selectedProject.workflowStage === 'Revision Requested') ? 'Submit Revision for Client Review' : 'Submit Designs for Client Review'}
                  </button>

                  <button
                    type="submit"
                    disabled={savingProject}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                  >
                    {savingProject ? 'Saving...' : 'Save Project Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '800px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{previewItem.title}</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setPreviewItem(null)} />
            </div>
            <div style={{ padding: '1rem', textAlign: 'center', maxHeight: '70vh', overflowY: 'auto' }}>
              <img src={previewItem.fileUrl} alt={previewItem.title} style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerStudio;
