// public/js/reviews.js
/* eslint-disable */
document.addEventListener('DOMContentLoaded', function () {
  const forms = document.querySelectorAll('.form-review');

  forms.forEach((form) => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const tourId = form.dataset.tourId;
      const review = form.querySelector('input[name="review"]').value;
      const rating = form.querySelector('select[name="rating"]').value;

      if (!review || !rating) {
        return showAlert('error', 'Please enter review and rating');
      }

      try {
        const res = await fetch('/api/v1/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tour: tourId, review, rating }),
        });

        const data = await res.json();

        if (res.ok && data.status === 'success') {
          showAlert('success', '✅ Review submitted!');
          setTimeout(() => location.reload(), 1500);
        } else {
          showAlert('error', data.message || '❌ Error submitting review');
        }
      } catch (err) {
        console.error(err);
        showAlert('error', '❌ You already reviewed this tour!');
      }
    });
  });
});
