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
  FolderOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DesignerStudio = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
  const fetchAssignedProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
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
        setError(data.message || 'Failed to fetch assigned projects');
      }
    } catch (err) {
      setError('Network error connecting to projects endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedProjects();
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

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
      const token = localStorage.getItem('token');
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
        fetchAssignedProjects();
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
      const token = localStorage.getItem('token');
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
        fetchAssignedProjects();
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
      const token = localStorage.getItem('token');
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
        fetchAssignedProjects();
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
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}/designs/${designId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Design concept removed successfully!');
        setSelectedProject(data.data);
        fetchAssignedProjects();
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
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}/materials/${matId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Material item removed successfully!');
        setSelectedProject(data.data);
        fetchAssignedProjects();
      } else {
        setError(data.message || 'Failed to delete material');
      }
    } catch (err) {
      setError('Network error deleting material');
    }
  };

  // Submit Designs for Client Review Approval
  const handleSubmitForApproval = async () => {
    if (!selectedProject) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${selectedProject._id}/approve-design`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Pending Review', feedback: '' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Designs submitted for Client Review! Status updated to 'Pending Review'.`);
        setSelectedProject(data.data);
        fetchAssignedProjects();
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
      const token = localStorage.getItem('token');
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
        fetchAssignedProjects();
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
      const token = localStorage.getItem('token');
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
        fetchAssignedProjects();
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
        {/* Top Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Palette size={30} color="#2563eb" /> Designer Studio
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Logged in as <strong>{user?.name || 'Interior Designer'}</strong>. Manage assigned projects, upload 2D/3D layouts, and submit designs for client review.
              </p>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '1rem' }}>
            Loading assigned project workspace...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center' }}>
            <Briefcase size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Assigned Projects Found</h3>
            <p style={{ color: '#64748b', margin: 0 }}>You currently have no interior design projects assigned to your account ({user?.name}).</p>
          </div>
        ) : (
          <div>
            {/* Projects Grid */}
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>
              {['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN'].includes(user?.role) ? 'All System Projects & Types' : 'My Assigned Projects'} ({projects.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {projects.map((p) => {
                return (
                  <div
                    key={p._id}
                    onClick={() => openProjectModal(p)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {p.projectId} • {p.projectType}
                      </span>
                      <span style={{ backgroundColor: p.status === 'Completed' ? '#f0fdf4' : p.status === 'In Progress' ? '#eff6ff' : '#f8fafc', color: p.status === 'Completed' ? '#16a34a' : p.status === 'In Progress' ? '#2563eb' : '#64748b', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {p.status}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '700' }}>{p.projectName}</h4>
                    <p style={{ margin: '0 0 0.85rem 0', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      Client: <strong>{p.clientName}</strong> ({p.location})
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '10px', marginBottom: '0.85rem' }}>
                      <div>Designer: <strong style={{ color: '#0f172a' }}>{p.assignedDesigner}</strong></div>
                      <div>Site Eng: <strong style={{ color: '#0f172a' }}>{p.siteEngineer || p.projectManager || 'N/A'}</strong></div>
                      <div>Budget: <strong style={{ color: '#16a34a' }}>₹{p.budget?.toLocaleString()}</strong></div>
                      <div>Progress: <strong style={{ color: '#2563eb' }}>{p.progressPercentage}%</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProjectModal(p);
                        }}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                        }}
                      >
                        <FolderOpen size={16} /> View & Manage Project Specs
                      </button>

                      {['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN'].includes(user?.role) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(p._id);
                          }}
                          style={{
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
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
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Progress Completion (%)</label>
                    <input
                      type="number"
                      name="progressPercentage"
                      min="0"
                      max="100"
                      value={editFormData.progressPercentage}
                      onChange={handleInputChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

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
                <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsStudioModalOpen(false)}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProject}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                  >
                    {savingProject ? 'Saving...' : 'Save Changes'}
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
