/* eslint-disable */

const stripe = Stripe(
  'pk_test_51RFj505dSO6pP3uiEZNAbnfpMdOQyhEeQNd5YwOboSvMg3BeyQq4pVbjDoUWagHWjHoEwbIxe2Jhl3zp8uE8Fi6300zwYAvp0i',
);

const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`,
    );
    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};

const bookBtn = document.getElementById('book-tour');
if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
