/* eslint-disable */
document.addEventListener('DOMContentLoaded', async function () {
  const formUpdate = document.getElementById('form-update');
  const jsonTextarea = document.getElementById('jsonData');
  const updateBtn = document.getElementById('btn-update-tour');

  const formUploadCover = document.getElementById('form-upload-cover');
  const imageCoverInput = document.getElementById('imageCover');
  const uploadCoverBtn = document.getElementById('btn-upload-cover');

  const tourId = formUpdate?.getAttribute('data-id');

  if (!tourId) return console.error('❌ Tour ID not found!');

  // 预加载 tour 数据
  try {
    const res = await fetch(`/api/v1/tours/${tourId}`);
    const data = await res.json();

    if (data.status === 'success') {
      const cleanData = { ...data.data.data };

      // 确保 guides 是 ID 数组
      if (Array.isArray(cleanData.guides)) {
        cleanData.guides = cleanData.guides.map((g) => g._id || g);
      }

      jsonTextarea.value = JSON.stringify(cleanData, null, 2);
    }
  } catch (err) {
    console.error('❌ Fetch error', err);
  }

  // 更新按钮事件
  updateBtn.addEventListener('click', async function () {
    try {
      const parsedData = JSON.parse(jsonTextarea.value);

      // 🧹 删除不该提交的字段
      ['_id', 'id', '__v', 'durationWeeks', 'reviews', 'priceDiscount'].forEach(
        (key) => delete parsedData[key],
      );

      // 确保 guides 是 ID 字符串数组
      if (Array.isArray(parsedData.guides)) {
        parsedData.guides = parsedData.guides.map((g) =>
          typeof g === 'object' && g._id ? g._id : g,
        );
      }

      // 发起 PATCH 请求
      const res = await fetch(`/api/v1/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      if (res.ok) {
        showAlert('success', '✅ Tour updated!');
        setTimeout(() => (window.location.href = '/manage-tours'), 1500);
      } else {
        const errRes = await res.json();
        showAlert('error', errRes.message || 'Update failed!');
      }
    } catch (err) {
      console.error(err);
      showAlert('error', '❌ Invalid JSON format!');
    }
  });

  // 上传封面图按钮
  if (uploadCoverBtn) {
    uploadCoverBtn.addEventListener('click', async function () {
      const file = imageCoverInput.files[0];
      if (!file) return showAlert('error', 'Please select an image!');

      const formData = new FormData();
      formData.append('imageCover', file);
      formData.append('id', tourId);

      try {
        const res = await fetch(`/api/v1/tours/${tourId}`, {
          method: 'PATCH',
          body: formData,
        });

        if (res.ok) {
          showAlert('success', '✅ Cover image updated!');
          setTimeout(() => (window.location.href = '/manage-tours'), 1500);
        } else {
          showAlert('error', '❌ Error uploading cover image!');
        }
      } catch (err) {
        console.error('Upload failed:', err);
        showAlert('error', '❌ Upload failed!');
      }
    });
  }
});
