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