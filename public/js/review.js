/* eslint-disable */

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const review = document.querySelector('[name="review"]').value;
  const rating = document.querySelector('[name="rating"]').value;
  const tour = document.querySelector('[name="tour"]').value;
  const user = document.querySelector('[name="user"]').value;

  try {
    await axios.post('/api/v1/reviews', { review, rating, tour, user });

    // ✅ 成功跳转
    window.location.assign('/me');
  } catch (err) {
    console.error('Review submit error:', err);

    const message =
      err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Something went wrong while submitting your review 😢';

    showAlert('error', message);
  }
});
