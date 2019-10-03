require('../css/emailform.scss');
const { Modal } = require('bootstrap.native/dist/bootstrap-native-v4');

const contactForm = document.getElementById('formularz-kontaktowy');
const contactFormModal = new Modal(contactForm);
const contactFormResponse = new Modal(document.getElementById('email-form-response'));
const closeContactBtn = document.getElementById('close-contact-btn');
const openContactBtn = document.getElementById('open-contact-btn');
const firstInput = document.querySelector('.form-data:first-child');
const submitBtn = document.querySelector('.emailFormSubmit');

openContactBtn.addEventListener('click', () => {
  firstInput.focus();
});

if (document.location.hash === '#formularz-kontaktowy') {
  openContactBtn.click();
  setTimeout(() => firstInput.focus(), 100);
}

submitBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && !e.shiftKey) {
    e.preventDefault();
    closeContactBtn.focus();
  }
});

closeContactBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && e.shiftKey) {
    e.preventDefault();
    submitBtn.focus();
  }
});

contactForm.addEventListener('submit', () => {
  contactFormModal.hide();
  contactFormResponse.show();
});
