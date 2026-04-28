$(document).ready(function() {
  const tpData = {
    1: {
      1: [
        { title: "TP VM", description: "Installations d'une VM", pdf: "tps/1y/bloc3/TP 3 Windows 10.pdf" },
        { title: "TP CMD", description: "Exploration de l'invite de commande </br> - cd </br> - mkdir </br> - echo </br> - ...", pdf: "tps/1y/bloc3/TP 4 Windows.pdf" },
        { title: "TP Powershell", description: "Exploration de Windows Powershell </br> - Ouvrir une session </br> - Création d'une arborescence </br> - Manipulations </br> - ...", pdf: "tps/1y/bloc3/TP 5 Powershell.pdf" },
        { title: "TP .bat", description: "Découverte des scripts batch </br> - Exploration systèmes de fichiers </br> - Gestion processus et services </br> - Diagnostic réseau </br> - ...", pdf: "tps/1y/bloc3/TP_42 Commandes CMD bat.pdf" } 
      ],
      2: [
      
      ],
      3: [
        
      ]
    },
    2: {
      1: [
        
      ],
      2: [
        
      ],
      3: [
        
      ]
    }
  };

  let currentYear = 1;
  let currentBloc = 1;

  function renderTPs() {
    const tps = tpData[currentYear][currentBloc] || [];
    const container = $('#tp-container');
    
    if (tps.length === 0) {
      container.html('<div class="empty-state"><p>Aucun TP disponible pour cette sélection</p></div>');
      return;
    }

    let html = '<div class="tp-list">';
    tps.forEach(tp => {
      html += `
        <div class="tp-card">
          <h3>${tp.title}</h3>
          <p>${tp.description}</p>
          <button class="tp-card-link open-pdf" data-pdf="${tp.pdf}" data-title="${tp.title}">Voir le TP</button>
        </div>
      `;
    });
    html += '</div>';
    container.html(html);

    // Attacher les événements aux nouveaux boutons
    attachPdfListeners();
  }

  function attachPdfListeners() {
    $('.open-pdf').click(function() {
      const pdfPath = $(this).data('pdf');
      const title = $(this).data('title');
      openPdfModal(pdfPath, title);
    });
  }

  function openPdfModal(pdfPath, title) {
    $('#modalTitle').text(title);
    $('#pdfViewer').attr('src', pdfPath);
    $('#pdfModal').addClass('active');
  }

  // Fermer la modal
  $('#closeModal').click(function() {
    $('#pdfModal').removeClass('active');
    $('#pdfViewer').attr('src', '');
  });

  // Fermer la modal en cliquant en dehors
  $('#pdfModal').click(function(e) {
    if (e.target === this) {
      $('#pdfModal').removeClass('active');
      $('#pdfViewer').attr('src', '');
    }
  });

  // Fermer la modal avec la touche Échap
  $(document).keydown(function(e) {
    if (e.key === 'Escape') {
      $('#pdfModal').removeClass('active');
      $('#pdfViewer').attr('src', '');
    }
  });

  // Gestion des clics sur les années
  $('.year-btn').click(function() {
    $('.year-btn').removeClass('active');
    $(this).addClass('active');
    currentYear = $(this).data('year');
    renderTPs();
  });

  // Gestion des clics sur les blocs
  $('.bloc-btn').click(function() {
    $('.bloc-btn').removeClass('active');
    $(this).addClass('active');
    currentBloc = $(this).data('bloc');
    renderTPs();
  });

  // Affichage initial
  renderTPs();
});