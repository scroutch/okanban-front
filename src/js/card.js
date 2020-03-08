const utilsModule = require('./utils');

const cardModule = {
  base_url: '',

  // créer une carte dans le DOM
  showAddCardModal: (event) => {
    // récupérer l'id de la liste ciblée
    const listElement = event.target.closest('.panel');
    const listId = listElement.getAttribute('list-id');
    // insérer dans l'input, dans le formulaire, dans la modal "addCardModal"
    document.querySelector('#addCardModal input[name="list_id"]').value = listId;
    // afficher la modale "addCardModal"
    document.getElementById('addCardModal').classList.add('is-active');
  },

  /** Méthode pour créer une carte et l'ajouter dans la bonne liste */
  makeCardInDOM: (cardTitle, listId, cardId, cardColor) => {
    //1. récupérer le template
    const template = document.getElementById('cardTemplate');
    //2. cloner le template
    let newCard = document.importNode(template.content, true);
    //3. mettre à jour le titre de la carte
    newCard.querySelector('.card-title').textContent = cardTitle;

    // 3bis. Modifier aussi l'id de la carte, et son bgColor
    newCard.querySelector('.box').setAttribute('card-id', cardId);
    newCard.querySelector('.box').style.backgroundColor = cardColor;

    // 3ter. Rajouter des interactions !
    // - clic sur le stylo => modifier la carte
    newCard.querySelector('.edit-card-btn').addEventListener('click', cardModule.showEditCardModal);
    // - clic sur la poubelle => supprimer la carte
    newCard.querySelector('.delete-card-btn').addEventListener('click', cardModule.handleDeleteCard);

    //4. ajouter la nouvelle carte dans la bonne liste
    document.querySelector(`[list-id="${listId}"] .panel-block`).appendChild(newCard);
  },

  /** Méthode pour capturer le "submit" du formulaire "ajouter une carte" */
  handleAddCardForm: async (event) => {
    try {
      event.preventDefault(); // on empêche la page de se recharger !
      //1. récupérer les valeurs du formulaire
      var formData = new FormData( event.target );

      //2. envoyer les infos à l'API, et attendre une réponse
      let response = await fetch( cardModule.base_url+'/card', {
        method: "POST",
        body: formData
      });
      if( !response.ok) {
        return alert('Impossible de créer la carte !');
      }
      let newCard = await response.json();

      //3. utiliser la réponse pour créer la carte dans le DOM
      cardModule.makeCardInDOM( newCard.title, newCard.list_id, newCard.id, newCard.color );
      //4. fermer la modale
      utilsModule.hideModals();
    } catch (error) {
      console.log(error);
      alert('Impossible de créer la carte !');
    }
  },

  // modifier une carte
  showEditCardModal: (event) => {
    // event.target représente l'icone stylo
    const cardElement = event.target.closest('.box');
    // 1. récupérer quelques infos sur la carte
    const cardId = cardElement.getAttribute('card-id');
    const cardTitle = cardElement.querySelector('.card-title').textContent;
    const cardColor = cardElement.style.backgroundColor;

    // 2. préremplir le formulaire avec ces infos
    const theForm = document.querySelector('#editCardModal form');
    theForm.querySelector('input[name="card_id"]').value = cardId;
    theForm.querySelector('input[name="title"]').value = cardTitle;
    theForm.querySelector('input[name="color"]').value = utilsModule.rgb2hex(cardColor);

    // 3. montrer la modale
    document.querySelector('#editCardModal').classList.add('is-active');
  },

  /** Méthode pour gérer la soumission du formulaire "éditer une carte" */
  handleEditCardForm: async (event) => {
    try {
      event.preventDefault();
      // 1. récupérer les infos du formulaire
      const formData = new FormData(event.target);
      console.log( Array.from(formData) );

      // 2. envoyer ces infos à l'API, et attendre une réponse
      const cardId = formData.get('card_id');
      let response = await fetch( cardModule.base_url+'/card/'+cardId, {
        method: "PATCH",
        body: formData
      });

      if (!response.ok) {
        console.log(response);
        alert('Impossible de modifier la carte !');
      }

      // 3. mettre à jour la carte avec les nouvelles infos
      const modifiedCard = await response.json();
      let cardElement = document.querySelector(`[card-id="${cardId}"]`);
      cardElement.style.backgroundColor = modifiedCard.color;
      cardElement.querySelector('.card-title').textContent = modifiedCard.title;

      // 4. fermer la modale
      utilsModule.hideModals();
    } catch (error) {
      console.log(error);
      alert('Impossible de modifier la carte !');
    }
  },

  // supprimer une carte
  /** Méthode pour supprimer une carte */
  handleDeleteCard: async (event) => {
    try {
      event.preventDefault();
      // 0. confirmation utilisateur !
      if ( !confirm('Voulez-vous supprimer cette carte ?') ) {
        return;
      }

      // 1. récupérer l'id de la carte ciblée
      // event.target, c'est mon bouton...
      const cardElement = event.target.closest('.box');
      const cardId = cardElement.getAttribute('card-id');

      // 2. envoyer des infos à l'API => route DELETE /card/:id
      let response = await fetch( cardModule.base_url+'/card/'+cardId,{
        method: 'DELETE'
      });

      // 3. supprimer la carte du DOM
      if (!response.ok) {
        return alert('Impossible de supprimer la carte !');
      }
      // on se fiche totalement du contenu de la réponse. Tant que "ok", on supprime la carte du DOM!
      cardElement.remove();

    } catch (error) {
      console.log(error);
      alert('Impossible de supprimer la carte !');
    }
  },

  
};

module.exports = cardModule;