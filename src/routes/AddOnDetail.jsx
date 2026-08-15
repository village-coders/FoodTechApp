import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { getAddOnById, markFormReceived, requestProductForm } from '../api/addOns';
import { getFileUrl } from '../api/client';
import { ArrowLeft, Package, CheckCircle, FileText, ExternalLink, ChevronRight, ChevronDown, ChevronUp, FileCheck } from 'lucide-react';
import LoadingState from '../components/LoadingState';

export default function AddOnDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [appData, setAppData] = useState(state?.app || null);
  const [loading, setLoading] = useState(!state?.app);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestingForm, setRequestingForm] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
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

  const isFormReceived = ['all_forms_received', 'product_form_approved', 'ready_for_certificate', 'completed'].includes(appData.status);
  const formRequested = appData.status === 'product_approval_form_enabled' || Boolean(appData.product_approval_form?.sent_at);

  const toggleExpand = (idx) => {
    setExpandedIndex(prev => (prev === idx ? null : idx));
  };

  const handleMarkFormReceived = async () => {
    setSubmitting(true);
    try {
      const res = await markFormReceived(appData._id || appData.id);
      if (res.data) {
        setAppData(res.data);
      } else {
        setAppData(a => ({ ...a, status: 'all_forms_received' }));
      }
      setShowConfirm(false);
      alert('Product Approval Form marked as received successfully!');
    } catch (err) {
      alert(err.message || 'Failed to mark form as received');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestForm = async () => {
    setRequestingForm(true);
    try {
      const res = await requestProductForm(appData._id || appData.id);
      if (res.data) setAppData(res.data);
      alert('Product Approval Form requested successfully! Applicant notified.');
    } catch (err) {
      alert(err.message || 'Failed to request Product Approval Form');
    } finally {
      setRequestingForm(false);
    }
  };

  const getFoodTechsList = () => {
    const names = [];

    const mainFT = appData.assigned_food_tech;
    if (mainFT) {
      const name = typeof mainFT === 'object' ? (mainFT.full_name || mainFT.name || mainFT.username) : String(mainFT);
      if (name && !names.includes(name)) names.push(name);
    }

    if (Array.isArray(appData.assigned_food_techs)) {
      appData.assigned_food_techs.forEach(ft => {
        if (typeof ft === 'string') {
          const trimmed = ft.trim();
          if (trimmed && !names.includes(trimmed)) names.push(trimmed);
        } else if (ft && typeof ft === 'object') {
          const name = ft.full_name || ft.name || ft.username;
          if (name && !names.includes(name)) names.push(name);
        }
      });
    }

    if (names.length === 0) return 'You';
    return names.join(', ');
  };

  const getProductResponse = (idx, prodName) => {
    const responsesList = appData.product_approval_form?.product_responses;
    if (!Array.isArray(responsesList)) return null;
    return responsesList.find(r => r.product_index === idx || (prodName && r.product_name?.toLowerCase() === prodName?.toLowerCase()));
  };

  const addOnProducts = Array.isArray(appData.products) && appData.products.length > 0 ? appData.products : [];
  const certProducts = Array.isArray(appData.certificate_id?.products_covered)
    ? appData.certificate_id.products_covered.map(p => typeof p === 'string' ? { name: p, isExisting: true } : p)
    : [];
  const legacyProduct = appData.new_product_name ? [{ name: appData.new_product_name, type: 'Add product', isNew: true }] : [];

  const allProductItems = addOnProducts.length > 0 ? addOnProducts : [...legacyProduct, ...certProducts];

  return (
    <>
      <div className="app-content" style={{ paddingBottom: 100 }}>

        {/* Back + title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'var(--primary-subtle)', border: 'none', color: 'var(--primary)', cursor: 'pointer', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Add-on Detail</span>
        </div>

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
            { label: 'Food Tech(s)', value: getFoodTechsList() },
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
        <p className="section-heading" style={{ marginTop: 16 }}>Assigned Products ({allProductItems.length})</p>

        {allProductItems.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '0 4px' }}>No products listed.</p>
        ) : (
          allProductItems.map((prod, idx) => {
            const prodName = typeof prod === 'string' ? prod : (prod.name || 'Unnamed Product');
            const prodType = prod.type || (prod.isExisting ? 'Existing Covered Product' : (prod.isNew ? 'New Product' : null));
            const prodCode = prod.code;
            const sn = prod.sn || (idx + 1);

            return (
              <div
                key={idx}
                className="card"
                onClick={() => navigate(`/addon/${appData._id || appData.id}/product/${idx}`, { state: { app: appData, product: prod } })}
                style={{
                  padding: '14px 16px',
                  marginBottom: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={19} color="var(--primary)" />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sn ? `${sn}. ` : ''}{prodName}
                    </div>
                    {prodCode && (
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                        Code: {prodCode}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {prodType && (
                    <span style={{ fontSize: 11, color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 9px', borderRadius: 99, fontWeight: 600 }}>
                      {prodType}
                    </span>
                  )}
                  <ChevronRight size={18} color="var(--text-3)" />
                </div>
              </div>
            );
          })
        )}

        {/* Actions */}
        {!isFormReceived && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!formRequested ? (
              <button
                className="btn"
                onClick={handleRequestForm}
                disabled={requestingForm}
                style={{
                  background: '#0284c7',
                  color: 'white',
                  borderRadius: 14,
                  padding: '14px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: requestingForm ? 'not-allowed' : 'pointer'
                }}
              >
                {requestingForm ? <span className="spinner" /> : <FileText size={18} />}
                Request Product Approval Form
              </button>
            ) : (
              <div className="card" style={{ textAlign: 'center', background: 'var(--primary-subtle)', border: '1px solid var(--primary-border)', padding: '12px' }}>
                <FileText size={20} color="var(--primary)" style={{ marginBottom: 4 }} />
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13, margin: 0 }}>
                  Product Approval Form Requested & Enabled
                </p>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={() => setShowConfirm(true)}
              style={{
                borderRadius: 14,
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 700
              }}
            >
              <CheckCircle size={18} /> Mark Product Approval Form Received
            </button>
          </div>
        )}

        {isFormReceived && (
          <div className="card" style={{ textAlign: 'center', background: 'var(--status-done-bg)', border: '1px solid var(--primary-border)' }}>
            <CheckCircle size={22} color="var(--primary)" style={{ marginBottom: 6 }} />
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14, margin: 0 }}>Product Approval Form Received</p>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Confirm Form Received"
          message="Are you sure you want to mark the Product Approval Form responses as received?"
          confirmLabel={submitting ? 'Please wait…' : 'Yes, Mark as Received'}
          onConfirm={handleMarkFormReceived}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}