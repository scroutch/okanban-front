
// on objet qui contient des fonctions
var app = {

  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    console.log('app.init !');
    app.addListenertoActions();
  },

  addListenertoActions: () => {
    /** Ouverture de la modale "ajouter une liste" */
    //1. cibler (récupérer, capturer...) le bouton "ajouter une liste"
    //2. ajouter un eventListener => showAddListModal
    document.getElementById('addListButton').addEventListener('click', app.showAddListModal);
    
    /** Fermeture des modales */
    //1. cibler LES boutons "close" (getElementsByClassName  OU  querySelectorAll)
    //2. ajouter un eventListener SUR CHAQUE bouton => hideModals
    // var hideModalvar template = documentsButtons = document.getElementsByClassName('close');
    var hideModalsButtons = document.querySelectorAll('.close');
    for (var button of hideModalsButtons) {
      button.addEventListener('click', app.hideModals);
    }

    /** Soumission du formulaire "ajouter une liste" */
    // on cible le formulaire et on écoute l'event submit => app.handleAddListForm
    document.querySelector('#addListModal form').addEventListener('submit', app.handleAddListForm);
  
    /** Boutons "+" : ajouter une carte */
    const addCardButtons = document.querySelectorAll('.add-card-btn');
    for (let button of addCardButtons) {
      button.addEventListener('click', app.showAddCardModal);
    }

    /** Soumission du formulaire "ajouter une carte" */
    document.querySelector('#addCardModal form').addEventListener('submit', app.handleAddCardForm);
  },

  showAddListModal: () => {
    //cibler la modal
    //ajouter une class css pour l'afficher
    document.getElementById('addListModal').classList.add('is-active');
  },

  showAddCardModal: (event) => {
    // récupérer l'id de la liste ciblée
    const listElement = event.target.closest('.panel');
    const listId = listElement.getAttribute('list-id');
    // insérer dans l'input, dans le formulaire, dans la modal "addCardModal"
    document.querySelector('#addCardModal input[name="list_id"]').value = listId;
    // afficher la modale "addCardModal"
    document.getElementById('addCardModal').classList.add('is-active');
  },

  hideModals: () => {
    //on cible TOUTES les modales, 
    var allModals = document.querySelectorAll('.modal');
    // et enlever la classe css "is-active" sur CHACUNE des modales
    for (var modal of allModals){
      modal.classList.remove('is-active');
    }

    /** Version alternative avec forEach */
    // allModals.forEach( (modal) => {
    //   modal.classList.remove('is-active');
    // });
  },

  /** Méthode pour capturer le submit du formulaire "ajouter une liste" */
  handleAddListForm: (event) => {
    event.preventDefault(); // on empêche la page de se recharger !

    //1. récupérer les valeurs du formulaire
    var formData = new FormData( event.target );
    //2. envoie ces valeurs à app.makeListInDOM pour créer une liste
    app.makeListInDOM( formData.get('name') );
    //3. fermer la modale
    app.hideModals();
  },

  /** Méthode pour capturer le "submit" du formulaire "ajouter une carte" */
  handleAddCardForm: (event) => {
    event.preventDefault(); // on empêche la page de se recharger !
    //1. récupérer les valeurs du formulaire
    var formData = new FormData( event.target );
    //2. passer ces valeurs à app.makeCardInDOM pour créer une carte
    app.makeCardInDOM( formData.get('title'), formData.get('list_id') );
    //3. fermer la modale
    app.hideModals();
  },

  /** Méthode pour créer une liste et l'ajouter au DOM */
  makeListInDOM: (listTitle) => {
    //1. récupérer le template
    const template = document.getElementById('listTemplate');
    //2. cloner le template => on récupère un element HTML "nouvelleListe"
    let newList = document.importNode(template.content, true);
    //3. mettre à jour le nom de la liste.
    newList.querySelector('h2').textContent = listTitle;

    //3bis. ajouter des eventListener sur les éléments de la nouvelle liste !
    newList.querySelector('.add-card-btn').addEventListener('click', app.showAddCardModal);

    //4. ajouter "nouvelleListe" au DOM, au bon endroit.
    // - 4.1 cibler "la colonne avec des boutons"
    // - 4.2 ajouter nouvelle liste juste avant "la colonne avec des boutons"
    document.getElementById('buttonsColumn').before(newList);
  },

  /** Méthode pour créer une carte et l'ajouter dans la bonne liste */
  makeCardInDOM: (cardTitle, listId) => {
    //1. récupérer le template
    const template = document.getElementById('cardTemplate');
    //2. cloner le template
    let newCard = document.importNode(template.content, true);
    //3. mettre à jour le titre de la carte
    newCard.querySelector('.card-title').textContent = cardTitle;
    //4. ajouter la nouvelle carte dans la bonne liste
    document.querySelector(`[list-id="${listId}"] .panel-block`).appendChild(newCard);
  }

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );