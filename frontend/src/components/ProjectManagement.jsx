import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FolderKanban,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  UserCheck,
  Building,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { designImages } from '../assets/images';

const ProjectManagement = () => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || '';
  const isAdminOrPM = ['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN', 'Project Manager', 'PROJECT_MANAGER'].includes(userRole);
  const isDesigner = ['INTERIOR_DESIGNER', 'Interior Designer', 'Designer'].includes(userRole);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [projectType, setProjectType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [designersList, setDesignersList] = useState([]);
  const [siteEngineersList, setSiteEngineersList] = useState([]);
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientPassword: '',
    location: '',
    projectType: 'Residential',
    budget: 500000,
    spentAmount: 0,
    assignedDesigner: '',
    projectManager: '',
    siteEngineer: '',
    status: 'Planning',
    startDate: '',
    endDate: '',
    progressPercentage: 0,
    assignedWorkersCount: 0
  });

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' };

  // Design File Upload state for Designers
  const [designTitle, setDesignTitle] = useState('');
  const [designType, setDesignType] = useState('2D Floor Plan');
  const [designFileUrl, setDesignFileUrl] = useState('');
  const [uploadingDesign, setUploadingDesign] = useState(false);

  // Material Catalogue entry state for Designers
  const [matName, setMatName] = useState('');
  const [matBrand, setMatBrand] = useState('');
  const [matQty, setMatQty] = useState(1);
  const [matUnit, setMatUnit] = useState('Units');
  const [matEstPrice, setMatEstPrice] = useState('');
  const [addingMaterial, setAddingMaterial] = useState(false);

  const fetchProjects = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const queryParams = new URLSearchParams({
        page,
        limit: 6,
        ...(search && { search }),
        ...(status && { status }),
        ...(projectType && { projectType }),
        ...(isDesigner && user?.name && { assignedDesigner: user.name })
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/projects?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProjects(data.data);
        setTotalPages(data.totalPages);
        setTotalProjects(data.total);
      } else {
        if (response.status === 401 || data.message?.includes('Token') || data.message?.includes('authorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        if (isInitial) setError(data.message || 'Failed to fetch projects');
      }
    } catch (err) {
      if (isInitial) setError('Server error connecting to projects endpoint');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleAddMaterialItem = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    if (!matName || !matEstPrice) {
      setError('Please specify material name and estimated price');
      return;
    }
    try {
      setAddingMaterial(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${editingId}/materials`, {
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
        setSuccessMsg(`Material '${matName}' added to catalogue successfully!`);
        setMatName('');
        setMatBrand('');
        setMatQty(1);
        setMatEstPrice('');
        fetchProjects();
      } else {
        setError(data.message || 'Failed to add material item');
      }
    } catch (err) {
      setError('Error adding material item');
    } finally {
      setAddingMaterial(false);
    }
  };

  const handleUploadDesignFile = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    if (!designTitle || !designFileUrl) {
      setError('Please enter a design title and file image URL');
      return;
    }
    try {
      setUploadingDesign(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${editingId}/designs`, {
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
        setSuccessMsg(`Design file '${designTitle}' uploaded to project successfully!`);
        setDesignTitle('');
        setDesignFileUrl('');
        fetchProjects();
      } else {
        setError(data.message || 'Failed to upload design');
      }
    } catch (err) {
      setError('Error uploading design file');
    } finally {
      setUploadingDesign(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'instant' });
    const interval = setInterval(() => {
      fetchProjects(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [page, search, status, projectType]);

  useEffect(() => {
    const fetchEmployeeLists = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/employees?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const allEmps = data.data || [];
          
          // Interior Designers strictly
          const designers = allEmps.filter(
            (e) => e.role === 'INTERIOR_DESIGNER' || e.role === 'Interior Designer' || e.department === 'Design'
          );
          setDesignersList(designers);

          // Site Engineers strictly (role SITE_ENGINEER or department Engineering)
          const engineers = allEmps.filter(
            (e) => e.role === 'SITE_ENGINEER' || e.role === 'Site Engineer' || e.department === 'Engineering'
          );
          setSiteEngineersList(engineers);
        }
      } catch (e) {
        console.error('Error loading employee lists for projects:', e);
      }
    };
    fetchEmployeeLists();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setError('');
    setSuccessMsg('');
    setEditingId(null);
    const defaultDesigner = designersList.length > 0 ? designersList[0].fullName : '';
    const defaultEngineer = siteEngineersList.length > 0 ? siteEngineersList[0].fullName : '';

    setFormData({
      projectId: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
      projectName: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientPassword: '',
      location: '',
      projectType: 'Residential',
      budget: 500000,
      spentAmount: 0,
      assignedDesigner: defaultDesigner,
      projectManager: defaultEngineer,
      siteEngineer: defaultEngineer,
      status: 'Planning',
      progressPercentage: 10
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prj) => {
    setError('');
    setSuccessMsg('');
    setEditingId(prj._id);
    setFormData({
      projectId: prj.projectId,
      projectName: prj.projectName,
      clientName: prj.clientName,
      clientEmail: prj.clientEmail,
      clientPhone: prj.clientPhone,
      location: prj.location,
      projectType: prj.projectType,
      budget: prj.budget,
      spentAmount: prj.spentAmount || 0,
      assignedDesigner: prj.assignedDesigner || (designersList.length > 0 ? designersList[0].fullName : ''),
      projectManager: prj.projectManager || '',
      siteEngineer: prj.siteEngineer || (siteEngineersList.length > 0 ? siteEngineersList[0].fullName : ''),
      status: prj.status,
      progressPercentage: prj.progressPercentage || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `http://localhost:5001/api/projects/${editingId}`
        : 'http://localhost:5001/api/projects';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(editingId ? 'Project details updated!' : 'New project created successfully!');
        setIsModalOpen(false);
        fetchProjects();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError('Network error saving project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interior project?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg('Project removed successfully');
        fetchProjects();
      } else {
        setError(data.message || 'Failed to delete project');
      }
    } catch (err) {
      setError('Network error deleting project');
    }
  };

  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'In Progress':
        return { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' };
      case 'Completed':
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' };
      case 'Review':
        return { bg: '#fef3c7', border: '#fde68a', text: '#d97706' };
      case 'On Hold':
        return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' };
      default:
        return { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 3rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Header Bar with Module Banner Image */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FolderKanban style={{ color: '#2563eb' }} size={32} /> {isDesigner ? 'My Assigned Projects' : 'Interior Design Projects'}
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            {isDesigner
              ? 'View your assigned interior renovation projects, update design progress, select materials, and upload floor plans.'
              : 'Monitor client renovation milestones, budgets, site progress, and assigned designers.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img 
            src="/hero_living_room_1786022741605.png" 
            alt="Interior Project" 
            style={{ width: '130px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} 
          />
          {isAdminOrPM && (
            <button
              onClick={openAddModal}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}
            >
              <Plus size={18} /> Create New Project
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '500' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle size={18} /> <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '500' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} /> <span>{error}</span>
          </div>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '2 1 250px', minWidth: '220px', boxSizing: 'border-box' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search project name, client, or site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.75rem 0.65rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          style={{ flex: '1 1 180px', minWidth: '160px', boxSizing: 'border-box', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
        >
          <option value="">All Project Types</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Renovation">Renovation</option>
          <option value="Modular Kitchen">Modular Kitchen</option>
          <option value="Full Villa Interior">Full Villa Interior</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ flex: '1 1 160px', minWidth: '140px', boxSizing: 'border-box', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
        >
          <option value="">All Statuses</option>
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading active projects...</div>
      ) : projects.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <img 
            src="/hero_living_room_1786022741605.png" 
            alt="No Projects Found" 
            style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '12px', opacity: 0.85, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
          />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>No interior design projects found</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Click <strong>Create New Project</strong> to begin onboarding a client project.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {projects.map((prj) => {
            const badge = getStatusBadgeStyle(prj.status);
            return (
              <div key={prj._id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {prj.projectId}
                    </span>
                  </div>
                  <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                    <img 
                      src={
                        prj.projectType === 'Modular Kitchen' 
                          ? designImages.kitchen 
                          : prj.projectType === 'Commercial'
                          ? designImages.office
                          : prj.projectName?.toLowerCase().includes('bedroom')
                          ? designImages.bedroom
                          : designImages.livingRoom
                      } 
                      alt={prj.projectName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.6rem', borderRadius: '9999px', backgroundColor: badge.bg, border: `1px solid ${badge.border}`, color: badge.text, backdropFilter: 'blur(4px)' }}>
                        {prj.status}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ margin: '0 0 0.4rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '700' }}>
                    {prj.projectName}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="#94a3b8" /> {prj.location}
                  </div>

                  {/* Details Card Grid */}
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block' }}>Client</span>
                      <strong style={{ color: '#334155' }}>{prj.clientName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block' }}>Designer</span>
                      <strong style={{ color: '#334155' }}>{prj.assignedDesigner || 'Unassigned'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block' }}>Site Engineer</span>
                      <strong style={{ color: '#334155' }}>{prj.siteEngineer || prj.projectManager || 'Unassigned'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block' }}>Total Budget</span>
                      <strong style={{ color: '#16a34a' }}>₹{prj.budget?.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                      <span>Progress Status</span>
                      <span>{prj.progressPercentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${prj.progressPercentage}%`, height: '100%', backgroundColor: prj.progressPercentage === 100 ? '#16a34a' : '#2563eb', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    onClick={() => openEditModal(prj)}
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Edit2 size={14} /> {isDesigner ? 'Update Design & Progress' : 'Edit Project'}
                  </button>
                  {isAdminOrPM && (
                    <button
                      onClick={() => handleDelete(prj._id)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalProjects} total projects)
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', cursor: 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', cursor: 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Add / Edit Project Modal Dialog */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '640px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: '700' }}>{editingId ? 'Edit Project Details' : 'Create New Project'}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Enter project specifications and client contract details.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Project ID *</label>
                <input type="text" name="projectId" required disabled={isDesigner} value={formData.projectId} onChange={handleInputChange} style={{ ...inputStyle, backgroundColor: isDesigner ? '#e2e8f0' : '#f8fafc' }} />
              </div>

              <div>
                <label style={labelStyle}>Project Title *</label>
                <input type="text" name="projectName" placeholder="e.g. Modern Villa Interior" required disabled={isDesigner} value={formData.projectName} onChange={handleInputChange} style={{ ...inputStyle, backgroundColor: isDesigner ? '#e2e8f0' : '#f8fafc' }} />
              </div>

              <div>
                <label style={labelStyle}>Client Name *</label>
                <input type="text" name="clientName" required disabled={isDesigner} value={formData.clientName} onChange={handleInputChange} style={{ ...inputStyle, backgroundColor: isDesigner ? '#e2e8f0' : '#f8fafc' }} />
              </div>

              <div>
                <label style={labelStyle}>Client Email *</label>
                <input type="email" name="clientEmail" required disabled={isDesigner} value={formData.clientEmail} onChange={handleInputChange} style={{ ...inputStyle, backgroundColor: isDesigner ? '#e2e8f0' : '#f8fafc' }} />
              </div>

              <div>
                <label style={labelStyle}>Client Phone *</label>
                <input type="text" name="clientPhone" required value={formData.clientPhone} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Client Login Password *</label>
                <input type="password" name="clientPassword" placeholder="e.g. Client123! or custom password" value={formData.clientPassword || ''} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Site Location *</label>
                <input type="text" name="location" placeholder="e.g. Green Park, Sector 4" required value={formData.location} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Project Type</label>
                <select name="projectType" value={formData.projectType} onChange={handleInputChange} style={inputStyle}>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Modular Kitchen">Modular Kitchen</option>
                  <option value="Full Villa Interior">Full Villa Interior</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Project Budget (₹) *</label>
                <input type="number" name="budget" required value={formData.budget} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Assigned Designer *</label>
                <select name="assignedDesigner" required value={formData.assignedDesigner} onChange={handleInputChange} style={inputStyle}>
                  <option value="">-- Select Designer --</option>
                  {designersList.map((emp) => (
                    <option key={emp._id} value={emp.fullName}>{emp.fullName} ({emp.department})</option>
                  ))}
                  {formData.assignedDesigner && !designersList.some(d => d.fullName === formData.assignedDesigner) && (
                    <option value={formData.assignedDesigner}>{formData.assignedDesigner}</option>
                  )}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Assigned Site Engineer</label>
                <select name="siteEngineer" value={formData.siteEngineer} onChange={handleInputChange} style={inputStyle}>
                  <option value="">-- Select Site Engineer --</option>
                  {siteEngineersList.map((emp) => (
                    <option key={emp._id} value={emp.fullName}>{emp.fullName} ({emp.department})</option>
                  ))}
                  {formData.siteEngineer && formData.siteEngineer !== 'Project Lead' && formData.siteEngineer !== 'Unassigned' && !siteEngineersList.some(e => e.fullName === formData.siteEngineer) && (
                    <option value={formData.siteEngineer}>{formData.siteEngineer}</option>
                  )}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Project Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle}>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Progress Completion (%)</label>
                <input type="number" name="progressPercentage" min="0" max="100" value={formData.progressPercentage} onChange={handleInputChange} style={inputStyle} />
              </div>

              {/* Design Upload Section for Designers / PMs */}
              {editingId && (
                <div style={{ gridColumn: 'span 2', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
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
                      disabled={uploadingDesign}
                      onClick={handleUploadDesignFile}
                      style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                    >
                      {uploadingDesign ? 'Uploading...' : 'Upload Design'}
                    </button>
                  </div>
                </div>
              )}

              {/* Material Catalogue Entry Section */}
              {editingId && (
                <div style={{ gridColumn: 'span 2', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
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
                        style={{ width: '60px', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                      />
                      <input
                        type="text"
                        placeholder="Unit (e.g. Units)"
                        value={matUnit}
                        onChange={(e) => setMatUnit(e.target.value)}
                        style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder="Estimated Price in ₹ (e.g. 36000)"
                      value={matEstPrice}
                      onChange={(e) => setMatEstPrice(e.target.value)}
                      style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button
                      type="button"
                      disabled={addingMaterial}
                      onClick={handleAddMaterialItem}
                      style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                    >
                      {addingMaterial ? 'Adding...' : 'Add Material Spec'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ gridColumn: 'span 2', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' }}
                >
                  {editingId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
