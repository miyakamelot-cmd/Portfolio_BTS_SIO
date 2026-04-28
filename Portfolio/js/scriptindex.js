$(document).ready(function() {
    const slides = $('.slides');
    const navButtons = $('.slides-buttons button:not(.nav-arrow)'); 
    const leftArrow = $('.left-arrow');
    const rightArrow = $('.right-arrow');
    const totalSlides = slides.length;

    function showSlide(index) {
      slides.removeClass('active');
      navButtons.removeClass('active');
      $('#slides-' + index).addClass('active');
      navButtons.filter('[data-slides="' + index + '"]').addClass('active');
    }

    // Initialisation : afficher la première slide
    showSlide(0);

    // Navigation via les petits boutons ronds
    navButtons.click(function() {
      const index = $(this).data('slides');
      showSlide(index);
    });

    // Navigation via la flèche droite
    rightArrow.click(function() {
      let currentIndex = navButtons.filter('.active').data('slides');
      let nextIndex = currentIndex + 1;
      if (nextIndex >= totalSlides) { // Si on est à la dernière slide, revenir à la première
        nextIndex = 0;
      }
      showSlide(nextIndex);
    });

    // Navigation via la flèche gauche
    leftArrow.click(function() {
      let currentIndex = navButtons.filter('.active').data('slides');
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) { // Si on est à la première slide, aller à la dernière
        prevIndex = totalSlides - 1;
      }
      showSlide(prevIndex);
    });

    // Navigation clavier (flèches gauche/droite)
    $(document).keydown(function(e) {
      let currentIndex = navButtons.filter('.active').data('slides');
      if (e.key === "ArrowRight") {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= totalSlides) {
          nextIndex = 0; 
        }
        showSlide(nextIndex);
        e.preventDefault(); 
      } else if (e.key === "ArrowLeft") {
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          prevIndex = totalSlides - 1; 
        }
        showSlide(prevIndex);
        e.preventDefault();
      }
    });
});