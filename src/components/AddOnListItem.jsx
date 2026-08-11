import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { ChevronRight, Package } from 'lucide-react';

export default function AddOnListItem({ app }) {
  const navigate = useNavigate();
  const company = app.client_id?.company_name || 'Unknown Company';
  const cert = app.certificate_id?.certificate_number || '—';
  const date = app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const newProduct = app.new_product_name || app.product_name || '—';

  return (
    <div
      className="card"
      onClick={() => navigate(`/addon/${app._id || app.id}`, { state: { app } })}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Package size={20} color="var(--primary)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="card-title" style={{ marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cert} &middot; {date}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <StatusBadge status={app.status} />
          {app.new_product_name && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--divider)', padding: '2px 7px', borderRadius: 99 }}>
              + {app.new_product_name}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={18} color="var(--text-3)" style={{ flexShrink: 0 }} />
    </div>
  );
}