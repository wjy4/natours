// public/js/reviews.js
/* eslint-disable */
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('reviewModal');
  const modalForm = document.getElementById('modal-review-form');
  const reviewText = document.getElementById('modal-review-text');
  const reviewTourId = document.getElementById('modal-tour-id');
  const modalTourName = document.getElementById('modal-tour-name');
  const closeModalBtn = document.getElementById('close-review-modal');
  const starIcons = document.querySelectorAll('.star');

  let selectedRating = 0;

  // Open modal
  document.querySelectorAll('.open-review-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tourId = btn.dataset.tourId;
      const tourName = btn.dataset.tourName;

      reviewTourId.value = tourId;
      modalTourName.textContent = tourName;
      modal.classList.remove('hidden');
    });
  });

  // Close modal
  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    reviewText.value = '';
    selectedRating = 0;
    updateStarUI(0);
  });

  // Handle star rating click/hover
  starIcons.forEach((star) => {
    const value = +star.dataset.value;

    star.addEventListener('mouseover', () => updateStarUI(value));
    star.addEventListener('mouseout', () => updateStarUI(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = value;
      updateStarUI(value);
    });
  });

  function updateStarUI(val) {
    starIcons.forEach((s) => {
      const currentVal = +s.dataset.value;
      s.classList.toggle('active', currentVal <= val);
      s.classList.toggle('inactive', currentVal > val);
    });
  }

  // Submit review
  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const review = reviewText.value.trim();
    const rating = selectedRating;

    if (!review || !rating) {
      return showAlert('error', 'Please enter review and select rating');
    }

    try {
      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tour: reviewTourId.value, review, rating }),
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
      showAlert('error', '❌ Failed to submit review');
    }
  });
});
