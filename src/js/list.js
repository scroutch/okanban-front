const cardModule = require('./card');
const utilsModule = require('./utils');

const listModule = {
  base_url: '',

  // créer une liste dans le DOM
  showAddListModal: () => {
    //cibler la modal
    //ajouter une class css pour l'afficher
    document.getElementById('addListModal').classList.add('is-active');
  },

  /** Méthode pour créer une liste et l'ajouter au DOM */
  makeListInDOM: (listTitle, listId) => {
    //1. récupérer le template
    const template = document.getElementById('listTemplate');
    //2. cloner le template => on récupère un element HTML "nouvelleListe"
    let newList = document.importNode(template.content, true);
    //3. mettre à jour le nom de la liste.
    newList.querySelector('h2').textContent = listTitle;

    //3.alt. mettre à jour l'id de la nouvelle liste
    newList.querySelector('.panel').setAttribute('list-id', listId);
    // on en profite pour préremplir l'input du formulaire "éditer la liste"
    newList.querySelector('input[name="list-id"]').value = listId;

    //3bis. ajouter des eventListener sur les éléments de la nouvelle liste !
    // - ajouter une carte
    newList.querySelector('.add-card-btn').addEventListener('click', cardModule.showAddCardModal);
    // - modifier le titre => clic sur H2
    newList.querySelector('h2').addEventListener('dblclick', listModule.showEditListForm);
    // - modifier le titre => submit formulaire
    newList.querySelector('.edit-list-form').addEventListener('submit', listModule.handleEditListForm);
    // - supprimer la liste => clic sur la poubelle
    newList.querySelector('.delete-list-btn').addEventListener('click', listModule.handleDeleteList);

    //4. ajouter "nouvelleListe" au DOM, au bon endroit.
    // - 4.1 cibler "la colonne avec des boutons"
    // - 4.2 ajouter nouvelle liste juste avant "la colonne avec des boutons"
    document.getElementById('buttonsColumn').before(newList);
  },

  /** Méthode pour capturer le submit du formulaire "ajouter une liste" */
  handleAddListForm: async (event) => {
    try {
      event.preventDefault(); // on empêche la page de se recharger !

      //1. récupérer les valeurs du formulaire
      var formData = new FormData( event.target );

      //2. Envoyer les infos du formulaire à l'api (et attendre une réponse)
      let response = await fetch( listModule.base_url+'/list', {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        let error = await response.json();
        console.log(error);
        return alert('Impossible de créer la liste !\n' + error.errors[0].message);
      }
      let newList = await response.json();

      //3. utiliser la réponse de l'api, et passer les bonnes valeurs à makeListInDOM pour créer la liste dans le HTML
      listModule.makeListInDOM( newList.title, newList.id );
      //4. fermer la modale
      utilsModule.hideModals();

    } catch (error) {
      console.log(error);
      alert('Impossible de créer la liste !');
    }
  },

  // modifier une liste
  showEditListForm: (event) => {
    // l'event est "branché" sur le h2, donc event.target sera toujours le h2 qui nous interesse
    // rendre le h2 caché
    event.target.classList.add('is-hidden');
    // rendre le formulaire visible
    // pour cibler le formulaire : on "remonte" à div column, et on cherche le form dedans
    const theForm = event.target.closest('.column').querySelector('form');
    theForm.classList.remove('is-hidden');    
    // au passage, on préremplie l'input "title" avec le contenu du H2
    theForm.querySelector('input[name="title"]').value = event.target.textContent;
  },

  /** Méthode pour éditer une liste */
  handleEditListForm: async (event) => {
    try {
      event.preventDefault(); // on empeche le rechargement de la page
      
      //1. récupérer les infos du formulaire
      var formData = new FormData( event.target );
      const listId = formData.get('list-id');
            
      //2. transmettre les infos à l'API, et attendre la réponse
      let response = await fetch( listModule.base_url+'/list/'+listId, {
        method: 'PATCH',
        body: formData
      });

      //3. si tout va bien, mettre à jour le h2 dans le DOM
      if (response.ok) {
        let list = await response.json();
        event.target.closest('.column').querySelector('h2').textContent = list.title;

        // alternative : utiliser les infos de formData
        // event.target.closest('.column').querySelector('h2').textContent = formData.get('title');
      }
            
    } catch (error) {
      console.log(error);
    } finally {
      // dans tous les cas...  on réaffiche le titre, et on cache le formulaire
      event.target.classList.add('is-hidden');
      event.target.closest('.column').querySelector('h2').classList.remove('is-hidden');
    }
  },

  // supprimer une liste

  /** Méthode pour supprimer une liste */
  handleDeleteList: async (event) => {
    try {
      //1. récupérer l'élément liste (event.target, c'est mon bouton)
      const listElement = event.target.closest('.panel');
      //2. vérifier que la liste ne contient plus de cartes
      if( listElement.querySelectorAll('.box').length > 0) {
        return alert('Impossible de supprimer une liste non vide !');
      }
      //3. confirmation utilisateur
      if ( !confirm('Voulez-vous supprimer cette liste ?') ) {
        return;
      }
      //4. envoyer une requete à l'API
      const listId = listElement.getAttribute('list-id');
      let response = await fetch( listModule.base_url+'/list/'+listId, {
        method: "DELETE"
      });

      //5. si tout va bien, supprimer la liste du DOM
      if (response.ok) {
        listElement.remove();
      }

    } catch (error) {
      console.log(error);
      alert('Impossible de supprimer la liste !');
    }
  },

  // charger les listes depuis l'api
  getListsFromAPI: async () => {
    try {
      // on récupères les données des listes depuis l'API
      let response = await fetch( listModule.base_url+'/list' );
      // on vérifie que l'API n'a pas répondu une erreur
      if (!response.ok) {
        alert('Impossible de récupérer les listes');
        return;
      }
      
      let lists = await response.json();
      console.log(lists);
      // pour chaq liste...
      for (let list of lists) {
        // ... on crée la liste dans le DOM...
        listModule.makeListInDOM(list.title, list.id);
        // ... puis, pour chaque carte de la liste...
        for (let card of list.cards) {
          // ...on crée la carte dans le DOM
          cardModule.makeCardInDOM(card.title, list.id, card.id, card.color);
        }
      }      
    } catch (error) {
      console.error(error);
      alert('Impossible de récupérer les listes');
    }
  }

};


module.exports = listModule;