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