/* eslint-disable */
document.addEventListener('DOMContentLoaded', async function () {
  const jsonTextarea = document.getElementById('jsonData');
  const updateBtn = document.getElementById('btn-update-tour');

  // 1. 获取当前Tour ID，从URL中提取
  const tourId = window.location.pathname.split('/').pop();

  try {
    const res = await fetch(`/api/v1/tours/${tourId}`);
    const data = await res.json();

    if (data.status === 'success') {
      // 填充现有Tour数据
      jsonTextarea.value = JSON.stringify(data.data.data, null, 2);
    } else {
      console.error('Error fetching tour data');
    }
  } catch (err) {
    console.error('Fetch error', err);
  }

  // 2. 点击更新按钮时
  updateBtn.addEventListener('click', async function () {
    const jsonData = jsonTextarea.value;

    try {
      const parsedData = JSON.parse(jsonData); // 确保是合法JSON
      const res = await fetch(`/api/v1/tours/${tourId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      if (res.ok) {
        alert('Tour updated successfully!');
        window.location.href = '/manage-tours';
      } else {
        alert('Error updating tour!');
      }
    } catch (err) {
      console.error(err);
      alert('Invalid JSON data!');
    }
  });
});
