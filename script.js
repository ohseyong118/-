const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

function submitForm(event){
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  alert(`${data.get('name')}님, 입력하신 상담 내용을 확인했습니다.\n실제 운영 시 전화 연결 또는 네이버 폼 링크를 연결해 주세요.`);
  return false;
}
