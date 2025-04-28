const signup = async (name, email, password, passwordConfirm, photoFile) => {
  const signupBtn = document.getElementById('signupBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.querySelector('.spinner');

  try {
    btnText.textContent = 'Signing up...';
    spinner.classList.remove('hidden');
    signupBtn.disabled = true;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('passwordConfirm', passwordConfirm);
    if (photoFile) formData.append('photo', photoFile);

    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: formData,
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
    btnText.textContent = 'Sign Up';
    spinner.classList.add('hidden');
    signupBtn.disabled = false;
  }
};

// 监听表单提交
const signupForm = document.getElementById('formSignup');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const photo = document.getElementById('photo')?.files[0];

    await signup(name, email, password, passwordConfirm, photo);
  });
}
