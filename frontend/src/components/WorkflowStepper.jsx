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
  { id: 'Lead Registered', label: '1. Lead Registered', icon: UserPlus },
  { id: 'Client Account Created', label: '2. Account Created', icon: UserPlus },
  { id: 'Project Created', label: '3. Project Created', icon: Briefcase },
  { id: 'Designer Assigned', label: '4. Designer Assigned', icon: Palette },
  { id: 'Design Upload', label: '5. Design Uploaded', icon: Palette },
  { id: 'Client Review', label: '6. Client Review', icon: Eye },
  { id: 'Revision Requested', label: '7. Revision Completed', icon: Clock },
  { id: 'Design Approved', label: '8. Design Approved', icon: FileCheck },
  { id: 'Quotation Generated', label: '9. Quotation Sent', icon: FileCheck },
  { id: 'Quotation Approved', label: '10. Quotation Approved', icon: CheckCircle },
  { id: 'Advance Payment Received', label: '11. Advance Paid', icon: CreditCard },
  { id: 'PM Approval', label: '12. PM Approval', icon: CheckCircle },
  { id: 'Site Engineer Assigned', label: '13. Engineer Assigned', icon: HardHat },
  { id: 'Material Procurement', label: '14. Procurement Started', icon: CreditCard },
  { id: 'Execution Started', label: '15. Execution Started', icon: HardHat },
  { id: 'Daily Progress Updates', label: '16. Daily Updates', icon: Clock },
  { id: 'Second Installment Paid', label: '17. Second Installment Paid', icon: DollarSign },
  { id: 'Quality Inspection', label: '18. Final Inspection', icon: Award },
  { id: 'Stage Payments', label: '19. Final Payment', icon: CreditCard },
  { id: 'Client Handover', label: '20. Project Handover', icon: PackageCheck },
];

const WorkflowStepper = ({ currentStage = 'Design Upload', project = null, advancePaymentPaid = false }) => {
  let activeIdx = STAGES.findIndex((s) => s.id === currentStage);

  // Fallback lookup by stage label if id doesn't match directly
  if (activeIdx < 0 && currentStage) {
    activeIdx = STAGES.findIndex((s) => s.label.toLowerCase().includes(currentStage.toLowerCase()));
  }

  // Exact Condition Stage Mapping Rules
  const progressPct = project?.progressPercentage ?? 0;
  const status = project?.status || '';
  const invoices = project?.invoices || [];
  const finalPaid = invoices.some(i => (i.installmentType === 'Final Installment' || i.title?.includes('Final')) && i.status === 'Paid');
  const secondPaid = invoices.some(i => (i.installmentType === 'Second Installment' || i.title?.includes('Second')) && i.status === 'Paid');
  const advancePaid = advancePaymentPaid || project?.advancePaymentPaid || invoices.some(i => (i.installmentType === 'Advance' || i.title?.includes('Advance')) && i.status === 'Paid');

  if (currentStage === 'Client Handover' || currentStage === 'Project Closed' || finalPaid) {
    activeIdx = 19; // Step 20: Project Handover
  } else if (currentStage === 'Final Payment' || (progressPct === 100 && status === 'Completed')) {
    activeIdx = 18; // Step 19: Final Payment
  } else if (progressPct === 100 || currentStage === 'Quality Inspection' || currentStage === 'Final Inspection') {
    activeIdx = 17; // Step 18: Final Inspection
  } else if (secondPaid || currentStage === 'Second Installment Paid') {
    activeIdx = 16; // Step 17: Second Installment Paid
  } else if (currentStage === 'Daily Progress Updates' || currentStage === 'Daily Updates') {
    activeIdx = 15; // Step 16: Daily Updates
  } else if (currentStage === 'Execution Started' || currentStage === 'Work Started') {
    activeIdx = 14; // Step 15: Execution Started
  } else if (currentStage === 'Material Procurement') {
    activeIdx = 13; // Step 14: Procurement Started
  } else if (currentStage === 'Site Engineer Assigned') {
    activeIdx = 12; // Step 13: Engineer Assigned
  } else if (currentStage === 'PM Approval') {
    activeIdx = 11; // Step 12: PM Approval
  } else if (currentStage === 'Advance Payment Received' || (advancePaid && activeIdx < 10)) {
    activeIdx = 10; // Step 11: Advance Paid
  } else if (activeIdx < 0) {
    activeIdx = 2; // Default to Step 3: Project Created
  }

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          🔄 Project Progress
        </h4>
        <span style={{ backgroundColor: activeIdx >= 16 ? '#f0fdf4' : '#eff6ff', color: activeIdx >= 16 ? '#16a34a' : '#2563eb', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
          Stage: {STAGES[activeIdx]?.label || currentStage}
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
