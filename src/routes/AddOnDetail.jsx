import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { getAddOnById, completeAddOn } from '../api/addOns';
import { ArrowLeft, Package, CheckCircle } from 'lucide-react';
import LoadingState from '../components/LoadingState';

export default function AddOnDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [appData, setAppData] = useState(state?.app || null);
  const [loading, setLoading] = useState(!state?.app);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    if (!appData) {
      getAddOnById(id)
        .then(res => setAppData(res.data || res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, appData]);

  if (loading) return <LoadingState />;
  if (!appData) {
    return (
      <div style={{ padding: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ width: 'auto', padding: '10px 18px' }}>
          Go Back
        </button>
        <p style={{ marginTop: 16, color: 'var(--text-3)' }}>Application not found.</p>
      </div>
    );
  }

  const isComplete = appData.status?.includes('complete') || appData.status === 'ready_for_certificate';
  const products = appData.certificate_id?.products_covered || [];
  const newProduct = appData.new_product_name;

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await completeAddOn(appData._id || appData.id);
      navigate(-1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const allProductItems = [...products, ...(newProduct ? [{ name: newProduct, isNew: true }] : [])];

  return (
    <>
      <div style={{ background: 'var(--primary)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 }}>Ad-on Detail</span>
      </div>

      <div className="app-content" style={{ paddingBottom: 100 }}>
        {/* Hero */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
                {appData.client_id?.company_name || 'Company'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                {appData.certificate_id?.certificate_number || '—'}
              </div>
            </div>
            <StatusBadge status={appData.status} />
          </div>
          {appData.action_type && (
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 10px', borderRadius: 99 }}>
              {appData.action_type?.toUpperCase()} action
            </span>
          )}
        </div>

        {/* Info rows */}
        <div className="card" style={{ padding: '4px 16px' }}>
          {[
            { label: 'Contact', value: appData.contact_name || '—' },
            { label: 'Email', value: appData.contact_email || '—' },
            { label: 'Phone', value: appData.contact_phone || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="detail-row">
              <div className="detail-label">{label}</div>
              <div className="detail-value">{value}</div>
            </div>
          ))}
        </div>

        {/* Products */}
        <p className="section-heading" style={{ marginTop: 16 }}>Products ({allProductItems.length})</p>

        {allProductItems.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '0 4px' }}>No products listed.</p>
        ) : (
          allProductItems.map((prod, idx) => {
            const prodName = typeof prod === 'string' ? prod : prod.name;
            const isNew = typeof prod === 'object' && prod.isNew;
            return (
              <div key={idx} className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isComplete ? 0 : 10 }}>
                  <Package size={15} color="var(--primary)" />
                  <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{prodName}</span>
                  {isNew && <span style={{ fontSize: 11, color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>New</span>}
                </div>
                {!isComplete && (
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Add response / notes…"
                    value={responses[idx] || ''}
                    onChange={e => setResponses(prev => ({ ...prev, [idx]: e.target.value }))}
                    style={{ resize: 'none', fontSize: 13, padding: '9px 12px' }}
                  />
                )}
              </div>
            );
          })
        )}

        {!isComplete && (
          <button className="btn btn-primary" onClick={() => setShowConfirm(true)} style={{ marginTop: 8, borderRadius: 14, padding: 14 }}>
            <CheckCircle size={18} /> Mark as Completed
          </button>
        )}

        {isComplete && (
          <div className="card" style={{ textAlign: 'center', background: 'var(--status-done-bg)', border: '1px solid var(--primary-border)' }}>
            <CheckCircle size={22} color="var(--primary)" style={{ marginBottom: 6 }} />
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>Review completed</p>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Complete Review"
          message="Are you sure you want to mark this add-on application as complete?"
          confirmLabel="Yes, Complete"
          onConfirm={handleComplete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}