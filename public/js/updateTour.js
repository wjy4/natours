/* eslint-disable */
document.addEventListener('DOMContentLoaded', async function () {
  const formUpdate = document.getElementById('form-update');
  const jsonTextarea = document.getElementById('jsonData');
  const updateBtn = document.getElementById('btn-update-tour');

  const formUploadCover = document.getElementById('form-upload-cover');
  const imageCoverInput = document.getElementById('imageCover');
  const uploadCoverBtn = document.getElementById('btn-upload-cover');

  const tourId = formUpdate?.getAttribute('data-id');

  if (!tourId) {
    console.error('Tour ID not found!');
    return;
  }

  // Fetch Tour data to fill JSON
  try {
    const res = await fetch(`/api/v1/tours/${tourId}`);
    const data = await res.json();

    if (data.status === 'success') {
      jsonTextarea.value = JSON.stringify(data.data.data, null, 2);
    } else {
      console.error('Error fetching tour data');
    }
  } catch (err) {
    console.error('Fetch error', err);
  }

  // Update Tour JSON button
  updateBtn.addEventListener('click', async function () {
    const jsonData = jsonTextarea.value;

    try {
      const parsedData = JSON.parse(jsonData);

      // 删除不该提交的顶级字段
      delete parsedData._id;
      delete parsedData.id;
      delete parsedData.__v;
      delete parsedData.durationWeeks;
      delete parsedData.reviews;

      // 删除 guides 每个对象中的 _id
      if (Array.isArray(parsedData.guides)) {
        parsedData.guides = parsedData.guides.map((guide) => {
          const { _id, ...rest } = guide;
          return rest;
        });
      }

      // 删除 locations 每个对象中的 _id
      if (Array.isArray(parsedData.locations)) {
        parsedData.locations = parsedData.locations.map((location) => {
          const { _id, ...rest } = location;
          return rest;
        });
      }

      const res = await fetch(`/api/v1/tours/${tourId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      if (res.ok) {
        showAlert('success', 'Tour updated successfully!');
        setTimeout(() => {
          window.location.href = '/manage-tours';
        }, 1500);
      } else {
        showAlert('error', 'Error updating tour!');
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'Invalid JSON format!');
    }
  });

  // Upload new cover image button
  if (uploadCoverBtn) {
    uploadCoverBtn.addEventListener('click', async function () {
      const file = imageCoverInput.files[0];

      if (!file) {
        showAlert('error', 'Please select an image!');
        return;
      }

      const formData = new FormData();
      formData.append('imageCover', file);

      try {
        const res = await fetch(`/api/v1/tours/${tourId}`, {
          method: 'PATCH',
          body: formData,
        });

        if (res.ok) {
          showAlert('success', 'Cover image uploaded successfully!');
          setTimeout(() => {
            window.location.href = '/manage-tours';
          }, 1500);
        } else {
          showAlert('error', 'Error uploading cover image!');
        }
      } catch (err) {
        console.error('Update failed:', errorText);
        showAlert('error', 'Upload failed!');
      }
    });
  }
});
