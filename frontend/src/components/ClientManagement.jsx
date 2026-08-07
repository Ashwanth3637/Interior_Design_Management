import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Eye,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Building,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientManagement = () => {
  const { user } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [designersList, setDesignersList] = useState([]);
  const [engineersList, setEngineersList] = useState([]);
  const [pmList, setPmList] = useState([]);
  const [accountantsList, setAccountantsList] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    projectType: 'Residential',
    assignedDesigner: '',
    siteEngineer: '',
    projectManager: '',
    accountant: '',
    status: 'Active'
  });

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' };

  // View Details Modal State
  const [viewClientData, setViewClientData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loadingView, setLoadingView] = useState(false);

  const fetchClients = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const queryParams = new URLSearchParams({
        page,
        limit: 8,
        ...(search && { search }),
        ...(status && { status }),
        ...(city && { city })
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/clients?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setClients(data.data);
        setTotalPages(data.totalPages);
        setTotalClients(data.total);
      } else {
        if (response.status === 401 || data.message?.includes('Token') || data.message?.includes('authorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        if (isInitial) setError(data.message || 'Failed to fetch client records');
      }
    } catch (err) {
      if (isInitial) setError('Network error fetching client records');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/employees?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const allEmployees = data.data || [];

        // Filter Interior Designers strictly from Employee records
        const designers = allEmployees.filter(e =>
          ['INTERIOR_DESIGNER', 'Interior Designer', 'Designer'].includes(e.role) || e.department === 'Design'
        );

        // Filter Site Engineers strictly from Employee records
        const engineers = allEmployees.filter(e =>
          ['SITE_ENGINEER', 'Site Engineer'].includes(e.role) || (e.department === 'Engineering' && e.role !== 'INTERIOR_DESIGNER')
        );

        // Filter Project Managers strictly from Employee records
        const pms = allEmployees.filter(e =>
          ['PROJECT_MANAGER', 'Project Manager', 'PM'].includes(e.role) || e.department === 'Management' || e.department === 'Project Management'
        );

        // Filter Accountants strictly from Employee records
        const accountants = allEmployees.filter(e =>
          ['ACCOUNTANT', 'Accountant', 'Finance'].includes(e.role) || e.department === 'Accounts' || e.department === 'Finance'
        );

        // Deduplicate by employee name
        const uniqueDesigners = Array.from(new Map(designers.map(item => [(item.name || item.fullName).trim(), item])).values());
        const uniqueEngineers = Array.from(new Map(engineers.map(item => [(item.name || item.fullName).trim(), item])).values());
        const uniquePms = Array.from(new Map(pms.map(item => [(item.name || item.fullName).trim(), item])).values());
        const uniqueAccountants = Array.from(new Map(accountants.map(item => [(item.name || item.fullName).trim(), item])).values());

        setDesignersList(uniqueDesigners);
        setEngineersList(uniqueEngineers);
        setPmList(uniquePms.length > 0 ? uniquePms : allEmployees);
        setAccountantsList(uniqueAccountants.length > 0 ? uniqueAccountants : allEmployees);
      }
    } catch (e) {
      console.error('Failed to fetch staff list', e);
    }
  };

  useEffect(() => {
    fetchClients(true);
    fetchStaff();
    window.scrollTo({ top: 0, behavior: 'instant' });
    const interval = setInterval(() => {
      fetchClients(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [page, search, status, city]);

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
    setFormData({
      clientId: `CLT-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      email: '',
      password: 'Client123!',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      projectType: 'Residential',
      assignedDesigner: '',
      siteEngineer: '',
      projectManager: '',
      accountant: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (clt) => {
    setError('');
    setSuccessMsg('');
    setEditingId(clt._id);
    setFormData({
      clientId: clt.clientId,
      fullName: clt.fullName,
      email: clt.email,
      password: '',
      phone: clt.phone,
      address: clt.address || '',
      city: clt.city || '',
      state: clt.state || '',
      pincode: clt.pincode || '',
      projectType: clt.projectType || 'Residential',
      assignedDesigner: '',
      siteEngineer: '',
      projectManager: '',
      accountant: '',
      status: clt.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const openViewModal = async (cltId) => {
    try {
      setLoadingView(true);
      setIsViewModalOpen(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/clients/${cltId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setViewClientData(data.data);
      } else {
        setError(data.message || 'Error fetching client profile');
      }
    } catch (err) {
      setError('Network error fetching client details');
    } finally {
      setLoadingView(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `http://localhost:5001/api/clients/${editingId}`
        : 'http://localhost:5001/api/clients';

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
        const clientPass = formData.password || 'Client123!';
        const createdMsg = editingId
          ? 'Client record updated successfully!'
          : `🎉 Client Created! Login Email: ${formData.email} | Password: ${clientPass}`;
        setSuccessMsg(createdMsg);
        setIsModalOpen(false);
        fetchClients();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError('Network error saving client data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg('Client record deleted successfully!');
        fetchClients();
      } else {
        setError(data.message || 'Failed to delete client');
      }
    } catch (err) {
      setError('Network error executing deletion');
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
            <Users style={{ color: '#2563eb' }} size={32} /> Client Management
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Manage client profiles, property locations, contact details, and assigned project milestones.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img 
            src="/client_meeting_1786024318597.png" 
            alt="Client Consultation Meeting" 
            style={{ width: '130px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} 
          />
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
            <UserPlus size={18} /> Add New Client
          </button>
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
            placeholder="Search by client name, email, ID or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.75rem 0.65rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ flex: '1 1 150px', minWidth: '140px', boxSizing: 'border-box', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ flex: '1 1 140px', minWidth: '130px', boxSizing: 'border-box', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Clients Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#334155', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: '#475569', fontWeight: '700' }}>
            <tr>
              <th style={{ padding: '1rem 1.25rem' }}>Client ID</th>
              <th style={{ padding: '1rem 1.25rem' }}>Client Name & Email</th>
              <th style={{ padding: '1rem 1.25rem' }}>Phone Number</th>
              <th style={{ padding: '1rem 1.25rem' }}>Location (City/State)</th>
              <th style={{ padding: '1rem 1.25rem' }}>Project Type</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.95rem' }}>
                  Loading client records...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.95rem' }}>
                  No clients found matching the search criteria.
                </td>
              </tr>
            ) : (
              clients.map((clt) => (
                <tr key={clt._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#2563eb' }}>{clt.clientId}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{clt.fullName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{clt.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>{clt.phone}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>
                    {clt.city || clt.state ? `${clt.city || ''}${clt.city && clt.state ? ', ' : ''}${clt.state || ''}` : 'Not provided'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: '500', color: '#0f172a' }}>{clt.projectType}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: clt.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${clt.status === 'Active' ? '#bbf7d0' : '#fecaca'}`,
                      color: clt.status === 'Active' ? '#16a34a' : '#dc2626'
                    }}>
                      {clt.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => openViewModal(clt._id)}
                      title="View Details"
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem' }}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => openEditModal(clt)}
                      title="Edit Client"
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(clt._id)}
                      title="Delete Client"
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalClients} total clients)
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
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '640px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: '700' }}>{editingId ? 'Edit Client Details' : 'Add New Client'}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Fill in customer contact, location, and project preferences.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Client ID *</label>
                <input type="text" name="clientId" required value={formData.clientId} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" name="fullName" placeholder="e.g. Richard Johnson" required value={formData.fullName} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" name="email" placeholder="richard@gmail.com" required value={formData.email} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Create Password</label>
                <input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input type="text" name="phone" placeholder="+91 9876543210" required value={formData.phone} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Street Address</label>
                <input type="text" name="address" placeholder="Flat 4B, Ocean View Apartments, Beach Road" value={formData.address} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>City</label>
                <input type="text" name="city" placeholder="Chennai" value={formData.city} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>State</label>
                <input type="text" name="state" placeholder="Tamil Nadu" value={formData.state} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Pincode</label>
                <input type="text" name="pincode" placeholder="600090" value={formData.pincode} onChange={handleInputChange} style={inputStyle} />
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
                <label style={labelStyle}>Assign Interior Designer</label>
                <select name="assignedDesigner" value={formData.assignedDesigner} onChange={handleInputChange} style={inputStyle}>
                  <option value="">-- Select Designer --</option>
                  {designersList.map((d) => (
                    <option key={d._id || d.name} value={d.name || d.fullName}>
                      {d.name || d.fullName} ({d.department || 'Design'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Assign Site Engineer</label>
                <select name="siteEngineer" value={formData.siteEngineer} onChange={handleInputChange} style={inputStyle}>
                  <option value="">-- Select Site Engineer --</option>
                  {engineersList.map((e) => (
                    <option key={e._id || e.name} value={e.name || e.fullName}>
                      {e.name || e.fullName} ({e.department || 'Engineering'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Assign Project Manager</label>
                <select name="projectManager" value={formData.projectManager} onChange={handleInputChange} style={inputStyle}>
                  <option value="">-- Select Project Manager --</option>
                  {pmList.map((p) => (
                    <option key={p._id || p.name} value={p.name || p.fullName}>
                      {p.name || p.fullName} ({p.role || 'Project Manager'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Assign Accountant</label>
                <select name="accountant" value={formData.accountant} onChange={handleInputChange} style={inputStyle}>
                  <option value="">-- Select Accountant --</option>
                  {accountantsList.map((a) => (
                    <option key={a._id || a.name} value={a.name || a.fullName}>
                      {a.name || a.fullName} ({a.role || 'Accountant'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}
                >
                  {editingId ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Client Details Modal */}
      {isViewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '720px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: '700' }}>
                  Client Overview: {viewClientData?.client?.fullName || 'Loading...'}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Personal profile, contact specifications, and assigned renovation projects.</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem' }}>
                <X size={20} />
              </button>
            </div>

            {loadingView || !viewClientData ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Loading client profile and projects...
              </div>
            ) : (
              <div>
                {/* Personal Details Grid */}
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={18} color="#2563eb" /> Personal Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Client ID</span>
                      <strong style={{ color: '#2563eb' }}>{viewClientData.client.clientId}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Full Name</span>
                      <strong style={{ color: '#0f172a' }}>{viewClientData.client.fullName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Portal Login Email</span>
                      <span style={{ color: '#2563eb', fontWeight: '600' }}>{viewClientData.client.email}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Portal Login Password</span>
                      <span style={{ color: '#16a34a', fontWeight: '600' }}>Client123!</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Phone Number</span>
                      <span style={{ color: '#334155' }}>{viewClientData.client.phone}</span>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Property Address</span>
                      <span style={{ color: '#334155' }}>
                        {viewClientData.client.address || 'N/A'}{' '}
                        {viewClientData.client.city ? `, ${viewClientData.client.city}` : ''}{' '}
                        {viewClientData.client.state ? `, ${viewClientData.client.state}` : ''}{' '}
                        {viewClientData.client.pincode ? ` - ${viewClientData.client.pincode}` : ''}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Project Preference</span>
                      <span style={{ color: '#0f172a', fontWeight: '600' }}>{viewClientData.client.projectType}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Account Status</span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: viewClientData.client.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                        color: viewClientData.client.status === 'Active' ? '#16a34a' : '#dc2626',
                        display: 'inline-block'
                      }}>
                        {viewClientData.client.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Projects Section */}
                <div>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Briefcase size={18} color="#7c3aed" /> Assigned Projects ({viewClientData.projects?.length || 0})
                  </h4>

                  {viewClientData.projects?.length === 0 ? (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px border #e2e8f0', padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                      No active projects currently linked to this client.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {viewClientData.projects.map((prj) => (
                        <div key={prj._id} style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '0.85rem' }}>{prj.projectId}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '9999px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                              {prj.status}
                            </span>
                          </div>
                          <h5 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1rem' }}>{prj.projectName}</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                            <div>Designer: <strong>{prj.assignedDesigner}</strong></div>
                            <div>Site Eng: <strong>{prj.siteEngineer || prj.projectManager || 'N/A'}</strong></div>
                            <div>Budget: <strong style={{ color: '#16a34a' }}>₹{prj.budget?.toLocaleString()}</strong></div>
                          </div>
                          <div style={{ marginTop: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                              <span>Completion</span>
                              <span>{prj.progressPercentage}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{ width: `${prj.progressPercentage}%`, height: '100%', backgroundColor: '#2563eb' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
