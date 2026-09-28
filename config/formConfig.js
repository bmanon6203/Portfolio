export const selectOptions = [
  { value: "fr", label: "France" },
  { value: "be", label: "Belgique" },
  { value: "ch", label: "Suisse" },
];

export const formFields = [
  {
    name: "title",
    label: "Titre du projet",
    type: "text",
    required: true,
    description: "Quel est le titre du projet ?",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: true,
    description: "Décris ton projet (markdown supporté)",
    hint: `Exemple :  
*   - *texte* pour le gras  
*   - - pour les listes  
*   - ## pour les titres  
*   - Sauts de ligne pour les paragraphes`,
  },
  {
    name: "photos",
    label: "Image",
    type: "file",
    multiple: false,
    required: false,
    description: "Nom du fichier image (ex: test.png)",
  },
  {
    name: "tags",
    label: "Tags",
    type: "text",
    required: false,
    description: "Tags du projet (séparés par des virgules)",
  },
  {
    name: "link",
    label: "Lien",
    type: "text",
    required: false,
    description: "Lien externe du projet (ex: # ou https://...)",
  },
];

export const editFormFields = [
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: true,
    description: "Décris ton projet (markdown supporté)",
  },
  {
    name: "photos",
    label: "Image",
    multiple: false,
    type: "file",
    description: "Nom du fichier image (ex: test.png)",
  },
  {
    name: "tags",
    label: "Tags",
    type: "text",
    required: true,
    description: "Tags du projet (séparés par des virgules)",
  },
  {
    name: "link",
    label: "Lien",
    type: "text",
    required: true,
    description: "Lien externe du projet (ex: # ou https://...)",
  },
  {
    name: "title",
    label: "Titre du projet",
    type: "text",
    required: true,
    description: "Titre du projet (ex: Portfolio 3D)",
  },
];

export const editFormConfig = {
  accessCode: null,
  submitEndpoint: "/api/entries",
  requireAccessCode: false,
  showBackButton: true,
  maxVisibleSteps: 3,
  resetOnSuccess: false,
  selectOptions: {
    country: ["France", "Belgique", "Suisse", "Canada", "Luxembourg"],
    occupation: [
      "Étudiant",
      "Développeur",
      "Designer",
      "Manager",
      "Entrepreneur",
      "Consultant",
      "Autre",
    ],
    experience: ["Débutant", "Intermédiaire", "Expérimenté", "Expert"],
  },
};
