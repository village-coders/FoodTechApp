import { apiClient } from './client';

export const getAddOns = () => apiClient('/add-on-applications');
export const getAddOnById = (id) => apiClient(`/add-on-applications/${id}`);
export const saveProductResponse = (id, productIdx, response) => apiClient(`/add-on-applications/${id}/save-product-response/${productIdx}`, {
  method: 'PUT',
  body: JSON.stringify({ response })
});
export const submitAllResponses = (id) => apiClient(`/add-on-applications/${id}/submit-all-responses`, { method: 'PUT' });
export const completeAddOn = (id) => apiClient(`/add-on-applications/${id}/complete`, { method: 'PUT' });
export const markFormReceived = (id) => apiClient(`/add-on-applications/${id}/confirm-form-received`, { method: 'PUT' });
export const requestProductForm = (id, formText = 'Please complete and submit the Product Approval Form for each product.') => apiClient(`/add-on-applications/${id}/enable-form`, {
  method: 'PUT',
  body: JSON.stringify({ form_text: formText, is_draft: false })
});