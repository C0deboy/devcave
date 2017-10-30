class jekyllSearch {
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
    const data = await this.fetchedData();
    return data.filter((item) => {
      const inputValue = this.searchField.value.trim().replace(/\s/g, ' | ');
      const regex = new RegExp(inputValue, 'gi');
      if (item.titleSEO) {
        return item.title.match(regex) || item.subtitle.match(regex) || item.titleSEO.match(regex);
      }
      return item.title.match(regex) || item.subtitle.match(regex);
    });
  }

  async displayResults() {
    const results = await this.findResults();
    const html = results.map(item => `
        <li class="result">
            <article class="result__article  article">
                <div class="post-preview">
                  <a href="${item.url}">
                    <h2 class="post-title">${item.title}</h2>
                    <h3 class="post-subtitle">${item.subtitle}</h3>
                  </a>
          
                  <p class="post-meta">${item.date}</p>
                </div>
            </article>
            
            <hr>
        </li>`).join('');
    if ((results.length === 0) || (this.searchField.value === '')) {
      this.resultsList.innerHTML = '<p>Nic nie znaleziono</p>';
    } else {
      this.resultsList.innerHTML = html;
    }
  }

  init() {
    this.searchField.addEventListener('keyup', this.displayResults);
    this.searchField.addEventListener('keypress', (event) => {
      if (event.keyCode == 13) {
        event.preventDefault();
      }
    });
  }

  getUrlSearchQuery() {
    const searchQuery = getQueryVariable('szukaj');

    if (getQueryVariable('nowadomena') !== undefined) {

      const newDomainMessage = document.createElement('p');
      newDomainMessage.innerText = 'Blog został przeniesiony na nową domenę. Czy szukałeś: ?';
      newDomainMessage.classList.add('new-domain-msg');
      this.resultsList.parentElement.insertBefore(newDomainMessage, this.resultsList);

      searchQuery.replace(/\d/g, '');
    }

    if (searchQuery !== undefined) {
      this.searchField.value = searchQuery.split(/[/\-_]/).filter(str => str.match(/\w{3,}/)).join(' ');
      this.displayResults();
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
