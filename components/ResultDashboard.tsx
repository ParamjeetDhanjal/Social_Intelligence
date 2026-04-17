import React from 'react';
import { AuditTitle } from '../types';
import { X } from 'lucide-react';

interface Props {
  user?: { name?: string; email?: string } | null;
  titles: AuditTitle[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

const RED = '#dc2626';
const SLATE_900 = '#020617';
const SLATE_800 = '#0f172a';
const SLATE_700 = '#1e293b';

const ResultDashboard: React.FC<Props> = ({ user, titles, currentPage, totalPages, onPageChange, onClose }) => {
  return (
    <div style={{ height: '100vh', background: '#020617', color: '#f8fafc', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        padding: '24px 32px', 
        borderBottom: '1px solid #1e293b', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#0f172a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            background: '#dc2626', 
            color: '#fff', 
            fontWeight: 900, 
            fontSize: 16, 
            padding: '8px 16px', 
            borderRadius: 6,
            letterSpacing: '-0.02em'
          }}>
            NDTV Profit
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>
            {user?.name || user?.email || 'User'}
          </span>
          <button onClick={onClose} style={{ padding: 12, color: '#64748b', cursor: 'pointer', background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px', boxSizing: 'border-box' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          background: '#0f172a', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          minWidth: '600px'
        }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #334155' }}>
                Timestamp
              </th>
              <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #334155' }}>
                Title
              </th>
            </tr>
          </thead>
          <tbody>
            {titles.map((title, index) => (
              <tr key={index} style={{ 
                borderBottom: '1px solid #1e293b',
                transition: 'all 0.2s ease'
              }}>
                <td style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace' }}>
                  {new Date(title.timestamp).toLocaleString()}
                </td>
                <td style={{ 
                  padding: '20px 24px', 
                  color: '#f8fafc', 
                  fontSize: '14px', 
                  lineHeight: 1.5,
                  ':hover': { backgroundColor: 'rgba(99,102,241,0.1)' }
                }}>
                  {title.title}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ 
        padding: '24px 32px', 
        background: '#0f172a', 
        borderTop: '1px solid #1e293b', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 0}
          style={{
            padding: '12px 20px', 
            borderRadius: 8, 
            background: currentPage === 0 ? '#1e293b' : '#6366f1', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 900, 
            fontSize: '13px', 
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 0 ? 0.5 : 1
          }}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button 
            key={page}
            onClick={() => onPageChange(page - 1)}
            style={{
              padding: '12px 16px', 
              borderRadius: 8, 
              background: currentPage === page - 1 ? '#6366f1' : 'transparent', 
              color: '#fff', 
              border: `1px solid ${currentPage === page - 1 ? '#6366f1' : '#1e293b'}`, 
              fontWeight: 900, 
              fontSize: '13px', 
              cursor: 'pointer',
              minWidth: '44px'
            }}
          >
            {page}
          </button>
        ))}
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages - 1}
          style={{
            padding: '12px 20px', 
            borderRadius: 8, 
            background: currentPage === totalPages - 1 ? '#1e293b' : '#6366f1', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 900, 
            fontSize: '13px', 
            cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages - 1 ? 0.5 : 1
          }}
        >
          Next
        </button>
        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700 }}>
          Page {currentPage + 1} of {totalPages}
        </span>
      </div>
    </div>
  );
};

export default ResultDashboard;

