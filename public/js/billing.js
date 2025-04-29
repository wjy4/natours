/* eslint-disable */
document.addEventListener('DOMContentLoaded', () => {
  const fetchBtn = document.getElementById('fetchPayment');
  const paymentInput = document.getElementById('paymentIntentId');
  const detailsBox = document.querySelector('.billing-details');
  const detailsList = document.getElementById('payment-info-list');

  fetchBtn.addEventListener('click', async () => {
    const paymentIntentId = paymentInput.value.trim();

    if (!paymentIntentId) {
      alert('Please enter a Payment Intent ID');
      return;
    }

    try {
      const res = await fetch(`/api/v1/billing/payment/${paymentIntentId}`);
      const data = await res.json();

      if (data.status !== 'success') {
        alert('Something went wrong!');
        return;
      }

      const pi = data.data.paymentIntent;

      detailsList.innerHTML = `
          <li><strong>ID:</strong> ${pi.id}</li>
          <li><strong>Amount:</strong> £${(pi.amount_received / 100).toFixed(2)}</li>
          <li><strong>Status:</strong> ${pi.status}</li>
          <li><strong>Created:</strong> ${new Date(pi.created * 1000).toLocaleString()}</li>
          <li><strong>Customer Email:</strong> ${pi.receipt_email || 'N/A'}</li>
        `;

      detailsBox.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      alert('Error fetching payment details');
    }
  });
});
