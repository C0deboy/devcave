const promotion = {
  start: new Date('2018-04-15'),
  end: new Date('2018-05-20'),
  number: '4894',
  discount: '2 książki w cenie 1',
  host: 'helion.pl',
  img: true,
  popup: true,
};

const customMessage = '';
const promotionURL = new URL(`http://${promotion.host}/page/9102Q/promocja/${promotion.number}`);

let promotionAdText = `Helion wydał nową książkę Roberta C.Martina, można ją kupić <a href="${promotionURL}" target="_blank">w zestawie</a> ze zniżką do 60%.`;

if (isPromotionActive()) {
  showPromotionAd();

  if (customMessage !== '') {
    promotionAdText = customMessage;
  } else if (promotion.popup && location.pathname !== '/' && localStorage.getItem('ad-closed') !== '1') {
    createPromotionMessagePopup();
  }
}

function isPromotionActive() {
  const currentDate = new Date();

  currentDate.setHours(0, 0, 0, 0);
  promotion.end.setHours(0, 0, 0, 0);
  promotion.start.setHours(0, 0, 0, 0);

  return currentDate >= promotion.start && currentDate <= promotion.end;
}

function createPromotionMessagePopup() {
  const booksBtn = document.querySelector('.books-btn');
  if (booksBtn) {
    const promotionSign = document.createElement('p');
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-ad');
    closeBtn.innerHTML = '<i class="fa fa-times"></i>';
    closeBtn.setAttribute('title', 'Nie pokazuj');
    closeBtn.setAttribute('data-toggle', 'tooltip');
    closeBtn.setAttribute('data-placement', 'right');
    closeBtn.addEventListener('click', () => closeAd(promotionSign));

    promotionSign.innerHTML = promotionAdText;
    promotionSign.classList.add('promotion-sign', 'box-effect');
    promotionSign.appendChild(closeBtn);
    document.body.appendChild(promotionSign);
    positionPromotionSign(booksBtn, promotionSign);
    window.addEventListener('resize', () => positionPromotionSign(booksBtn, promotionSign));
  }
}

function closeAd(ad) {
  localStorage.setItem('ad-closed', '1');
  ad.style.display = 'none';
}

function positionPromotionSign(booksBtn, promotionSign) {
  const booksBtnRect = booksBtn.getBoundingClientRect();
  const left = (booksBtnRect.left - promotionSign.offsetWidth) + +(booksBtnRect.width / 4);

  if (document.documentElement.clientWidth <= 768) {
    promotionSign.style.right = '25px';
  } else {
    promotionSign.style.left = left + 'px';
    promotionSign.style.right = '';
  }
}

function showPromotionAd() {
  const promotionLink = document.querySelector('.promotion-link');
  if (promotionLink) {
    promotionLink.style.display = 'block';
  }
}
