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

  // 打开 Review Modal（编辑或新增）
  document.querySelectorAll('.open-review-modal').forEach((btn) => {
    setTimeout(() => reviewText.focus(), 100); // 自动 focus 文字框

    btn.addEventListener('click', () => {
      const isEdit = !!btn.dataset.reviewId;

      reviewTourId.value = btn.dataset.tourId;
      modalTourName.textContent = btn.dataset.tourName;
      modal.dataset.reviewId = isEdit ? btn.dataset.reviewId : '';

      reviewText.value = btn.dataset.reviewText || '';
      selectedRating = parseInt(btn.dataset.reviewRating) || 0;
      updateStarUI(selectedRating);

      modal.classList.remove('hidden');
    });
  });

  // 星星 UI
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

  // 提交 Review（创建或更新）
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
        setTimeout(() => location.reload(), 1000);
      } else {
        showAlert('error', data.message || 'Something went wrong!');
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'Unexpected error occurred!');
    }
  });

  // 删除 Review
  document.querySelectorAll('.delete-review-button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const confirmed = confirm('Are you sure you want to delete this review?');
      if (!confirmed) return;

      try {
        const res = await fetch(`/api/v1/reviews/${btn.dataset.reviewId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          showAlert('success', 'Review deleted!');
          setTimeout(() => location.reload(), 1000);
        } else {
          showAlert('error', 'Failed to delete review');
        }
      } catch (err) {
        console.error(err);
        showAlert('error', 'Something went wrong');
      }
    });
  });

  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    reviewText.value = '';
    selectedRating = 0;
    updateStarUI(0);
    modal.dataset.reviewId = '';
  });
  // ESC 关闭 Modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // 点击 overlay 背景关闭
  document.querySelector('.modal__overlay')?.addEventListener('click', () => {
    closeModal();
  });

  // 拆分出 closeModal 方法（复用）
  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('fade-in');
    reviewText.value = '';
    selectedRating = 0;
    updateStarUI(0);
    modal.dataset.reviewId = '';
  }
});
