// public/js/reviews.js
/* eslint-disable */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('reviewModal');
  if (!modal) return;

  const modalForm = document.getElementById('modal-review-form');
  const reviewText = document.getElementById('modal-review-text');
  const reviewTourId = document.getElementById('modal-tour-id');
  const modalTourName = document.getElementById('modal-tour-name');
  const closeModalBtn = document.getElementById('close-review-modal');
  const starIcons = document.querySelectorAll('.star');

  let selectedRating = 0;

  // 打开 modal 的按钮（包含新建 + 编辑）
  document.querySelectorAll('.open-review-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isEdit = !!btn.dataset.reviewId;

      reviewTourId.value = btn.dataset.tourId;
      modalTourName.textContent = btn.dataset.tourName;

      if (isEdit) {
        modal.dataset.reviewId = btn.dataset.reviewId;
        reviewText.value = btn.dataset.reviewText || '';
        selectedRating = parseInt(btn.dataset.reviewRating) || 0;
        updateStarUI(selectedRating);
      } else {
        modal.dataset.reviewId = '';
        reviewText.value = '';
        selectedRating = 0;
        updateStarUI(0);
      }

      modal.classList.remove('hidden');
    });
  });

  // 关闭 modal
  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    reviewText.value = '';
    selectedRating = 0;
    updateStarUI(0);
    modal.dataset.reviewId = '';
  });

  // 星级点击 + hover 效果
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

  // 提交 Review 创建 / 更新
  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const review = reviewText.value.trim();
    const rating = selectedRating;

    if (!review || !rating)
      return showAlert('error', '❌ Please enter review and rating');

    const reviewId = modal.dataset.reviewId;
    const payload = {
      tour: reviewTourId.value,
      review,
      rating,
    };

    try {
      const res = await fetch(
        reviewId ? `/api/v1/reviews/${reviewId}` : '/api/v1/reviews',
        {
          method: reviewId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showAlert('success', reviewId ? 'Review updated!' : 'Review created!');
        setTimeout(() => location.reload(), 1500);
      } else {
        showAlert('error', data.message || 'Something went wrong!');
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'Unexpected error occurred!');
    }
  });
});
