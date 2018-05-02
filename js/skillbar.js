import '../node_modules/waypoints/lib/noframework.waypoints.min';

const skillbars = document.querySelectorAll('.skillbar');

skillbars.forEach((skillbar) => {

  const pctCountEl = skillbar.querySelector('span');
  skillbar.percentage = parseInt(pctCountEl.innerText);
  pctCountEl.innerText = '0%';

  const skillbarProgress = skillbar.querySelector('.skillbar-progress');
  skillbarProgress.style.width = 0;
  const waypoint = new Waypoint({
    element: skillbar,
    handler() {
      makeProgressBar(skillbar);
      this.destroy();
    },
    offset: '80%',
  });

  skillbarProgress.classList.add('transition');
});

function makeProgressBar(skillbar) {
  const pctCountEl = skillbar.querySelector('span');
  let i = 0;
  const countingPct = setInterval(() => {
    pctCountEl.innerText = i + '%';
    if (i === skillbar.percentage) {
      clearInterval(countingPct);
    }
    i++;
  }, 20);

  const progressBar = skillbar.querySelector('.skillbar-progress');
  progressBar.style.width = (skillbar.clientWidth - 130) * (skillbar.percentage * 0.01) + 'px';
}
