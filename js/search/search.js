
class JekyllSearch {
  constructor(dataSource, searchField, resultsList) {
    this.dataSource = dataSource;
    this.searchField = document.querySelector(searchField);
    this.resultsList = document.querySelector(resultsList);

    this.displayResults = this.displayResults.bind(this);
  }

  fetchedData() {
    return fetch(this.dataSource)
      .then(blob => blob.json());
  }

  async findResults() {
    this.resultsList.innerHTML = '<i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>';
    const inputValue = this.searchField.value.trim();
    const allWordsRegex = new RegExp('.*(' + inputValue.replace(/\s/g, ').*(') + ').*', 'i');
    const anyWordRegex = new RegExp('(^|\\s)' + inputValue.replace(/\s\w{1,2}\s/g, ' ')
      .replace(/\s/g, ' | ') + '(\\s|$)', 'i');

    const data = await this.fetchedData();

    const results = data.filter((item) => {
      const searchIn = escapePolishLetters(item.title + ' ' + item.subtitle);
      return searchIn.match(allWordsRegex);
    });

    if (results.length > 0) {
      return results;
    } else {
      return data.filter((item) => {
        const searchIn = escapePolishLetters(item.title + ' ' + item.subtitle);
        if (searchIn.match(anyWordRegex)) {
          console.log(searchIn);
          return true;
        }
        return searchIn.match(anyWordRegex);
      });
    }
  }

  async displayResults() {
    const results = await this.findResults();
    const html = results.map(item =>
      `<li class="result">
            <div class="post-preview">
              <a href="${item.url}">
                <h2 class="post-title">${item.title}</h2>
                <h3 class="post-subtitle">${item.subtitle}</h3>
              </a>
      
              <p class="post-meta">${item.date}</p>
            </div>
        </li>`)
      .join('');
    if ((results.length === 0) || (this.searchField.value === '')) {
      this.resultsList.innerHTML = '<p>Nic nie znaleziono</p>';
    } else {
      this.resultsList.innerHTML = html;
    }
  }

  init() {
    this.searchField.addEventListener('keyup', this.displayResults);
    this.searchField.addEventListener('keypress', (event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
      }
    });
  }

  getUrlSearchQuery() {
    let searchQuery = getQueryVariable('szukaj');

    if (getQueryVariable('nowadomena') !== undefined) {
      const newDomainMessage = document.createElement('p');
      newDomainMessage.innerText = 'Blog został przeniesiony na nową domenę. Czy szukałeś tego?:';
      newDomainMessage.classList.add('not-found-msg');
      this.resultsList.parentElement.insertBefore(newDomainMessage, this.resultsList);

      searchQuery = searchQuery.replace(/\d/g, '')
        .substr(searchQuery.lastIndexOf('/') + 1);
    }

    if (searchQuery !== undefined) {
      this.searchField.value = searchQuery.replace(/[/\-_]/g, ' ');
      this.displayResults();
    } else if (window.location.pathname !== '/archiwum/') {
      const href = window.location.href;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', href, true);
      xhr.onload = (e) => {
        if (xhr.status === 404) {
          const link = href.endsWith('/') ? href.substring(0, href.length - 1) : href;
          const searchedPost = link.substr(link.lastIndexOf('/') + 1);
          this.searchField.value = searchedPost.replace(/-/g, ' ');
          this.displayResults();
        }
      };
      xhr.send();
    }
  }
}

function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');

  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');

    if (pair[0] === variable) {
      return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
    }
  }
}

function escapePolishLetters(word) {
  const polishChars = 'ąćęłńóśźż';
  const normalizedChars = 'acelnoszz';
  const charsRegExmp = new RegExp('[' + polishChars + ']', 'g');
  const transl = {};

  const lookup = (m) => {
    return transl[m] || m;
  };

  for (let i = 0; i < polishChars.length; i++) {
    transl[polishChars[i]] = normalizedChars[i];
  }

  return word.replace(charsRegExmp, lookup);
}

const search = new JekyllSearch(
  '/dist/js/search/search.json',
  '.search-value',
  '.search-results',
);

search.init();

search.getUrlSearchQuery();
