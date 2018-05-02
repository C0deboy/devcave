document.querySelectorAll('.tag-posts').forEach((tagPosts) => {
  tagPosts.classList.toggle('hidden');

  tagPosts.querySelectorAll('li').forEach((li) => {
    li.classList.toggle('invisible');
  });
});

document.querySelectorAll('.site-tag a').forEach((tag) => {
  tag.addEventListener('click', (e) => {
    e.preventDefault();
    const scrollPos = window.scrollY;
    window.location.hash = tag.hash;
    window.scrollTo(0, scrollPos);
    toggleElementVisibility(document.getElementById(tag.hash.substr(1)));
  });
});

let lastTagPosts;

function toggleElementVisibility(tagPosts) {
  if (lastTagPosts) {
    lastTagPosts.classList.toggle('hidden');

    lastTagPosts.querySelectorAll('li').forEach((li) => {
      li.classList.toggle('invisible');
      li.classList.toggle('enter');
    });
  }

  if (tagPosts) {
    tagPosts.classList.toggle('hidden');

    tagPosts.querySelectorAll('li').forEach((li, i) => {
      li.classList.toggle('invisible');
      li.style.animationDelay = (i * 0.1) + 's';
      li.classList.toggle('enter');
    });

    lastTagPosts = tagPosts;
  }
}

toggleElementVisibility(document.getElementById(location.hash.substr(1)));
