// Statistiques de visites avec Vercel Web Analytics : anonymes et sans cookies.
// Les chiffres se lisent sur vercel.com, onglet Analytics du projet.
//
// Pour ne pas compter ses propres visites : ouvrir une fois le site avec ?moi à la fin
// de l'adresse, sur chaque appareil et navigateur. ?moi=non recommence à les compter.
(function () {
  try {
    var moi = new URLSearchParams(location.search).get('moi');
    if (moi === 'non') localStorage.removeItem('va-disable');
    else if (moi !== null) localStorage.setItem('va-disable', '1');
  } catch (e) {}

  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.va('beforeSend', function (event) {
    try {
      if (localStorage.getItem('va-disable')) return null;
    } catch (e) {}
    return event;
  });
})();
