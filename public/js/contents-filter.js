(function() {
  var chipContainer = document.querySelector('.cat-chips');
  var sections = document.querySelectorAll('.cat-section');
  if (!chipContainer || !sections.length) return;

  var chips = chipContainer.querySelectorAll('.chip');
  var allChip = chipContainer.querySelector('.chip[data-slug="all"]');

  function getActiveSlugs() {
    var slugs = [];
    chips.forEach(function(chip) {
      if (chip.classList.contains('active') && chip.dataset.slug !== 'all') {
        slugs.push(chip.dataset.slug);
      }
    });
    return slugs;
  }

  function applyFilter() {
    var slugs = getActiveSlugs();
    if (slugs.length === 0) {
      sections.forEach(function(s) { s.classList.remove('hidden'); });
      return;
    }
    sections.forEach(function(s) {
      var slug = s.getAttribute('data-slug');
      var visible = slugs.indexOf(slug) !== -1;
      s.classList.toggle('hidden', !visible);
    });
  }

  function setAllActive() {
    chips.forEach(function(chip) {
      chip.classList.remove('active');
      chip.setAttribute('aria-pressed','false');
    });
    if (allChip) {
      allChip.classList.add('active');
      allChip.setAttribute('aria-pressed','true');
    }
  }

  chipContainer.addEventListener('click', function(e) {
    var a = e.target.closest('.chip');
    if (!a) return;
    e.preventDefault();

    var slug = a.dataset.slug;
    if (slug === 'all') {
      setAllActive();
      applyFilter();
      return;
    }

    // toggle specific chip
    var nowActive = !a.classList.contains('active');
    a.classList.toggle('active', nowActive);
    a.setAttribute('aria-pressed', nowActive ? 'true' : 'false');

    // if any specific active, remove 'all'; else restore 'all'
    var anySpecificActive = Array.from(chips).some(function(chip) {
      return chip.classList.contains('active') && chip.dataset.slug !== 'all';
    });
    if (allChip) {
      if (anySpecificActive) {
        allChip.classList.remove('active');
        allChip.setAttribute('aria-pressed','false');
      } else {
        allChip.classList.add('active');
        allChip.setAttribute('aria-pressed','true');
      }
    }

    applyFilter();
  });

  // optional: keyboard accessibility
  chipContainer.addEventListener('keydown', function(e) {
    var a = e.target.closest('.chip');
    if (!a) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      a.click();
    }
  });

  // initial sync (in case markup state drifts)
  applyFilter();
})();