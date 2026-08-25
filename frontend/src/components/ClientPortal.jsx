import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import {
  Briefcase,
  User,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Palette,
  Eye,
  CheckSquare,
  CreditCard,
  Calendar,
  ArrowLeft,
  X,
  AlertCircle,
  Sparkles,
  Download,
  ThumbsUp,
  ShieldCheck,
  Image as ImageIcon,
  Layers,
  Package,
  Wrench,
  Armchair,
  Zap,
  RotateCcw,
  CheckCircle2,
  PartyPopper,
  MessageSquare,
  Upload,
  QrCode,
  RotateCw,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkflowStepper from './WorkflowStepper';
import NotificationBell from './NotificationBell';
import { designImages } from '../assets/images';

const ClientPortal = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  const handleManualRefresh = () => {
    setIsSpinning(true);
    fetchClientPortal(true);
    setTimeout(() => setIsSpinning(false), 600);
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedQuotationDoc, setSelectedQuotationDoc] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Design Approval & Favorites state
  const [feedback, setFeedback] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approvalBanner, setApprovalBanner] = useState(false);
  const [favoriteDesignIds, setFavoriteDesignIds] = useState([]);
  const [designFilter, setDesignFilter] = useState('all'); // 'all' or 'favorites'

  const toggleFavoriteDesign = async (ds) => {
    const designKey = ds?._id || ds?.title;
    setFavoriteDesignIds(prev =>
      prev.includes(designKey) ? prev.filter(k => k !== designKey) : [...prev, designKey]
    );

    if (project?._id && (ds?._id || ds?.title)) {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const targetId = ds._id || encodeURIComponent(ds.title);
        await fetch(`${API_BASE_URL}/projects/${project._id}/designs/${targetId}/favorite`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });
        fetchClientPortal(false);
      } catch (err) {
        console.error('Error toggling design favorite:', err);
      }
    }
  };

  const handleSendFavoritesToDesigner = async () => {
    if (!project || !project.designs) return;
    const selectedDesigns = project.designs.filter(d => favoriteDesignIds.includes(d._id || d.title));
    if (selectedDesigns.length === 0) {
      alert("Please click the heart icon (❤️) on at least one design proposal card to shortlist it first!");
      return;
    }
    const titles = selectedDesigns.map(d => `"${d.title}"`).join(', ');
    const msg = `Hi ${project.assignedDesigner || 'Designer'}, I have reviewed the design proposals and shortlisted my favorite concepts: ${titles}. Please proceed with these!`;

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/projects/${project._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) {
        alert(`🎉 Shortlisted concepts (${selectedDesigns.length}) sent to Designer ${project.assignedDesigner || ''}!`);
        fetchClientPortal(true);
      }
    } catch (err) {
      alert('Network error sending shortlisted concepts to designer');
    }
  };

  // Simulated Payment Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyVpa = (vpa) => {
    try { navigator.clipboard?.writeText(vpa); } catch(e){}
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCopyPhone = (phone) => {
    try { navigator.clipboard?.writeText(phone); } catch(e){}
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Payment Receipt Modal state
  const [selectedReceiptInvoice, setSelectedReceiptInvoice] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Quotation Rejection Modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingQuotationId, setRejectingQuotationId] = useState(null);
  const [rejectionQueries, setRejectionQueries] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const openQuotationRejectModal = (qId) => {
    setRejectingQuotationId(qId);
    setRejectionQueries('');
    setIsRejectModalOpen(true);
  };

  const submitQuotationRejectionModal = async (e) => {
    e?.preventDefault();
    if (!project || !rejectingQuotationId) return;
    if (!rejectionQueries.trim()) {
      alert("Please enter your queries or cost revision comments for the Project Manager!");
      return;
    }

    try {
      setIsSubmittingReject(true);
      const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/projects/${project._id}/respond-quotation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          quotationId: rejectingQuotationId,
          status: 'Rejected',
          rejectionReason: rejectionQueries.trim()
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg("❌ Quotation queries sent to Project Manager! PM will review your comments & issue a revised quotation.");
        setIsRejectModalOpen(false);
        setRejectionQueries('');
        fetchClientPortal(true);
      } else {
        alert(result.message || 'Failed to submit quotation rejection queries');
      }
    } catch (err) {
      alert('Network error submitting quotation queries to Project Manager');
    } finally {
      setIsSubmittingReject(false);
    }
  };
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Image Preview Modal state
  const [previewImage, setPreviewImage] = useState(null);

  // Payment Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Client Site Photo Upload Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    roomType: 'Living Room',
    fileUrl: '',
    sqFeet: 200,
    notes: ''
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fetchClientPortal = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/clients/my-portal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
        const projectsList = result.data?.projects || [];
        if (projectsList.length > 0) {
          const activeProjId = selectedProjectId || projectsList[0]._id || projectsList[0].projectId;
          const proj = projectsList.find(p => p._id === activeProjId || p.projectId === activeProjId) || projectsList[0];
          if (proj) {
            if (proj.clientFeedback && isInitial) {
              setFeedback(proj.clientFeedback);
            }
            if (proj.designs) {
              const favs = proj.designs.filter(d => d.isFavorite).map(d => d._id || d.title);
              setFavoriteDesignIds(favs);
            }
          }
        }
      } else {
        if (isInitial) setError(result.message || 'Unable to load client portal data');
      }
    } catch (err) {
      if (isInitial) setError('Network error fetching your project details');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPortal(true);
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'instant' });
    const interval = setInterval(() => {
      fetchClientPortal(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPayModalOpen(false);
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const projectsList = data?.projects || [];
  const project = projectsList.find(p => p._id === selectedProjectId || p.projectId === selectedProjectId) || projectsList[0] || null;
  const profile = data?.clientProfile || null;

  // Handle Design Approval Submission
  const handleApproveDesign = async (statusChoice) => {
    if (!project) {
      alert('Error: No active project found to update.');
      return;
    }
    try {
      setIsSubmittingApproval(true);
      setError('');

      const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!activeToken) {
        alert('Authentication error: Token missing. Please log in again.');
        return;
      }

      const feedbackContent = feedback && feedback.trim().length > 0 
        ? feedback.trim() 
        : 'Please update design layout as per client requirements.';

      const res = await fetch(`${API_BASE_URL}/projects/${project._id}/approve-design`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          status: statusChoice,
          feedback: feedbackContent
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        if (statusChoice === 'Approved') {
          setApprovalBanner(true);
          setSuccessMsg('🎉 Design Approved Successfully! Project Manager has been notified.');
        } else {
          setApprovalBanner(false);
          setSuccessMsg('✅ Revision Request Submitted! Your feedback has been sent to the Designer Studio.');
        }
        fetchClientPortal(true);
      } else {
        const errMsg = result.message || 'Failed to submit revision request';
        alert(`Error: ${errMsg}`);
        setError(errMsg);
      }
    } catch (err) {
      console.error('Revision Request Exception:', err);
      alert('Network error submitting revision request. Please check backend server.');
      setError('Network error submitting design approval');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Handle Client Accept / Reject Quotation
  const handleRespondQuotation = async (qId, choiceStatus) => {
    if (!project) return;
    try {
      setError('');
      const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/projects/${project._id}/respond-quotation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          quotationId: qId,
          status: choiceStatus // 'Accepted' or 'Rejected'
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg(result.message);
        fetchClientPortal(true);
      } else {
        alert(result.message || 'Failed to update quotation status');
      }
    } catch (err) {
      alert('Network error responding to quotation');
    }
  };

  // Handle Request Revision for Specific Design Concept
  const handleRequestConceptRevision = async (designTitle) => {
    if (!project) return;
    const revComment = window.prompt(`Enter revision request notes for design: "${designTitle}"`);
    if (!revComment) return;

    setFeedback(`[For Design Concept: "${designTitle}"] ${revComment}`);
    setActiveTab('approve');
  };

  // Submit Client Site Photo Upload
  const handleUploadSitePhoto = async (e) => {
    e.preventDefault();
    if (!photoForm.fileUrl) {
      alert('Please enter or select a valid site image URL');
      return;
    }
    try {
      setIsUploadingPhoto(true);
      setError('');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/clients/site-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(photoForm)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg(result.message);
        setIsPhotoModalOpen(false);
        setPhotoForm({
          title: '',
          roomType: 'Living Room',
          fileUrl: '',
          sqFeet: 200,
          notes: ''
        });
        fetchClientPortal(true);
      } else {
        setError(result.message || 'Failed to upload site photo');
      }
    } catch (err) {
      setError('Network error uploading site photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle Simulated Payment Execution
  const handleConfirmSimulatedPayment = async () => {
    if (!project || !selectedInvoice) return;
    try {
      setIsProcessingPayment(true);
      setError('');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const targetProjId = project._id || project.projectId;
      const targetInvId = selectedInvoice._id || selectedInvoice.invoiceNumber || selectedInvoice.id;
      const res = await fetch(`${API_BASE_URL}/projects/${targetProjId}/invoices/${targetInvId}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg(`Payment of ₹${selectedInvoice.amount?.toLocaleString('en-IN')} confirmed! Invoice marked as Paid ✔`);
        setIsPayModalOpen(false);
        setSelectedInvoice(null);
        fetchClientPortal(true);
      } else {
        setError(result.message || 'Payment simulation failed');
      }
    } catch (err) {
      setError('Network error processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Default / Real Timeline Data Fallback
  const hasUploadedDesigns = project?.designs && project.designs.length > 0;
  const hasDesigner = !!project?.assignedDesigner;

  const defaultTimelineEvents = [
    { phase: 'Lead Registered', date: '05 Aug 2026', status: 'Completed', description: 'Client lead registered into sales workflow pipeline.' },
    { phase: 'Designer Assigned', date: '06 Aug 2026', status: hasDesigner ? 'Completed' : 'Pending', description: 'Interior designer assigned to create 2D/3D proposals.' },
    { phase: 'Design Uploaded', date: '08 Aug 2026', status: hasUploadedDesigns ? 'Completed' : (hasDesigner ? 'Pending' : 'Pending'), description: 'Initial 2D floor plans & 3D renders uploaded to portal.' },
    { phase: 'Client Approved', date: '10 Aug 2026', status: project?.designApprovalStatus === 'Approved' ? 'Completed' : (hasUploadedDesigns ? 'In Progress' : 'Pending'), description: 'Final 2D/3D design layout approved by client.' },
    { phase: 'Quotation Sent', date: '12 Aug 2026', status: (project?.quotations?.length || 0) > 0 ? 'Completed' : 'Pending', description: 'Official itemized project budget quotation issued by PM.' },
    { phase: 'Payment Completed', date: '14 Aug 2026', status: (project?.advancePaymentPaid || (project?.invoices && project.invoices.some(i => i.status === 'Paid'))) ? 'Completed' : 'Pending', description: '20% Advance payment confirmed.' },
    { phase: 'Site Execution', date: '20 Aug 2026', status: (project?.progressPercentage || 0) >= 100 ? 'Completed' : ((project?.progressPercentage || 0) > 0 ? 'In Progress' : 'Pending'), description: 'On-site execution, carpentry, and electrical works.' }
  ];

  const timelineToDisplay = project?.timeline && project.timeline.length > 0 
    ? project.timeline.map(tm => {
        if (tm.phase === 'Design Uploaded' || tm.phase === 'Design Upload') {
          return { ...tm, status: hasUploadedDesigns ? 'Completed' : 'Pending' };
        }
        return tm;
      })
    : defaultTimelineEvents;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 3rem', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .design-card-img-wrapper {
          position: relative;
          overflow: hidden;
          background-color: #0f172a;
          cursor: pointer;
        }
        .design-card-img {
          transition: transform 0.4s ease, opacity 0.4s ease;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .design-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .design-card-img-wrapper:hover .design-card-img {
          transform: scale(1.08);
          opacity: 0.85;
        }
        .design-card-img-wrapper:hover .design-card-overlay {
          opacity: 1;
        }
        .btn-modern-hover {
          transition: all 0.2s ease-in-out;
        }
        .btn-modern-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
        }
      `}</style>

      {/* Header Bar with Client Profile Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase style={{ color: '#2563eb' }} size={32} /> Client Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Track live renovation milestones, approve 2D/3D designs, and pay invoices.
          </p>
        </div>

        {/* Improved Client Header Profile Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleManualRefresh}
            style={{
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            title="Refresh Client Portal"
          >
            <RotateCw size={16} className={isSpinning ? 'spin-icon' : ''} style={{ color: '#2563eb' }} /> Refresh
          </button>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.65rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
              <User size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                👤 {user?.name || profile?.fullName || 'Benny Thomas'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: '700', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {project?.projectType || 'Residential'} Project
                </span>
                <span>• {project?.status || 'Active'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Last Login: Today 10:45 AM
              </div>
            </div>
          </div>
          <NotificationBell size={22} />
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle size={20} /> <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={20} /> <span>{error}</span>
          </div>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Multi-Project Switcher Banner for Clients with Multiple Projects */}
      {projectsList.length > 1 && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #bfdbfe', padding: '0.85rem 1.25rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 6px rgba(37,99,235,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Multi-Project Account</span>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '800' }}>You have {projectsList.length} interior projects with us</h4>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Switch Active Project View:</span>
            <select
              value={project?._id || project?.projectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1.5px solid #2563eb', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '700', fontSize: '0.9rem', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
            >
              {projectsList.map(p => (
                <option key={p._id || p.projectId} value={p._id || p.projectId}>
                  {p.projectName} ({p.projectId}) — {p.status === 'Completed' || p.workflowStage === 'Project Completed' ? '🎉 Completed' : '⚡ Active'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '1rem' }}>
          Fetching your project details from database...
        </div>
      ) : !project ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center' }}>
          <Briefcase size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Active Project Linked</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Your design consultant has not assigned a project to your account email ({user?.email}) yet.</p>
        </div>
      ) : (
        <div>
          {/* Official Project Handover Celebration Banner & Overall Quotation Download Card */}
          {(project.status === 'Completed' || project.workflowStage === 'Project Completed') && (
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #16a34a', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.15)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🎉</div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#15803d', fontSize: '1.25rem', fontWeight: '800' }}>
                    Project Officially Completed & Handed Over!
                  </h3>
                  <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem', fontWeight: '600' }}>
                    Congratulations! Your interior design project "{project.projectName}" has passed final quality verification and been officially handed over by management. Thank you for choosing us!
                  </p>
                </div>
              </div>

              {/* Overall Quotation & Document Download Bar */}
              {project.quotations && project.quotations.length > 0 && (
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={28} color="#16a34a" />
                    <div>
                      <strong style={{ color: '#0f172a', fontSize: '0.95rem', display: 'block' }}>📄 Overall Final Project Quotation Document</strong>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Total Final Contract Value: <strong style={{ color: '#16a34a' }}>₹{(project.quotations.find(q => q.status === 'Accepted') || project.quotations[project.quotations.length - 1])?.totalAmount?.toLocaleString('en-IN') || project.budget?.toLocaleString('en-IN')}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const targetQ = project.quotations.find(q => q.status === 'Accepted') || project.quotations[project.quotations.length - 1];
                        setSelectedQuotationDoc(targetQ);
                      }}
                      style={{ backgroundColor: '#ffffff', color: '#16a34a', border: '1px solid #16a34a', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
                    >
                      <Eye size={16} /> View Overall Quotation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetQ = project.quotations.find(q => q.status === 'Accepted') || project.quotations[project.quotations.length - 1];
                        setSelectedQuotationDoc(targetQ);
                        setTimeout(() => window.print(), 300);
                      }}
                      style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}
                    >
                      <Download size={16} /> Download Quotation PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Project Overview Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {project.projectId} • {project.projectType}
                </span>
                <h2 style={{ margin: '0.25rem 0 0.5rem 0', color: '#0f172a', fontSize: '1.65rem', fontWeight: '800' }}>
                  {project.projectName}
                </h2>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Site Location: <strong>{project.location}</strong>
                </span>
              </div>
              <span style={{
                backgroundColor: ['Execution Started', 'Work Started', 'Execution in Progress'].includes(project.status) ? '#f0fdf4' : project.status === 'Completed' ? '#dcfce7' : '#eff6ff',
                border: `1px solid ${['Execution Started', 'Work Started', 'Execution in Progress'].includes(project.status) ? '#bbf7d0' : project.status === 'Completed' ? '#86efac' : '#bfdbfe'}`,
                color: ['Execution Started', 'Work Started', 'Execution in Progress'].includes(project.status) ? '#15803d' : project.status === 'Completed' ? '#166534' : '#2563eb',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontWeight: '800',
                fontSize: '0.85rem'
              }}>
                Status: {project.status}
              </span>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Interior Designer</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{project.assignedDesigner || 'Rahul'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Site Engineer</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{project.siteEngineer || project.projectManager || 'Jasper'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Total Contract Budget</span>
                <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>₹{project.budget?.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Design Approval Status</span>
                <strong style={{
                  color: project.designApprovalStatus === 'Approved' ? '#16a34a' : project.designApprovalStatus === 'Changes Requested' ? '#dc2626' : '#c2410c',
                  fontSize: '0.95rem'
                }}>
                  {project.designApprovalStatus || 'Pending Review'}
                </strong>
              </div>
            </div>

            {/* 100% Progress Status Banner (Shown when site work is 100% completed but awaiting admin handover) */}
            {project.status !== 'Completed' && (project.progressPercentage >= 100 || project.status === 'Verified' || project.workflowStage === 'Awaiting Admin Handover' || project.status === 'Review') ? (
              <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '2px solid #d97706', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#92400e', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)' }}>
                <Clock size={24} color="#d97706" />
                <div>
                  <strong style={{ fontSize: '1rem', display: 'block' }}>⏳ 100% Site Work Completed — Waiting for Admin Approval & Final Handover</strong>
                  <span style={{ fontSize: '0.85rem', color: '#b45309' }}>Site execution is 100% complete! Project Manager has verified the work, and it is currently awaiting final Admin approval and handover.</span>
                </div>
              </div>
            ) : null}

            {/* Improved Progress Visualization */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
                <span>Site Execution Progress</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#2563eb' }}>{project.progressPercentage || 0}% Completed</span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500', marginLeft: '0.5rem' }}>
                    ({project.status === 'Completed' ? 'Handed Over' : (project.progressPercentage >= 100 || project.status === 'Verified') ? 'Awaiting Admin Handover' : 'In Progress'})
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', padding: '2px', boxSizing: 'border-box' }}>
                <div style={{ width: `${project.progressPercentage || 0}%`, height: '100%', backgroundColor: (project.progressPercentage >= 100 || project.status === 'Completed') ? '#16a34a' : '#2563eb', borderRadius: '9999px', transition: 'width 0.5s ease-in-out' }} />
              </div>
            </div>
          </div>

          {/* Action Tabs Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'overview' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'overview' ? '#2563eb' : '#ffffff', color: activeTab === 'overview' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Eye size={16} /> View Designs ({project.designs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('approve')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'approve' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'approve' ? '#2563eb' : '#ffffff', color: activeTab === 'approve' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckSquare size={16} /> Approve Designs
            </button>
            <button
              onClick={() => setActiveTab('quotation')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'quotation' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'quotation' ? '#2563eb' : '#ffffff', color: activeTab === 'quotation' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} /> Official Quotation ({project?.quotations ? project.quotations.filter((q, idx, arr) => q.status !== 'Superseded' && q.status !== 'Archived' && (q.status !== 'Sent to Client' && q.status !== 'Pending' || idx === arr.map(item => item.status === 'Sent to Client' || item.status === 'Pending').lastIndexOf(true))).length : 0})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'invoices' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'invoices' ? '#2563eb' : '#ffffff', color: activeTab === 'invoices' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CreditCard size={16} /> Invoices & Payments ({project.invoices?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('sitePhotos')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'sitePhotos' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'sitePhotos' ? '#2563eb' : '#ffffff', color: activeTab === 'sitePhotos' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ImageIcon size={16} /> Upload Site Photos ({project.sitePhotos?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'chat' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'chat' ? '#2563eb' : '#ffffff', color: activeTab === 'chat' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <MessageSquare size={16} /> Designer Chat ({project.projectMessages?.length || 0})
            </button>
          </div>

          {/* Tab Content Display */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            
            {/* 1. VIEW DESIGNS TAB */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Palette size={20} color="#7c3aed" /> 2D & 3D Design Proposals
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Uploaded by Interior Designer <strong>{project.assignedDesigner}</strong>. Hover to preview in full details.
                </p>

                {(!project.designs || project.designs.length === 0) ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                      🎨
                    </div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem', marginTop: '0.2rem' }}>
                      No design proposals uploaded yet
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', maxWidth: '420px' }}>
                      Your interior designer {project.assignedDesigner ? <strong>({project.assignedDesigner})</strong> : null} will upload 2D floor plans & 3D render proposals here once ready.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Shortlist & Favorites Filter Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setDesignFilter('all')}
                          style={{
                            backgroundColor: designFilter === 'all' ? '#2563eb' : '#ffffff',
                            color: designFilter === 'all' ? '#ffffff' : '#475569',
                            border: designFilter === 'all' ? 'none' : '1px solid #cbd5e1',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          All Proposals ({project.designs.length})
                        </button>
                        <button
                          onClick={() => setDesignFilter('favorites')}
                          style={{
                            backgroundColor: designFilter === 'favorites' ? '#ef4444' : '#ffffff',
                            color: designFilter === 'favorites' ? '#ffffff' : '#475569',
                            border: designFilter === 'favorites' ? 'none' : '1px solid #cbd5e1',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Heart size={14} fill={designFilter === 'favorites' ? '#ffffff' : 'none'} color={designFilter === 'favorites' ? '#ffffff' : '#ef4444'} /> My Shortlisted Favorites ({favoriteDesignIds.length})
                        </button>
                      </div>

                      {favoriteDesignIds.length > 0 && (
                        <button
                          onClick={handleSendFavoritesToDesigner}
                          style={{
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                          }}
                        >
                          <Heart size={15} fill="#ffffff" /> Send Shortlisted Concepts to {project.assignedDesigner || 'Designer'}
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 260px))', gap: '1.25rem' }}>
                      {project.designs
                        .filter(ds => designFilter === 'all' || favoriteDesignIds.includes(ds._id || ds.title))
                        .map((ds, idx) => {
                          const designKey = ds._id || ds.title || `design-${idx}`;
                          const isFav = favoriteDesignIds.includes(designKey);

                          return (
                            <div key={designKey} style={{ border: `1.5px solid ${isFav ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '14px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: isFav ? '0 4px 12px rgba(239, 68, 68, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                {/* Image Hover Zoom & Overlay */}
                                <div
                                  className="design-card-img-wrapper"
                                  style={{ height: '140px', position: 'relative' }}
                                >
                                  {/* Heart Shortlist Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavoriteDesign(ds);
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: '8px',
                                      left: '8px',
                                      backgroundColor: isFav ? '#ef4444' : 'rgba(15, 23, 42, 0.75)',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '9999px',
                                      padding: '0.3rem 0.65rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      fontSize: '0.72rem',
                                      fontWeight: '700',
                                      zIndex: 10,
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                    }}
                                    title={isFav ? "Remove from shortlisted favorites" : "Shortlist as favorite concept"}
                                  >
                                    <Heart size={14} fill={isFav ? '#ffffff' : 'none'} color="#ffffff" /> {isFav ? 'Shortlisted ❤️' : 'Shortlist'}
                                  </button>

                                  <img
                                    src={ds.fileUrl}
                                    alt={ds.title}
                                    className="design-card-img"
                                    onClick={() => setPreviewImage(ds)}
                                  />
                                  <div className="design-card-overlay" onClick={() => setPreviewImage(ds)}>
                                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#0f172a', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      <Eye size={16} color="#2563eb" /> Preview
                                    </div>
                                  </div>
                                  <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700' }}>
                                    {ds.designType || '3D Render'}
                                  </div>
                                </div>

                                {/* Improved Design Card Content */}
                                <div style={{ padding: '0.95rem' }}>
                                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '800', lineHeight: '1.3' }}>
                                    {ds.title || 'Bedroom Interior'}
                                  </h4>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                                    <span style={{ fontSize: '0.75rem', backgroundColor: isFav ? '#fef2f2' : '#f1f5f9', color: isFav ? '#dc2626' : '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                                      {isFav ? '❤️ Shortlisted Concept' : (ds.versionName || 'Version 1')}
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                      Uploaded: {new Date(ds.uploadedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                        {/* Action buttons - Uniform Single Line Buttons */}
                        <div style={{ padding: '0 0.85rem 0.85rem 0.85rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                              onClick={() => setPreviewImage(ds)}
                              style={{
                                flex: 1,
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.45rem 0.6rem',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.3rem',
                                whiteSpace: 'nowrap',
                                height: '34px'
                              }}
                            >
                              <Eye size={14} /> Preview
                            </button>
                            <button
                              onClick={() => handleRequestConceptRevision(ds.title)}
                              title="Request Revision for this concept"
                              style={{
                                backgroundColor: '#fff7ed',
                                border: '1px solid #ffedd5',
                                color: '#ea580c',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.3rem',
                                whiteSpace: 'nowrap',
                                height: '34px'
                              }}
                            >
                              <RotateCcw size={13} /> Revision
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

                {/* Material Catalogue Table with Prerequisite Check */}
                {project.designApprovalStatus === 'Approved' ? (
                  <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={18} color="#2563eb" /> Material Catalogue & Cost Breakdown
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Material details shared by your designer {project.assignedDesigner ? <strong>({project.assignedDesigner})</strong> : null}.
                    </p>

                    {!project.materials || project.materials.length === 0 ? (
                      <div style={{ backgroundColor: '#f8fafc', padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748b', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                          📦
                        </div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', marginTop: '0.2rem' }}>
                          Material catalogue will appear once your designer uploads it.
                        </div>
                      </div>
                    ) : (
                      <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                          <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <tr>
                              <th style={{ padding: '0.85rem 1.25rem' }}>Material Item</th>
                              <th style={{ padding: '0.85rem 1.25rem' }}>Brand</th>
                              <th style={{ padding: '0.85rem 1.25rem' }}>Quantity</th>
                              <th style={{ padding: '0.85rem 1.25rem' }}>Estimated Cost</th>
                              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.materials.map((m, i) => (
                              <tr key={m._id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{m.materialName}</td>
                                <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{m.brand}</td>
                                <td style={{ padding: '0.85rem 1.25rem', color: '#334155' }}>{m.quantity} {m.unit}</td>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#16a34a' }}>₹{m.estimatedPrice?.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                  <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                                    {m.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            <tr style={{ backgroundColor: '#f8fafc', fontWeight: '700' }}>
                              <td colSpan="3" style={{ padding: '0.85rem 1.25rem', color: '#0f172a' }}>Total Estimated Material Cost</td>
                              <td style={{ padding: '0.85rem 1.25rem', color: '#16a34a', fontSize: '1rem' }}>
                                ₹{project.materials.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0).toLocaleString('en-IN')}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1.5px solid #fde68a', padding: '1.25rem', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        🔒 Material Catalogue & Estimated Price Locked
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e' }}>
                        Please review and approve the 2D & 3D Design Proposals above first. Once approved, designer <strong>{project.assignedDesigner || 'Haasly Vijay'}</strong> will upload itemized material specs & estimated prices here!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. DESIGN APPROVAL TAB WITH Rich Success Feedback Banner */}
            {activeTab === 'approve' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckSquare size={20} color="#16a34a" /> Design Approval & Revision Request
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Submit your formal approval or request layout changes directly to designer <strong>{project.assignedDesigner}</strong>.
                </p>

                {approvalBanner && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🎉
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', color: '#166534', fontSize: '1.1rem', fontWeight: '800' }}>
                        Design Approved Successfully
                      </h4>
                      <p style={{ margin: 0, color: '#15803d', fontSize: '0.875rem' }}>
                        Project Manager and Interior Designer have been notified to initiate official quotation and site execution phases.
                      </p>
                    </div>
                  </div>
                )}

                {/* Shortlisted Favorite Concepts Preview Card */}
                {project.designs && project.designs.some(d => d.isFavorite || favoriteDesignIds.includes(d._id || d.title)) && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ color: '#dc2626', fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <Heart size={16} fill="#dc2626" /> Your Shortlisted Favorite Concepts ({project.designs.filter(d => d.isFavorite || favoriteDesignIds.includes(d._id || d.title)).length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 160px))', gap: '0.65rem' }}>
                      {project.designs.filter(d => d.isFavorite || favoriteDesignIds.includes(d._id || d.title)).map((d, idx) => (
                        <div key={d._id || idx} style={{ border: '1px solid #fecdd3', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                          <img src={d.fileUrl} alt={d.title} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                          <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem', fontWeight: '700', color: '#881337', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Your Revision Comments / Feedback</label>
                    <textarea
                      rows="4"
                      placeholder="e.g. Approved layout for living room! Please change kitchen countertop marble to dark grey..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={isSubmittingApproval}
                      onClick={() => handleApproveDesign('Approved')}
                      className="btn-modern-hover"
                      style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ThumbsUp size={16} /> Approve Design
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingApproval}
                      onClick={(e) => {
                        e.preventDefault();
                        handleApproveDesign('Revision Requested');
                      }}
                      style={{ backgroundColor: '#eab308', color: '#ffffff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(234, 179, 8, 0.3)' }}
                    >
                      <RotateCcw size={16} /> Request Revision
                    </button>

                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
                      Version: <strong>Design Version {project.designVersion || 1}</strong> • Status: <strong style={{ color: project.designApprovalStatus === 'Approved' ? '#16a34a' : project.designApprovalStatus === 'Revision Requested' ? '#eab308' : '#c2410c' }}>{project.designApprovalStatus || 'Pending Review'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. OFFICIAL ITEMISED QUOTATION TAB WITH Icons */}
            {activeTab === 'quotation' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="#2563eb" /> Project Quotation
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Itemized cost estimation provided by your project manager based on approved design requirements.
                </p>

                {!project.quotations || project.quotations.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <Clock size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>Quotation Under Preparation</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Once design layout is approved, your Project Manager will issue the itemized cost breakdown here.</p>
                  </div>
                ) : (
                  <div>
                    {project.quotations
                      .filter((q, idx, arr) => {
                        if (q.status === 'Superseded' || q.status === 'Archived') return false;
                        if (q.status === 'Sent to Client' || q.status === 'Pending') {
                          const latestSentIdx = arr.map(item => item.status === 'Sent to Client' || item.status === 'Pending').lastIndexOf(true);
                          if (idx !== latestSentIdx) return false;
                        }
                        return true;
                      })
                      .map((q, originalIdx, filteredArr) => ({
                        ...q,
                        originalIndex: originalIdx,
                        originalNumber: originalIdx + 1,
                        isLatest: originalIdx === filteredArr.length - 1
                      }))
                      .sort((a, b) => {
                        const getPrio = (item) => {
                          if (item.status === 'Accepted') return 1;
                          if (item.status === 'Sent to Client' || item.status === 'Pending') return 2;
                          if (item.status === 'Rejected') return 3;
                          return 4;
                        };
                        const pA = getPrio(a);
                        const pB = getPrio(b);
                        if (pA !== pB) return pA - pB;
                        return b.originalIndex - a.originalIndex;
                      })
                      .map((q, idx) => (
                        <div key={q._id || idx} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: q.isLatest && q.status !== 'Rejected' ? '2px solid #3b82f6' : '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: q.isLatest ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                                Quotation #{q.originalNumber} {q.isLatest ? '(Latest)' : ''}
                              </span>
                            </div>
                            <span style={{
                              backgroundColor: q.status === 'Accepted' ? '#f0fdf4' : q.status === 'Rejected' ? '#fef2f2' : '#eff6ff',
                              color: q.status === 'Accepted' ? '#16a34a' : q.status === 'Rejected' ? '#dc2626' : '#2563eb',
                              border: `1px solid ${q.status === 'Accepted' ? '#bbf7d0' : q.status === 'Rejected' ? '#fca5a5' : '#bfdbfe'}`,
                              padding: '0.35rem 0.85rem',
                              borderRadius: '9999px',
                              fontSize: '0.8rem',
                              fontWeight: '700'
                            }}>
                              Status: {q.status === 'Rejected' ? 'Rejected' : q.status === 'Accepted' ? 'Approved' : q.status}
                            </span>
                          </div>

                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                            <thead style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                              <tr>
                                <th style={{ padding: '0.85rem 1.25rem' }}>Cost Item / Category</th>
                                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Amount (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Package size={16} color="#2563eb" /> Material Cost
                                </td>
                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.materialCost?.toLocaleString('en-IN')}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Wrench size={16} color="#2563eb" /> Labour & Execution Cost
                                </td>
                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.labourCost?.toLocaleString('en-IN')}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Palette size={16} color="#2563eb" /> 2D/3D Design Charges
                                </td>
                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.designCharges?.toLocaleString('en-IN')}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Armchair size={16} color="#2563eb" /> Custom Furniture & Carpentry
                                </td>
                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.furnitureCost?.toLocaleString('en-IN')}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Zap size={16} color="#2563eb" /> Electrical & Plumbing Works
                                </td>
                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.electricalPlumbingCost?.toLocaleString('en-IN')}</td>
                              </tr>
                              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#475569' }}>Subtotal (Before Tax)</td>
                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>₹{(q.materialCost + q.labourCost + q.designCharges + q.furnitureCost + q.electricalPlumbingCost)?.toLocaleString('en-IN')}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#64748b' }}>🏛️ GST & Government Taxes (18%)</td>
                                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#64748b' }}>₹{q.taxGst?.toLocaleString('en-IN')}</td>
                              </tr>
                              <tr style={{ backgroundColor: '#f0fdf4', fontWeight: '800' }}>
                                <td style={{ padding: '1rem 1.25rem', color: '#15803d', fontSize: '1.05rem' }}>Total Contract Price</td>
                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#15803d', fontSize: '1.25rem' }}>₹{q.totalAmount?.toLocaleString('en-IN')}</td>
                              </tr>
                            </tbody>
                          </table>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: '10px', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <span>Generated by: <strong>{q.generatedBy || 'Project Manager'}</strong></span> • <span>Valid Until: <strong>{q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN') : '30 Days'}</strong></span>
                            </div>
                            
                            {/* Only show Action Buttons on the LATEST pending quotation */}
                            {q.status !== 'Rejected' && q.status !== 'Accepted' && q.isLatest ? (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleRespondQuotation(q._id, 'Accepted')}
                                  style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)' }}
                                >
                                  <CheckCircle size={14} /> Approve Quotation
                                </button>
                                <button
                                  onClick={() => openQuotationRejectModal(q._id)}
                                  style={{ backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', padding: '0.45rem 0.85rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <X size={14} /> Reject & Request Revision
                                </button>
                              </div>
                            ) : q.status === 'Rejected' ? (
                              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <X size={14} /> Rejected by Client
                              </span>
                            ) : q.status === 'Accepted' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <CheckCircle size={14} /> Quotation Approved
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedQuotationDoc(q)}
                                  style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <Eye size={14} /> View & Download PDF
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. INVOICES & PAYMENTS TAB */}
            {activeTab === 'invoices' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} color="#2563eb" /> Invoices & Payments
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  View your project invoices and payment status.
                </p>

                {(!project.quotations || !project.quotations.some(q => q.status === 'Accepted')) && (!project.invoices || !project.invoices.some(i => i.status === 'Paid')) ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      📋
                    </div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
                      Advance Payment Invoice will appear after approving the Official Quotation.
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      Please review and click <strong>Approve Quotation</strong> under the <strong>Official Quotation</strong> tab.
                    </div>
                  </div>
                ) : !project.invoices || project.invoices.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No invoices issued by accounts yet.
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <tr>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Invoice #</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Milestone Description</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Amount</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                          <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.invoices
                          .filter((inv, idx, array) => {
                            const progress = project.progressPercentage || 0;
                            const isFinal = inv.installmentType === 'Final Installment' || inv.title?.includes('Final');
                            // Final invoice: ONLY show when site progress is 90% or above
                            if (isFinal && progress < 90) return false;

                            const isSecond = inv.installmentType === 'Second Installment' || inv.title?.includes('Second');
                            // 2nd installment: ONLY show when site progress is 50% or above
                            if (isSecond && progress < 50) return false;

                            const isAdvance = inv.installmentType?.includes('Advance') || inv.title?.includes('Advance');
                            if (isAdvance && inv.status === 'Unpaid') {
                              const latestAdvanceIdx = array.map(i => i.installmentType?.includes('Advance') || i.title?.includes('Advance')).lastIndexOf(true);
                              if (idx !== latestAdvanceIdx) return false;
                            }
                            return true;
                          })
                          .map((inv) => (
                          <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#2563eb' }}>{inv.invoiceNumber}</td>
                            <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{inv.title}</td>
                            <td style={{ padding: '1rem 1.25rem', color: '#16a34a', fontWeight: '700' }}>₹{inv.amount?.toLocaleString('en-IN')}</td>
                             <td style={{ padding: '1rem 1.25rem' }}>
                              <span style={{
                                backgroundColor: inv.status === 'Paid' ? '#f0fdf4' : inv.status === 'Pending Verification' ? '#fffbeb' : '#fef2f2',
                                border: `1px solid ${inv.status === 'Paid' ? '#bbf7d0' : inv.status === 'Pending Verification' ? '#fde68a' : '#fecaca'}`,
                                color: inv.status === 'Paid' ? '#16a34a' : inv.status === 'Pending Verification' ? '#b45309' : '#dc2626',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}>
                                {inv.status === 'Paid' ? 'Paid ✔' : inv.status === 'Pending Verification' ? '⏳ Awaiting Verification' : 'Unpaid'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                              {inv.status === 'Paid' ? (
                                <button
                                  onClick={() => setSelectedReceipt(inv)}
                                  style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.15)' }}
                                >
                                  <Download size={14} /> View Receipt
                                </button>
                              ) : inv.status === 'Pending Verification' ? (
                                <div style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', display: 'inline-block' }}>
                                  ⏳ Payment Submitted to Accounts
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setIsPayModalOpen(true);
                                  }}
                                  style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <CreditCard size={14} /> Pay Now
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 5. CLIENT SITE PHOTOS & ESTIMATION TAB */}
            {activeTab === 'sitePhotos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={20} color="#2563eb" /> Site Photos & Tile Estimator
                    </h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                      Upload room photos and estimated square footage so your assigned designer (<strong>{project.assignedDesigner || 'Designer'}</strong>) can easily calculate tile and material requirements!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.15rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                  >
                    📸 Upload Site Photo
                  </button>
                </div>

                {!project.sitePhotos || project.sitePhotos.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📐</div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: '700' }}>No Site Photos Uploaded Yet</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem' }}>Upload your room photos and square footage to help your designer plan tiles and layouts faster.</p>
                    <button
                      onClick={() => setIsPhotoModalOpen(true)}
                      style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      + Upload First Room Photo
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {project.sitePhotos.map((photo, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <img src={photo.fileUrl} alt={photo.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        <div style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>{photo.roomType}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '700' }}>{photo.title}</h4>
                          <div style={{ backgroundColor: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#64748b' }}>📐 Area: <strong style={{ color: '#0f172a' }}>{photo.sqFeetEstimate} Sq.Ft</strong></span>
                            <span style={{ color: '#16a34a' }}>🧱 Tiles: <strong style={{ color: '#16a34a' }}>~{photo.tilesCountEstimate} Tiles</strong></span>
                          </div>
                          {photo.notes && <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic' }}>"{photo.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. DESIGNER LIVE CHAT TAB */}
            {activeTab === 'chat' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageSquare size={22} color="#2563eb" /> Direct Designer Communication
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                      Ask questions, clarify doubts, or share design ideas directly with your interior designer <strong>({project.assignedDesigner || 'Designer'})</strong>.
                    </p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  {/* Chat Messages Feed */}
                  <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', height: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(!project.projectMessages || project.projectMessages.length === 0) ? (
                      <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: '0.9rem' }}>
                        💬 No messages sent yet. Start the conversation with your designer below!
                      </div>
                    ) : (
                      project.projectMessages.map((msg, i) => {
                        const isClient = msg.senderRole === 'Client';
                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isClient ? 'flex-end' : 'flex-start' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginBottom: '0.2rem' }}>
                              {msg.senderName} ({msg.senderRole}) • {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{
                              maxWidth: '75%',
                              padding: '0.75rem 1rem',
                              borderRadius: isClient ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              backgroundColor: isClient ? '#2563eb' : '#ffffff',
                              color: isClient ? '#ffffff' : '#0f172a',
                              border: isClient ? 'none' : '1px solid #cbd5e1',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                              fontSize: '0.9rem',
                              lineHeight: '1.4'
                            }}>
                              {msg.message}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Send Message Box */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const chatInput = e.target.chatMsg.value;
                      if (!chatInput || !chatInput.trim()) return;
                      try {
                        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                        const res = await fetch(`${API_BASE_URL}/projects/${project._id}/messages`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ message: chatInput })
                        });
                        if (res.ok) {
                          e.target.reset();
                          fetchClientPortal();
                        }
                      } catch (err) { alert('Error sending message'); }
                    }}
                    style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                  >
                    <input
                      type="text"
                      name="chatMsg"
                      placeholder={`Type your question or doubt for ${project.assignedDesigner || 'the designer'}...`}
                      style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)' }}
                    >
                      Send 🚀
                    </button>
                  </form>
                </div>
              </div>
            )}


          </div>
        </div>
      )}

      {/* Interactive Payment Popup Modal with Direct GPay & UPI Scanner */}
      {isPayModalOpen && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setIsPayModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                <QrCode size={30} />
              </div>
              <h3 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '1.35rem', fontWeight: '800' }}>Direct GPay & UPI Payment</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Invoice: <strong>{selectedInvoice.invoiceNumber}</strong> • {selectedInvoice.title}
              </p>
            </div>

            {/* Payable Amount Summary Card */}
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1.5px solid #bbf7d0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', display: 'block', marginBottom: '0.2rem' }}>Total Amount to Pay</span>
              <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#15803d', letterSpacing: '-0.02em' }}>
                ₹{selectedInvoice.amount?.toLocaleString('en-IN')}
              </div>
            </div>

            {/* 1. Direct GPay Deep-Link Button */}
            <div style={{ marginBottom: '1.25rem' }}>
              <a
                href={`upi://pay?pa=9876543210@upi&pn=Luxury%20Interior%20Design%20Studio&am=${selectedInvoice.amount}&tn=Invoice_${selectedInvoice.invoiceNumber}&cu=INR`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  backgroundColor: '#1a73e8',
                  color: '#ffffff',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(26, 115, 232, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Zap size={20} /> Open & Pay via GPay / PhonePe App Direct Link
              </a>
            </div>

            {/* 2. QR Code Scanner Card */}
            <div style={{ backgroundColor: '#ffffff', border: '2px dashed #2563eb', borderRadius: '16px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.25rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)' }}>
              <div style={{ display: 'inline-block', padding: '10px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '0.75rem' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=9876543210@upi&pn=LuxuryInteriorDesignStudio&am=${selectedInvoice.amount}&tn=Invoice_${selectedInvoice.invoiceNumber}&cu=INR`)}`}
                  alt="UPI Payment QR Code"
                  style={{ width: '170px', height: '170px', display: 'block', borderRadius: '8px' }}
                />
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} color="#2563eb" /> Scan with Google Pay, PhonePe, or Paytm Scanner
              </div>
            </div>

            {/* 3. Copy Phone Number & UPI ID Section */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #cbd5e1', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                Or Copy Number / VPA & Pay manually in GPay:
              </div>

              {/* Copy GPay Mobile Number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>GPay Phone / Mobile Number:</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>+91 98765 43210</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPhone('9876543210')}
                  style={{ backgroundColor: copiedPhone ? '#f0fdf4' : '#eff6ff', color: copiedPhone ? '#16a34a' : '#2563eb', border: `1px solid ${copiedPhone ? '#bbf7d0' : '#bfdbfe'}`, padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {copiedPhone ? '✔ Copied!' : '📋 Copy Number'}
                </button>
              </div>

              {/* Copy UPI VPA ID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>UPI VPA ID:</span>
                  <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>9876543210@upi</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyVpa('9876543210@upi')}
                  style={{ backgroundColor: copiedVpa ? '#f0fdf4' : '#eff6ff', color: copiedVpa ? '#16a34a' : '#2563eb', border: `1px solid ${copiedVpa ? '#bbf7d0' : '#bfdbfe'}`, padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {copiedVpa ? '✔ Copied!' : '📋 Copy UPI ID'}
                </button>
              </div>
            </div>

            {/* Payment Confirmation Action */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setIsPayModalOpen(false)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmSimulatedPayment}
                style={{ flex: 1.5, padding: '0.75rem', borderRadius: '10px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)' }}
              >
                {isProcessingPayment ? 'Verifying Payment...' : '✅ I Have Completed Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Payment Receipt Modal */}
      {selectedReceipt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', maxWidth: '580px', width: '100%', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button
              onClick={() => setSelectedReceipt(null)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>

            {/* Receipt Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: '800', fontSize: '1.1rem' }}>
                  <Sparkles size={20} /> InteriorCraft Studio
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Official Payment Receipt</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800' }}>
                  RECEIPT CONFIRMED ✔
                </span>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>
                  Date: {selectedReceipt.paidAt || selectedReceipt.paidDate ? new Date(selectedReceipt.paidAt || selectedReceipt.paidDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Receipt Content Details */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Receipt For Client:</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{project?.clientName || user?.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Invoice Number:</span>
                  <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{selectedReceipt.invoiceNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Project Name:</span>
                  <strong style={{ color: '#0f172a' }}>{project?.projectName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Payment Mode:</span>
                  <strong style={{ color: '#16a34a' }}>Online / Digital Transfer</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>Total Paid Amount:</span>
                <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '1.3rem' }}>₹{selectedReceipt.amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
              >
                <Download size={15} /> Print / Save Receipt PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERALL QUOTATION PDF / VIEWER MODAL */}
      {selectedQuotationDoc && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', maxWidth: '750px', width: '100%', padding: '2.25rem', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setSelectedQuotationDoc(null)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            {/* Document Printable Content */}
            <div id="printable-quotation-document" style={{ fontFamily: "'Inter', sans-serif" }}>
              {/* Header Company Info */}
              <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontWeight: '800', fontSize: '1.35rem', marginBottom: '0.2rem' }}>
                    <Palette size={26} color="#2563eb" /> Luxury Interior Design Studio
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                    Official Architectural & Interior Renovation Contract
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.35rem 0.85rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.8rem', display: 'inline-block' }}>
                    {project.status === 'Completed' ? 'OFFICIALLY HANDED OVER' : 'APPROVED CONTRACT'}
                  </span>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                    Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Client & Project Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Client Details</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{project.clientName || user?.name}</strong>
                  <div style={{ color: '#475569', fontSize: '0.8rem' }}>{project.clientEmail || user?.email} • {project.clientPhone}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Location: {project.location}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Project Details</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{project.projectName} ({project.projectId})</strong>
                  <div style={{ color: '#475569', fontSize: '0.8rem' }}>Designer: {project.assignedDesigner || 'Rahul'}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Site Engineer: {project.siteEngineer || project.projectManager || 'Jasper'}</div>
                </div>
              </div>

              {/* Itemized Cost Breakdown Table */}
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>Overall Final Itemized Cost Breakdown</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Item Description / Work Category</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#334155' }}>📦 Material Specifications & Procurement</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700' }}>₹{(selectedQuotationDoc.materialCost || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#334155' }}>🔧 On-Site Labour & Carpentry Execution</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700' }}>₹{(selectedQuotationDoc.labourCost || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#334155' }}>🎨 2D/3D Concept Design & Blueprinting</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700' }}>₹{(selectedQuotationDoc.designCharges || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#334155' }}>🛋️ Custom Furniture & Woodwork Fittings</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700' }}>₹{(selectedQuotationDoc.furnitureCost || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#334155' }}>⚡ Electrical Fixtures & Plumbing Infrastructure</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700' }}>₹{(selectedQuotationDoc.electricalPlumbingCost || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#475569' }}>Subtotal (Before Tax)</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>
                      ₹{((selectedQuotationDoc.materialCost || 0) + (selectedQuotationDoc.labourCost || 0) + (selectedQuotationDoc.designCharges || 0) + (selectedQuotationDoc.furnitureCost || 0) + (selectedQuotationDoc.electricalPlumbingCost || 0)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>🏛️ Applicable GST & Government Taxes (18%)</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#64748b' }}>₹{(selectedQuotationDoc.taxGst || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#f0fdf4' }}>
                    <td style={{ padding: '1rem', color: '#15803d', fontSize: '1rem', fontWeight: '800' }}>Total Contract Price</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#15803d', fontSize: '1.25rem', fontWeight: '800' }}>₹{(selectedQuotationDoc.totalAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures & Seal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.8rem', color: '#64748b' }}>
                <div>
                  <span>Authorized Signature: <strong>Management / Admin</strong></span>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Luxury Interior Design Management System</div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                  ✔ VERIFIED & HANDED OVER
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSelectedQuotationDoc(null)}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
              >
                <Download size={16} /> Download / Print Overall Quotation PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT UPLOAD SITE PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', maxWidth: '520px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Upload Site Photo & Details</h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.85rem' }}>
              Provide room photos and square footage to enable automated tile & material estimation for your designer.
            </p>

            <form onSubmit={handleUploadSitePhoto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Photo Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Floor Site View"
                  value={photoForm.title}
                  onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Room Category *</label>
                <select
                  value={photoForm.roomType}
                  onChange={(e) => setPhotoForm({ ...photoForm, roomType: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Living Room">Living Room</option>
                  <option value="Modular Kitchen">Modular Kitchen</option>
                  <option value="Master Bedroom">Master Bedroom</option>
                  <option value="Bathroom / Washroom">Bathroom / Washroom</option>
                  <option value="Dining & Balcony">Dining & Balcony</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Upload Room Image *
                </label>

                {/* Upload Icon Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label
                    title="Upload Site Image"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justify: 'center',
                      width: '46px',
                      height: '46px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      transition: 'transform 0.2s ease, backgroundColor 0.2s ease'
                    }}
                  >
                    <Upload size={22} />
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotoForm(prev => ({
                              ...prev,
                              fileUrl: reader.result,
                              title: prev.title || file.name.replace(/\.[^/.]+$/, "")
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <span style={{ fontSize: '0.85rem', color: photoForm.fileUrl ? '#16a34a' : '#64748b', fontWeight: '600' }}>
                    {photoForm.fileUrl ? '✔ Photo Attached' : 'Click icon to select image'}
                  </span>
                </div>

                {/* Hidden input to maintain form required validation */}
                <input
                  type="hidden"
                  required
                  value={photoForm.fileUrl}
                />

                {/* Image Live Preview */}
                {photoForm.fileUrl && (
                  <div style={{ marginTop: '0.65rem', padding: '0.6rem', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={photoForm.fileUrl} alt="Preview" style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '8px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: '700' }}>✔ Image selected & ready for calculation!</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Estimated Area (Sq. Feet) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 200"
                  value={photoForm.sqFeet}
                  onChange={(e) => setPhotoForm({ ...photoForm, sqFeet: Number(e.target.value) })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #2563eb', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '1rem', fontWeight: '800', outline: 'none' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.3rem', fontWeight: '700' }}>
                  🧱 Auto Tile Estimation: ~{Math.ceil(((Number(photoForm.sqFeet) || 0) / 4) * 1.1)} Tiles required (Standard 2x2 ft tiles + 10% wastage)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Special Instructions / Designer Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Italian marble finish tiles preferred for living room flooring..."
                  value={photoForm.notes}
                  onChange={(e) => setPhotoForm({ ...photoForm, notes: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPhoto}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                >
                  {isUploadingPhoto ? 'Uploading...' : '📤 Submit Site Photo & Estimates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '960px', width: '100%', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
            >
              <X size={22} />
            </button>
            <div style={{ backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5rem', minHeight: '520px', width: '100%' }}>
              <img src={previewImage.fileUrl} alt={previewImage.title} style={{ width: '100%', maxHeight: '80vh', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} />
            </div>
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>{previewImage.title}</h3>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#3b82f6', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {previewImage.designType || 'Ultra HD 3D Render'}
                </span>
              </div>
              <a
                href={previewImage.fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
              >
                <Download size={16} /> Open HD 3D Image
              </a>
            </div>
          </div>
        </div>
      )}

      {/* QUOTATION REJECTION & REVISION QUERY MODAL */}
      {isRejectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={20} color="#dc2626" /> Reject Quotation & Request Cost Revision
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Send your queries directly to Project Manager <strong>{project?.assignedPM || 'Gaurav'}</strong>.
                </p>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsRejectModalOpen(false)} />
            </div>

            <form onSubmit={submitQuotationRejectionModal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  💬 Enter Your Queries / Required Price Adjustments
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="e.g., The total material cost ₹2,00,000 is above our budget limit. Please use alternate brand options for carpentry or reduce custom furniture items to lower the price to ₹4,00,000..."
                  value={rejectionQueries}
                  onChange={(e) => setRejectionQueries(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReject}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {isSubmittingReject ? 'Sending...' : '🚀 Send Queries & Request Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;

