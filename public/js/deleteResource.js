/* public/js/deleteResource.js */
/* eslint-disable */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn--red[data-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const type = detectResourceType(); // 自动检测类型

      if (!id || !type) {
        return alert('❌ Cannot detect delete type or ID');
      }

      const confirmed = confirm(
        `Are you sure you want to delete this ${type}?`,
      );
      if (!confirmed) return;

      try {
        const res = await fetch(`/api/v1/${type}/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Delete failed');
        }

        alert(`✅ ${capitalize(type)} deleted successfully`);
        location.reload();
      } catch (err) {
        console.error(err);
        alert(`❌ Failed to delete ${type}`);
      }
    });
  });

  function detectResourceType() {
    const path = window.location.pathname;
    if (path.includes('manage-users')) return 'users';
    if (path.includes('manage-reviews')) return 'reviews';
    if (path.includes('manage-bookings')) return 'booking';
    if (path.includes('manage-tours')) return 'tours';
    return null;
  }

  function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
  }
});
