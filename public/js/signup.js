// signup.js

const showAlert = (type, msg) => {
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(() => {
    const alert = document.querySelector('.alert');
    if (alert) alert.remove();
  }, 5000);
};

const signup = async (name, email, password, passwordConfirm) => {
  const signupBtn = document.getElementById('signupBtn');
  try {
    // 开启 loading
    signupBtn.textContent = 'Signing up...';
    signupBtn.disabled = true;

    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'Success') {
      showAlert('success', 'Signed up successfully!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Something went wrong!');
  } finally {
    // 关闭 loading
    signupBtn.textContent = 'Sign Up';
    signupBtn.disabled = false;
  }
};

// 挂载 form 监听器
const signupForm = document.getElementById('formSignup');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    await signup(name, email, password, passwordConfirm);
  });
}
