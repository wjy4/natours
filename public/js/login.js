/* eslint-disable */
// import axios from 'axios';
// import { alerts } from './alerts';

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
      withCredentials: true,
    });
    console.log(res);

    if (res.data.status === 'Success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/'); // 强制从服务器重新加载页面
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    // alert(err.response.data.message);
  }
};
const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    if (res.data.status === 'Success') location.assign('/');
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

// document.querySelector('.form').addEventListener('submit', (e) => {
//   e.preventDefault();
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   login(email, password);
// });
const form = document.querySelector('.form--login');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);
  });
}

const logOutBtn = document.querySelector('.nav__el--logout');
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
