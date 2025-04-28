/* eslint-disable */
document.addEventListener('DOMContentLoaded', function () {
  const deleteButtons = document.querySelectorAll('.btn--red[data-id]');

  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', async function () {
      const id = btn.getAttribute('data-id');
      try {
        const res = await fetch(`/api/v1/tours/${id}`, {
          method: 'DELETE',
        });
        if (res.status === 204) {
          alert('Tour deleted successfully!');
          location.reload();
        } else {
          alert('Error deleting tour!');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting tour!');
      }
    });
  });
});
