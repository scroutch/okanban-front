(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const listModule = require('./list');
const cardModule = require('./card');
const labelModule = require('./label');
const utilModule = require('./utils');

// on objet qui contient des fonctions
var app = {
    base_url: "http://localhost:5050",

    // fonction d'initialisation, lancée au chargement de la page
    init: function () {
        console.log('app.init !');
        // à l'initialisation, on transmet app.base_url à tous les modules qui en ont besoin
        listModule.base_url = app.base_url;
        cardModule.base_url = app.base_url;
        labelModule.base_url = app.base_url;

        app.addListenertoActions();
        listModule.getListsFromAPI();
        labelModule.getLabelsFromAPI();
    },

    addListenertoActions: () => {
        /** Ouverture de la modale "ajouter une liste" */
        //1. cibler (récupérer, capturer...) le bouton "ajouter une liste"
        //2. ajouter un eventListener => showAddListModal
        document.getElementById('addListButton').addEventListener('click', listModule.showAddListModal);
        document.getElementById('addLabelButton').addEventListener('click', labelModule.showAddLabelModal);

        /** Fermeture des modales */
        //1. cibler LES boutons "close" (getElementsByClassName  OU  querySelectorAll)
        //2. ajouter un eventListener SUR CHAQUE bouton => hideModals
        // var hideModalvar template = documentsButtons = document.getElementsByClassName('close');
        var hideModalsButtons = document.querySelectorAll('.close');
        for (var button of hideModalsButtons) {
            button.addEventListener('click', utilModule.hideModals);
        }

        /** Soumission du formulaire "ajouter une liste" */
        // on cible le formulaire et on écoute l'event submit => app.handleAddListForm
        document.querySelector('#addListModal form').addEventListener('submit', listModule.handleAddListForm);

        document.querySelector('#addLabelModal form').addEventListener('submit', labelModule.handleAddLabelForm);

        /** Boutons "+" : ajouter une carte */
        const addCardButtons = document.querySelectorAll('.add-card-btn');
        for (let button of addCardButtons) {
            button.addEventListener('click', cardModule.showAddCardModal);
        }

        /** Soumission du formulaire "ajouter une carte" */
        document.querySelector('#addCardModal form').addEventListener('submit', cardModule.handleAddCardForm);

        /** Soumission du formulaire "éditer une carte" */
        document.querySelector('#editCardModal form').addEventListener('submit', cardModule.handleEditCardForm);
    }



};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init);
},{"./card":2,"./label":3,"./list":4,"./utils":5}],2:[function(require,module,exports){
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
},{"./utils":5}],3:[function(require,module,exports){
const cardModule = require('./card');
const utilsModule = require('./utils');
const labelModule = {
    base_url: '',

    //créer un label dans le dom
    showAddLabelModal: (event) => {
        //récupèrer l'id de la carte ciblée
        // const cardElement = event.target.closest('.box');
        // const cardId = cardElement.getAttribute('card-id');
        // insérer dans l'input, dans le formulaire, dans la modal "addCardModal"
        // document.querySelector('#addLabelModal input[name="card_id"]').value = cardId;
        //On cible la modal et on ajoute une classe css pour l'afficher
        document.getElementById('addLabelModal').classList.add('is-active');
    },

    //Méthode pour creer un label et l'ajouter au dom
    makeLabelInDom: (labelTitle, labelId, labelColor) => {
        //On récupère le template
        const template = document.getElementById('labelTemplate');
        //On clone le template
        let newLabel = document.importNode(template.content, true);
        newLabel.querySelector('.label-title').textContent = labelTitle;
        //On modifie le bgColor du label
        newLabel.querySelector('.tags').setAttribute('label-id', labelId);
        newLabel.querySelector('.tag').style.backgroundColor = labelColor;
        //Ajouter un label
        // newLabel.getElementById('addLabelButton').addEventListener('click', labelModule.showAddLabelModal);
        //ajouter le label dans la bonne carte
        // document.querySelector(`[card-id="${cardId}"] .panel-block`).appendChild(newLabel);
        document.getElementById('labels').before(newLabel);
    },

    //Méthode pour enregistrer le label dans l'API
    handleAddLabelForm: async (event) => {
        try {
            //On empêche la page de se recharger
            event.preventDefault();
            //On récupère les valeurs du form
            var formData = new FormData(event.target);

            //On envoie les infos à l'API et on attend la réponse
            let response = await fetch(labelModule.base_url + '/label', {
                method: "POST",
                body: formData
            });
            if (!response) {
                return alert('Impossible de creer le tag');
            }
            let newLabel = await response.json();

            //On utilise la reponse pour creer le label dans le dom
            labelModule.makeLabelInDom(newLabel.title, newLabel.id, newLabel.color);
            //On ferme la modals
            utilsModule.hideModals();
        } catch (error) {
            console.log(error);
            alert('Impossible de créer le tag');
        }
    },

    //charger les labels depuis l'api
    getLabelsFromAPI: async () => {
        try {
            //On récupère les données des labels depuis l'API
            let response = await fetch(labelModule.base_url + '/label');
            //On vérifie que l'API ne renvoie pas uen erreur
            if (!response.ok) {
                alert('Impossible de recupérer les tags');
                return;
            }

            let labels = await response.json();
            console.log(labels);

            for (let label of labels) {
                labelModule.makeLabelInDom(label.title, label.id, label.color);
            }
        } catch (error) {
            console.error(error);
            alert('Labels non récupérable');
        }
    }
};

module.exports = labelModule;
},{"./card":2,"./utils":5}],4:[function(require,module,exports){
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
            var formData = new FormData(event.target);

            //2. Envoyer les infos du formulaire à l'api (et attendre une réponse)
            let response = await fetch(listModule.base_url + '/list', {
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
            listModule.makeListInDOM(newList.title, newList.id);
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
            var formData = new FormData(event.target);
            const listId = formData.get('list-id');

            //2. transmettre les infos à l'API, et attendre la réponse
            let response = await fetch(listModule.base_url + '/list/' + listId, {
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
            if (listElement.querySelectorAll('.box').length > 0) {
                return alert('Impossible de supprimer une liste non vide !');
            }
            //3. confirmation utilisateur
            if (!confirm('Voulez-vous supprimer cette liste ?')) {
                return;
            }
            //4. envoyer une requete à l'API
            const listId = listElement.getAttribute('list-id');
            let response = await fetch(listModule.base_url + '/list/' + listId, {
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
            let response = await fetch(listModule.base_url + '/list');
            // on vérifie que l'API n'a pas répondu une erreur
            if (!response.ok) {
                alert('Impossible de récupérer les listes');
                return;
            }

            let lists = await response.json();
            //console.log(lists);
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
},{"./card":2,"./utils":5}],5:[function(require,module,exports){
// ce module contient les fonctions dont on va avoir besoin un peu partout

const utilsModule = {

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
  
    //Function to convert hex format to a rgb color
    rgb2hex: (rgb) => {
      rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
      return (rgb && rgb.length === 4) ? "#" +
      ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }
  
  };
  
  module.exports = utilsModule;
},{}]},{},[1]);
