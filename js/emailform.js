require('../css/emailform.scss');

const customErrors = {
  tooShort: (fieldName, min) => 'Pole ' + fieldName + ' musi zawierać co najmniej ' + min + ' znaki.',
  tooLong: (fieldName, max) => 'Pole ' + fieldName + ' może zawierać co najwyżej ' + max + ' znaków.',
  empty: fieldName => 'Pole ' + fieldName + ' nie może być puste.',
  type: fieldName => 'Pole ' + fieldName + ' jest niepoprawne.',
  errorsInForm: 'W formularzu występują błędy.',
  cannotSend: 'Nie udało się wysłać wiadomości.',
  recaptcha: 'Potwierdź, że nie jesteś robotem.',
};

const formDataElements = {};

const inputs = document.querySelectorAll('.form-data');

inputs.forEach((el) => {
  formDataElements[el.getAttribute('name')] = el;
});

const recaptcha = document.querySelector('.g-recaptcha');
const formAlert = document.querySelector('.emailFormAlert');
const closeContactBtn = document.getElementById('close-contact-btn');
const openContactBtn = document.getElementById('open-contact-btn');
const firstInput = document.querySelector('.form-data:first-child');

openContactBtn.addEventListener('click', () => {
  firstInput.focus();
});

if (document.location.hash === '#formularz-kontaktowy') {
  openContactBtn.click();
  setTimeout(() => firstInput.focus(), 100);
}

const submitBtn = document.querySelector('.emailFormSubmit');

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

submitBtn.addEventListener('click', (event) => {
  formAlert.innerHTML = '<i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>';
  event.preventDefault();

  const isValid = validateEmailForm();

  if (isValid === true) {
    const formData = {
      'g-recaptcha-response': grecaptcha.getResponse(),
    };


    for (const el in formDataElements) {
      formData[el] = formDataElements[el].value;
    }

    const xhr = new XMLHttpRequest();

    xhr.open('POST', document.querySelector('.emailForm').getAttribute('action'));
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, /; q=0.01');

    xhr.onerror = () => {
      console.log(xhr);
      formAlert.innerHTML = customErrors.cannotSend;
    };

    xhr.onload = () => {
      if(xhr.status === 200) {
        formAlert.innerHTML = 'Wysłano! Dzięki za wiadomość!';
        grecaptcha.reset();
      }
      else {
        console.log(xhr);
        formAlert.innerHTML = customErrors.cannotSend;
      }
    };

    xhr.send(transformObjectToUrlEncoded(formData));
  } else {
    formAlert.innerHTML = customErrors.errorsInForm;
  }
});

function transformObjectToUrlEncoded(obj) {
  const str = [];
  for (const p in obj) {
    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
  }
  return str.join('&');
}

function validateEmailForm() {
  let valid = true;
  for (const el in formDataElements) {
    const fieldName = formDataElements[el].parentElement.innerText;

    if (formDataElements[el].validity.valueMissing === true) {
      markWrongInput(formDataElements[el], customErrors.empty(fieldName.toLowerCase()));
    } else if (formDataElements[el].validity.tooShort === true) {
      const min = formDataElements[el].getAttribute('minlength');
      markWrongInput(formDataElements[el], customErrors.tooShort(fieldName.toLowerCase(), min));
    } else if (formDataElements[el].validity.tooLong === true) {
      const max = formDataElements[el].getAttribute('maxlength');
      markWrongInput(formDataElements[el], customErrors.tooLong(fieldName.toLowerCase(), max));
    } else if (formDataElements[el].validity.typeMismatch === true) {
      markWrongInput(formDataElements[el], customErrors.type(fieldName.toLowerCase()));
    }
    if (formDataElements[el].validity.valid === false) {
      valid = false;
    }
  }
  if (grecaptcha.getResponse().length === 0) {
    markWrongInput(recaptcha, customErrors.recaptcha);
    valid = false;
  }
  return valid;
}

function markWrongInput(wrongElement, alert) {
  if (wrongElement.classList.contains('wrongInput')) {
    return;
  }

  const errorMessageEl = document.createElement('p');
  errorMessageEl.classList.add('error');
  errorMessageEl.classList.add('wrongInput');
  errorMessageEl.textContent = alert;

  wrongElement.parentElement.append(errorMessageEl);
  wrongElement.classList.add('wrongInput');
  wrongElement.addEventListener('focus', clearErrors);
}

function clearErrors() {
  this.classList.remove('wrongInput');
  this.parentElement.removeChild(this.parentElement.getElementsByClassName('error')[0]);
  formAlert.innerHTML = '';
}

window.recaptchaClearErr = () => {
  document.querySelector('.g-recaptcha').focus();
};


function RecaptchaClearMsg() {
  document.querySelector('.g-recaptcha').focus();
}

