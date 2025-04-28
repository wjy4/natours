/* public/js/createTour.js */
/* eslint-disable */
(function () {
  // 初始化 flatpickr
  flatpickr('#startDates', {
    mode: 'multiple',
    dateFormat: 'Y-m-d',
  });

  const form = document.getElementById('form-create');
  const btn = document.getElementById('btn-create-tour');
  const coverInput = document.getElementById('imageCover');
  const imagesInput = document.getElementById('images');
  const previewCover = document.getElementById('preview-cover');
  const previewImages = document.querySelector('.preview-images');

  window.addEventListener('DOMContentLoaded', function () {
    if (coverInput) {
      coverInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (event) {
            previewCover.src = event.target.result;
            previewCover.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (imagesInput) {
      imagesInput.addEventListener('change', function (e) {
        previewImages.innerHTML = '';
        const files = Array.from(e.target.files);

        // 限制最多只能选择 3 张图片
        if (files.length !== 3) {
          showAlert('error', 'You must select exactly 3 images.');
          imagesInput.value = ''; // 重置 input
          return;
        }

        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = function (event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            previewImages.appendChild(img);
          };
          reader.readAsDataURL(file);
        });
      });
    }

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
    }
  });

  // 自动绑定自定义上传按钮
  // document.querySelectorAll('.custom-file-upload').forEach((label) => {
  //   const input = label.querySelector('input');
  //   label.addEventListener('click', () => {
  //     input.click();
  //   });
  // });
})();
