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
    const percentage = parseInt(skillbar.getAttribute('data-pct'));
    const pctCountEl = document.createElement('span');
    let i = 0;
    const countingPct = setInterval(() => {
      pctCountEl.innerText = i + '%';
      if (i === percentage) {
        clearInterval(countingPct);
      }
      i++;
    }, 20);

    const progressBar = document.createElement('div');
    progressBar.classList.add('skillbar-progress');

    skillbar.appendChild(progressBar);
    progressBar.style.width = (skillbar.clientWidth - 130) * (percentage * 0.01)  + 'px';
    progressBar.style.backgroundColor = progressBar.previousElementSibling.style.backgroundColor;

    skillbar.appendChild(pctCountEl);
  }
})();
