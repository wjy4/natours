// public/js/reviews.js
/* eslint-disable */
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('reviewModal');
  if (!modal) return; // ✅ 如果没有 modal，直接退出

  const modalForm = document.getElementById('modal-review-form');
  const reviewText = document.getElementById('modal-review-text');
  const reviewTourId = document.getElementById('modal-tour-id');
  const modalTourName = document.getElementById('modal-tour-name');
  const closeModalBtn = document.getElementById('close-review-modal');
  const starIcons = document.querySelectorAll('.star');

  let selectedRating = 0;

  // 绑定 modal 打开事件
  document.querySelectorAll('.open-review-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      reviewTourId.value = btn.dataset.tourId;
      modalTourName.textContent = btn.dataset.tourName;
      modal.classList.remove('hidden');
    });
  });

  // 关闭
  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    reviewText.value = '';
    selectedRating = 0;
    updateStarUI(0);
  });

  // 星级 UI
  starIcons.forEach((star) => {
    const val = +star.dataset.value;
    star.addEventListener('mouseover', () => updateStarUI(val));
    star.addEventListener('mouseout', () => updateStarUI(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = val;
      updateStarUI(val);
    });
  });

  function updateStarUI(val) {
    starIcons.forEach((s) => {
      const v = +s.dataset.value;
      s.classList.toggle('active', v <= val);
      s.classList.toggle('inactive', v > val);
    });
  }

  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const review = reviewText.value;
    const rating = selectedRating;

    if (!review || !rating)
      return showAlert('error', 'Please enter review and rating');

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
      showAlert('error', '❌ You already reviewed this tour!');
    }
  });
});
