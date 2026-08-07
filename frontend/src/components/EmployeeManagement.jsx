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
  Building2,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

const roleLabels = {
  INTERIOR_DESIGNER: 'Interior Designer',
  PROJECT_MANAGER: 'Project Manager',
  SITE_ENGINEER: 'Site Engineer',
  SALES_EXECUTIVE: 'Sales Executive',
  ACCOUNTANT: 'Accountant',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  'Interior Designer': 'Interior Designer',
  'Project Manager': 'Project Manager',
  'Site Engineer': 'Site Engineer',
  'Sales Executive': 'Sales Executive',
  'Accountant': 'Accountant',
  'Admin': 'Admin',
  'Super Admin': 'Super Admin'
};

const formatRoleName = (r) => {
  if (!r) return '';
  return roleLabels[r] || r.replace(/_/g, ' ');
};

const EmployeeManagement = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' };
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    role: 'INTERIOR_DESIGNER',
    department: 'Design',
    salary: 50000,
    status: 'Active',
    experience: 2,
    address: ''
  });

  const fetchEmployees = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const queryParams = new URLSearchParams({
        page,
        limit: 8,
        ...(search && { search }),
        ...(department && { department }),
        ...(role && { role }),
        ...(status && { status })
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/employees?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setEmployees(data.data);
        setTotalPages(data.totalPages);
        setTotalEmployees(data.total);
      } else {
        if (response.status === 401 || data.message?.includes('Token') || data.message?.includes('authorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        if (isInitial) setError(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      if (isInitial) setError('Server error connecting to employees endpoint');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const interval = setInterval(() => {
      fetchEmployees(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [page, search, department, role, status]);

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
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      email: '',
      password: '',
      phone: '',
      gender: 'Male',
      role: 'INTERIOR_DESIGNER',
      department: 'Design',
      salary: 50000,
      status: 'Active',
      experience: 2,
      address: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setError('');
    setSuccessMsg('');
    setEditingId(emp._id);
    setFormData({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      email: emp.email,
      password: '',
      phone: emp.phone,
      gender: emp.gender,
      role: emp.role,
      department: emp.department,
      salary: emp.salary,
      status: emp.status,
      experience: emp.experience || 0,
      address: emp.address || ''
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
        ? `http://localhost:5001/api/employees/${editingId}`
        : 'http://localhost:5001/api/employees';

      const method = editingId ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (editingId && (!payload.password || payload.password.trim() === '')) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(editingId ? 'Employee updated successfully!' : 'Employee added successfully!');
        setIsModalOpen(false);
        fetchEmployees();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError('Network error saving employee data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg('Employee record deleted');
        fetchEmployees();
      } else {
        setError(data.message || 'Failed to delete employee');
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
            <Users style={{ color: '#2563eb' }} size={32} /> Employee Management
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Manage staff profiles, department assignments, role access, and salaries.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img 
            src="/team_collaboration_1786024297074.png" 
            alt="Employee Staff Team" 
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
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={18} /> Add New Employee
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
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.75rem 0.65rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{ flex: '1 1 160px', minWidth: '150px', boxSizing: 'border-box', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
        >
          <option value="">All Departments</option>
          <option value="Design">Design</option>
          <option value="Projects">Projects</option>
          <option value="Sales">Sales</option>
          <option value="Engineering">Engineering</option>
          <option value="Administration">Administration</option>
          <option value="Accounts">Accounts</option>
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ flex: '1 1 160px', minWidth: '150px', boxSizing: 'border-box', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
        >
          <option value="">All Roles</option>
          <option value="INTERIOR_DESIGNER">Interior Designer</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="SITE_ENGINEER">Site Engineer</option>
          <option value="SALES_EXECUTIVE">Sales Executive</option>
          <option value="ACCOUNTANT">Accountant</option>
          <option value="ADMIN">Admin</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ flex: '1 1 140px', minWidth: '130px', boxSizing: 'border-box', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>

      {/* Employees Table Container */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#334155', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: '#475569', fontWeight: '700' }}>
            <tr>
              <th style={{ padding: '1rem 1.25rem' }}>Employee ID</th>
              <th style={{ padding: '1rem 1.25rem' }}>Employee</th>
              <th style={{ padding: '1rem 1.25rem' }}>Department / Role</th>
              <th style={{ padding: '1rem 1.25rem' }}>Phone</th>
              <th style={{ padding: '1rem 1.25rem' }}>Monthly Salary</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.95rem' }}>
                  Loading employee records...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.95rem' }}>
                  No employees found matching the filters.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#2563eb' }}>{emp.employeeId}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{emp.fullName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{emp.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: '500', color: '#0f172a', marginBottom: '0.2rem' }}>{emp.department}</div>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.2rem 0.55rem', borderRadius: '6px', color: '#1e40af', fontWeight: '600' }}>
                      {formatRoleName(emp.role)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>{emp.phone}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#16a34a' }}>₹{emp.salary?.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: emp.status === 'Active' ? '#dcfce7' : emp.status === 'On Leave' ? '#fef3c7' : '#fee2e2',
                      color: emp.status === 'Active' ? '#15803d' : emp.status === 'On Leave' ? '#b45309' : '#b91c1c'
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => openEditModal(emp)}
                      title="Edit Employee"
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      title="Delete Employee"
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
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalEmployees} total employees)
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

      {/* Add / Edit Employee Modal (Clean Pure Light Theme) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '620px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: '700' }}>{editingId ? 'Edit Employee Details' : 'Add New Employee'}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Enter employee details below.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  required
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Password {editingId && '(Leave blank to keep current)'}</label>
                <input type="password" name="password" required={!editingId} value={formData.password} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Department *</label>
                <select name="department" value={formData.department} onChange={handleInputChange} style={inputStyle}>
                  <option value="Design">Design</option>
                  <option value="Projects">Projects</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Administration">Administration</option>
                  <option value="Accounts">Accounts</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Role *</label>
                <select name="role" value={formData.role} onChange={handleInputChange} style={inputStyle}>
                  <option value="INTERIOR_DESIGNER">Interior Designer</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="SITE_ENGINEER">Site Engineer</option>
                  <option value="SALES_EXECUTIVE">Sales Executive</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Monthly Salary (₹)</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

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
                  {editingId ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
