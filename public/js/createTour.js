// /* public/js/createTour.js */
// /* eslint-disable */
// (function () {
//   flatpickr('#startDates', {
//     mode: 'multiple',
//     dateFormat: 'Y-m-d',
//   });

//   const form = document.getElementById('form-create');
//   const btn = document.getElementById('btn-create-tour');
//   const coverInput = document.getElementById('imageCover');
//   const imagesInput = document.getElementById('images');
//   const previewCover = document.getElementById('preview-cover');
//   const previewImages = document.querySelector('.preview-images');

//   window.addEventListener('DOMContentLoaded', function () {
//     if (coverInput) {
//       coverInput.addEventListener('change', function (e) {
//         const file = e.target.files[0];
//         if (file) {
//           const reader = new FileReader();
//           reader.onload = function (event) {
//             previewCover.src = event.target.result;
//             previewCover.style.display = 'block';
//           };
//           reader.readAsDataURL(file);
//         }
//       });
//     }

//     if (imagesInput) {
//       imagesInput.addEventListener('change', function (e) {
//         previewImages.innerHTML = '';
//         const files = Array.from(e.target.files);

//         if (files.length !== 3) {
//           showAlert('error', 'You must select exactly 3 images.');
//           imagesInput.value = '';
//           return;
//         }

//         files.forEach((file) => {
//           const reader = new FileReader();
//           reader.onload = function (event) {
//             const img = document.createElement('img');
//             img.src = event.target.result;
//             img.style.width = '100px';
//             img.style.height = '100px';
//             img.style.objectFit = 'cover';
//             previewImages.appendChild(img);
//           };
//           reader.readAsDataURL(file);
//         });
//       });
//     }

//     if (form && btn) {
//       btn.addEventListener('click', async function (e) {
//         e.preventDefault();
//         btn.textContent = 'Creating...';

//         const formData = new FormData(form);

//         // 处理 startDates
//         const startDatesInput = document.getElementById('startDates').value;
//         if (startDatesInput) {
//           formData.delete('startDates');
//           startDatesInput.split(',').forEach((date) => {
//             formData.append('startDates', new Date(date.trim()));
//           });
//         }

//         // 处理 startLocation
//         const latitude = document.getElementById(
//           'startLocationLatitude',
//         )?.value;
//         const longitude = document.getElementById(
//           'startLocationLongitude',
//         )?.value;
//         const description = document.getElementById(
//           'startLocationDescription',
//         )?.value;
//         const address = document.getElementById('startLocationAddress')?.value;

//         if (latitude && longitude) {
//           const startLocation = {
//             type: 'Point',
//             coordinates: [parseFloat(longitude), parseFloat(latitude)], // 注意顺序: 经度,纬度
//             description: description || '',
//             address: address || '',
//           };
//           formData.append('startLocation', JSON.stringify(startLocation));
//         }

//         // 处理 secretTour
//         const secretTourInput = document.getElementById('secretTour')?.value;
//         if (secretTourInput) {
//           formData.set('secretTour', secretTourInput === 'true');
//         }

//         // 处理 guides
//         const guidesInput = document.getElementById('guides')?.value;
//         if (guidesInput) {
//           const guidesArray = guidesInput.split(',').map((id) => id.trim());
//           formData.delete('guides');
//           guidesArray.forEach((guide) => {
//             formData.append('guides', guide);
//           });
//         }

//         try {
//           const xhr = new XMLHttpRequest();
//           xhr.open('POST', '/submit-tour-data');

//           xhr.onload = function () {
//             if (xhr.status === 201 || xhr.status === 200) {
//               showAlert('success', 'Tour created successfully!');
//               setTimeout(() => {
//                 window.location.href = '/manage-tours';
//               }, 1500);
//             } else {
//               console.error(xhr.responseText);
//               showAlert('error', 'Something went wrong!');
//             }
//           };

//           xhr.onerror = function () {
//             console.error('XHR upload failed');
//             showAlert('error', 'Upload failed!');
//           };

//           xhr.send(formData);
//         } catch (err) {
//           console.error(err);
//           showAlert('error', 'Error uploading!');
//         }
//       });
//     }
//   });
// })();
const generateBtn = document.getElementById('btn-generate-json');
const jsonTextarea = document.getElementById('jsonData');
const dayGapInput = document.getElementById('dayGap');

if (generateBtn && jsonTextarea) {
  generateBtn.addEventListener('click', function () {
    // 默认天数gap
    const defaultGap = 30;
    const gap = parseInt(dayGapInput?.value) || defaultGap;

    const today = new Date();
    const startDates = [
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + gap,
      ).toISOString(),
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + gap + 30,
      ).toISOString(),
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + gap + 60,
      ).toISOString(),
    ];

    // 随机名字生成器
    const adjectives = ['Majestic', 'Hidden', 'Mysterious', 'Grand', 'Epic'];
    const nouns = ['Explorer', 'Adventure', 'Journey', 'Voyager', 'Odyssey'];
    const randomName =
      adjectives[Math.floor(Math.random() * adjectives.length)] +
      ' ' +
      nouns[Math.floor(Math.random() * nouns.length)];

    const sampleJSON = {
      name: randomName,
      duration: 7,
      maxGroupSize: 10,
      difficulty: 'easy',
      price: 500,
      priceDiscount: 450,
      summary: 'Short summary of the tour',
      description: 'Detailed description of the tour',
      startDates: startDates,
      startLocation: {
        description: 'City Center',
        type: 'Point',
        coordinates: [-0.1276, 51.5072],
        address: 'London, UK',
      },
      locations: [
        {
          description: 'First Stop',
          type: 'Point',
          coordinates: [-0.1276, 51.5072],
          day: 1,
        },
        {
          description: 'Second Stop',
          type: 'Point',
          coordinates: [-0.0877, 51.5072],
          day: 2,
        },
      ],
      guides: ['5c8a1f4e2f8fb814b56fa185', '5c8a1f292f8fb814b56fa184'],
      secretTour: false,
    };

    jsonTextarea.value = JSON.stringify(sampleJSON, null, 2);
  });
}

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

      // 解析JSON区域
      const jsonData = document.getElementById('jsonData')?.value;

      if (!jsonData) {
        showAlert('error', 'Please paste your JSON tour data!');
        btn.textContent = 'Create Tour';
        return;
      }

      try {
        const parsedData = JSON.parse(jsonData);

        // 把JSON字段动态追加到 FormData
        for (const key in parsedData) {
          if (typeof parsedData[key] === 'object') {
            // 无论是数组还是对象，统一 JSON.stringify
            formData.append(key, JSON.stringify(parsedData[key]));
          } else {
            formData.append(key, parsedData[key]);
          }
        }

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
        showAlert('error', 'Invalid JSON or upload failed!');
        btn.textContent = 'Create Tour';
      }
    });
  }
})();
