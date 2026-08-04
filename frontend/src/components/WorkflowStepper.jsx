import React from 'react';
import {
  CheckCircle,
  Clock,
  UserPlus,
  Briefcase,
  Palette,
  Eye,
  FileCheck,
  CreditCard,
  HardHat,
  Award,
  DollarSign,
  PackageCheck
} from 'lucide-react';

const STAGES = [
  { id: 'Client Registration', label: '1. Client Registration', icon: UserPlus },
  { id: 'Project Setup', label: '2. Project Setup', icon: Briefcase },
  { id: 'Design Upload', label: '3. Designer Uploads', icon: Palette },
  { id: 'Client Review', label: '4. Client Review', icon: Eye },
  { id: 'PM Design Sign-off', label: '5. PM Approval', icon: FileCheck },
  { id: 'Quotation & Advance Payment', label: '6. Quotation & Advance', icon: CreditCard },
  { id: 'Site Execution', label: '7. Site Execution', icon: HardHat },
  { id: 'Stage Payments', label: '8. Stage Payments', icon: DollarSign },
  { id: 'Completion & Final Inspection', label: '9. Inspection', icon: Award },
  { id: 'Final Payment & Handover', label: '10. Final Handover', icon: PackageCheck },
];

const WorkflowStepper = ({ currentStage = 'Design Upload', advancePaymentPaid = false }) => {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
  const activeIdx = currentIndex >= 0 ? currentIndex : 2;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          🔄 End-to-End Workflow Progress
        </h4>
        <span style={{ backgroundColor: advancePaymentPaid ? '#f0fdf4' : '#eff6ff', color: advancePaymentPaid ? '#16a34a' : '#2563eb', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
          Stage: {currentStage} {advancePaymentPaid ? '• Advance Paid (30-50%)' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {STAGES.map((stg, idx) => {
          const Icon = stg.icon;
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          let bgColor = '#f1f5f9';
          let textColor = '#64748b';
          let borderColor = '#cbd5e1';

          if (isDone) {
            bgColor = '#f0fdf4';
            textColor = '#16a34a';
            borderColor = '#bbf7d0';
          } else if (isCurrent) {
            bgColor = '#eff6ff';
            textColor = '#2563eb';
            borderColor = '#2563eb';
          }

          return (
            <div
              key={stg.id}
              style={{
                flex: '1 0 130px',
                minWidth: '130px',
                backgroundColor: bgColor,
                border: `1.5px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '0.65rem 0.5rem',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem', color: textColor }}>
                {isDone ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <div style={{ fontSize: '0.725rem', fontWeight: '700', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stg.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
