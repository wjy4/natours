window.addEventListener('DOMContentLoaded', function () {
  console.log('[createTour.js] DOM fully loaded');

  const form = document.getElementById('form-create');
  const btn = document.getElementById('btn-create-tour');

  if (form && btn) {
    btn.addEventListener('click', async function (e) {
      e.preventDefault();
      btn.textContent = 'Creating...';

      const formData = new FormData(form);

      const startDatesInput = document.getElementById('startDates').value;
      if (startDatesInput) {
        formData.delete('startDates');
        startDatesInput.split(',').forEach((date) => {
          formData.append('startDates', new Date(date.trim()));
        });
      }

      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/submit-tour-data');

        xhr.onload = function () {
          if (xhr.status === 201 || xhr.status === 200) {
            showAlert('success', 'Tour created successfully!');
            setTimeout(() => {
              window.location.href = '/manage-tours';
            }, 1500);
          } else {
            console.error(xhr.responseText);
            showAlert('error', 'Something went wrong!');
          }
        };

        xhr.onerror = function () {
          console.error('XHR upload failed');
          showAlert('error', 'Upload failed!');
        };

        xhr.send(formData);
      } catch (err) {
        console.error(err);
        showAlert('error', 'Error uploading!');
      }
    });
  } else {
    console.error('[createTour.js] Form or button not found!');
  }
});
