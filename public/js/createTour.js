/* public/js/createTour.js */
/* eslint-disable */
(function () {
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

        if (files.length !== 3) {
          showAlert('error', 'You must select exactly 3 images.');
          imagesInput.value = '';
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

        // 处理 startDates
        const startDatesInput = document.getElementById('startDates').value;
        if (startDatesInput) {
          formData.delete('startDates');
          startDatesInput.split(',').forEach((date) => {
            formData.append('startDates', new Date(date.trim()));
          });
        }

        // 处理 startLocation
        const latitude = document.getElementById(
          'startLocationLatitude',
        )?.value;
        const longitude = document.getElementById(
          'startLocationLongitude',
        )?.value;
        const description = document.getElementById(
          'startLocationDescription',
        )?.value;
        const address = document.getElementById('startLocationAddress')?.value;

        if (latitude && longitude) {
          const startLocation = {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)], // 注意顺序: 经度,纬度
            description: description || '',
            address: address || '',
          };
          formData.append('startLocation', JSON.stringify(startLocation));
        }

        // 处理 secretTour
        const secretTourInput = document.getElementById('secretTour')?.value;
        if (secretTourInput) {
          formData.set('secretTour', secretTourInput === 'true');
        }

        // 处理 guides
        const guidesInput = document.getElementById('guides')?.value;
        if (guidesInput) {
          const guidesArray = guidesInput.split(',').map((id) => id.trim());
          formData.delete('guides');
          guidesArray.forEach((guide) => {
            formData.append('guides', guide);
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
})();
