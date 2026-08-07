import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CheckCircle, Calendar, User, ShieldCheck, AlertCircle, LogIn, LogOut } from 'lucide-react';

const EmployeeCheckin = () => {
  const { user } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workLocation, setWorkLocation] = useState('Office');
  const [workNotes, setWorkNotes] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkinTime, setCheckinTime] = useState(null);
  const [checkoutTime, setCheckoutTime] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([
    { id: 1, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], checkin: '09:14 AM', checkout: '06:05 PM', location: 'Office', hours: '8h 51m', status: 'Present' },
    { id: 2, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], checkin: '09:05 AM', checkout: '06:12 PM', location: 'On-Site', hours: '9h 07m', status: 'Present' },
    { id: 3, date: new Date(Date.now() - 259200000).toISOString().split('T')[0], checkin: '09:20 AM', checkout: '06:00 PM', location: 'Office', hours: '8h 40m', status: 'Present' }
  ]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleCheckin = () => {
    const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = currentTime.toISOString().split('T')[0];

    if (!isCheckedIn) {
      setIsCheckedIn(true);
      setCheckinTime(timeStr);
      setCheckoutTime(null);
      setMessage(`🎉 Successfully Checked In at ${timeStr} (${workLocation})`);
    } else {
      setIsCheckedIn(false);
      setCheckoutTime(timeStr);
      const newEntry = {
        id: Date.now(),
        date: dateStr,
        checkin: checkinTime,
        checkout: timeStr,
        location: workLocation,
        hours: '8h 30m',
        status: 'Completed'
      };
      setAttendanceHistory([newEntry, ...attendanceHistory]);
      setMessage(`👋 Successfully Checked Out at ${timeStr}. Work logged.`);
      setWorkNotes('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1e293b', color: '#f8fafc', fontFamily: "'Space Grotesk', 'Outfit', sans-serif", padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Top Header */}
      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#334155', color: '#38bdf8', padding: '0.3rem 0.75rem', borderRadius: '9999px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          JAC Employee Portal
        </span>
      </div>

      {/* Main Dark Card Container */}
      <div style={{ width: '100%', maxWidth: '640px', backgroundColor: '#0f172a', borderRadius: '24px', padding: '2.5rem', border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', boxSizing: 'border-box' }}>
        
        {/* User Badge Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1e293b', marginBottom: '1.5rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '800' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: '#ffffff' }}>{user?.name || 'Employee Staff'}</h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Role: <strong style={{ color: '#38bdf8' }}>{user?.role || 'Staff Member'}</strong> • InteriorCraft Studio</span>
          </div>
        </div>

        {/* Live Clock Card */}
        <div style={{ textAlign: 'center', backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="#38bdf8" /> Current Time & Date
          </span>
          <h1 style={{ fontSize: '2.6rem', fontWeight: '800', margin: '0.4rem 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Success Message Banner */}
        {message && (
          <div style={{ backgroundColor: '#064e3b', border: '1px solid #059669', color: '#6ee7b7', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center' }}>
            {message}
          </div>
        )}

        {/* Check-In / Check-Out Actions Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
              Work Location
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {['Office', 'On-Site', 'Remote / Home'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setWorkLocation(loc)}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: workLocation === loc ? '2px solid #2563eb' : '1px solid #334155',
                    backgroundColor: workLocation === loc ? '#1e3a8a' : '#1e293b',
                    color: workLocation === loc ? '#ffffff' : '#94a3b8',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
              Daily Task Remarks / Work Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Site 2D layout review & electrical installation"
              value={workNotes}
              onChange={(e) => setWorkNotes(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleToggleCheckin}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: isCheckedIn ? '#dc2626' : '#2563eb',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: isCheckedIn ? '0 4px 16px rgba(220, 38, 38, 0.35)' : '0 4px 16px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {isCheckedIn ? <LogOut size={22} /> : <LogIn size={22} />}
            {isCheckedIn ? 'Check Out Now' : 'Check In Now'}
          </button>
        </div>

        {/* Attendance Log History */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#38bdf8" /> Recent Attendance Logs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {attendanceHistory.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#1e293b', padding: '0.85rem 1.1rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#ffffff' }}>{item.date}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Location: {item.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#38bdf8', fontWeight: '600' }}>In: {item.checkin} • Out: {item.checkout}</div>
                  <div style={{ color: '#4ade80', fontWeight: '700', fontSize: '0.75rem' }}>Status: {item.status} ({item.hours})</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ marginTop: '2.5rem', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>
        © 2026 JAC Employee Check-in Portal • InteriorCraft Studio
      </footer>
    </div>
  );
};

export default EmployeeCheckin;
