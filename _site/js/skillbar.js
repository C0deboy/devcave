(() => {
  const skillbars = document.querySelectorAll('.skillbar');

  skillbars.forEach((skillbar) => {
    const waypoint = new Waypoint({
      element: skillbar,
      handler() {
        makeProgressBar(skillbar);
        this.destroy();
      },
      offset: '80%',
    });
  });

  function makeProgressBar(skillbar) {
    const percentage = skillbar.getAttribute('data-pct');
    const pctCountEl = document.createElement('span');
    let i = 0;
    const countingPct = setInterval(() => {
      pctCountEl.innerText = i+'%';
      if (i === parseInt(percentage)) {
        clearInterval(countingPct);
      }
      i++;
    }, 20);

    const progressBar = document.createElement('div');
    progressBar.classList.add('skillbar-progress');

    skillbar.appendChild(progressBar);
    progressBar.style.width = 'calc(' + percentage + ' - ' + progressBar.previousElementSibling.clientWidth + 'px)';
    progressBar.style.backgroundColor = progressBar.previousElementSibling.style.backgroundColor;

    skillbar.appendChild(pctCountEl);
  }
})();
