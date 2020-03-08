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

    //Méthode pour modifier un tag
    showEditLabelForm: (event) => {
        event.target.classList.add("is-hidden");
        const theForm = event.target.closest('.tags').querySelector('form');
        theForm.classList.remove('is-hidden');
        // au passage, on préremplie l'input "title" avec le contenu du H2
        theForm.querySelector('input[name="title"]').value = event.target.textContent;
    },

    /** Méthode pour éditer une label */
    handleEditLabelForm: async (event) => {
        try {
            event.preventDefault(); // on empeche le rechargement de la page

            //1. récupérer les infos du formulaire
            var formData = new FormData(event.target);
            const labelId = formData.get('label-id');
            const labelColor = formData.get('color');

            //2. transmettre les infos à l'API, et attendre la réponse
            let response = await fetch(labelModule.base_url + '/label/' + labelId, {
                method: 'PATCH',
                body: formData
            });

            //3. si tout va bien, mettre à jour le tag dans le DOM
            if (response.ok) {
                let label = await response.json();
                event.target.closest('.tags').querySelector('.tag').textContent = label.title;
                event.target.closest('.tags').querySelector('.tag').style.backgroundColor = labelColor;
            }

        } catch (error) {
            console.log(error);
        } finally {
            // dans tous les cas...  on réaffiche le titre, et on cache le formulaire
            event.target.classList.add('is-hidden');
            event.target.closest('.tags').querySelector('.tag').classList.remove('is-hidden');
        }
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

        //SUpprimer un label
        newLabel.querySelector('.delete').addEventListener('click', labelModule.handleDeleteLabel);
        // - modifier le titre => clic sur H2
        newLabel.querySelector('.tag').addEventListener('dblclick', labelModule.showEditLabelForm);
        // - modifier le titre => submit formulaire
        newLabel.querySelector('.edit-label-form').addEventListener('submit', labelModule.handleEditLabelForm);
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

    //Méthode pour supprimer un label
    handleDeleteLabel: async (event) => {
        try {
            const labelElement = event.target.closest('.tags');

            if (!confirm("Voulez-vous supprimez ce label ?")) {
                return;
            }

            //On envoie la requête à l'API
            const labelId = labelElement.getAttribute("label-id");
            let response = await fetch(labelModule.base_url + '/label/' + labelId, {
                method: "DELETE"
            });

            //On supprime le label du dom
            if (response.ok) {
                labelElement.remove();
            }
        } catch (error) {
            console.log(error);
            alert('Impossible de supprimer le tag');
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