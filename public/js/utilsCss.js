document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.header__burger');
  const navToggles = document.querySelectorAll('.nav');

  burger.addEventListener('click', () => {
    navToggles.forEach((nav) => nav.classList.toggle('active'));
  });
});

const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.style.display = 'block';
  } else {
    backToTop.style.display = 'none';
  }
});
