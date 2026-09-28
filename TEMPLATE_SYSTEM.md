# Système de Templates de Formulaires

Ce projet utilise maintenant un système de templates configurable qui permet de créer différents types de formulaires facilement.

## Structure du Système

### 1. Configuration Centrale (`/config/formConfig.js`)

Toute la configuration des formulaires est centralisée dans ce fichier :

- **`formFields`** : Définition des champs du formulaire principal
- **`selectOptions`** : Options pour tous les champs de type select
- **`defaultFormConfig`** : Configuration pour le formulaire principal
- **`editFormConfig`** : Configuration pour l'édition d'entrées
- **`contactFormFields`** : Champs spécifiques au formulaire de contact  
- **`contactFormConfig`** : Configuration du formulaire de contact
- **`registrationFormFields`** : Champs pour le formulaire d'inscription
- **`registrationFormConfig`** : Configuration du formulaire d'inscription

### 2. Composants Template

#### DynamicForm
Composant principal qui accepte maintenant ces props :
```jsx
<DynamicForm 
  fields={formFields}           // Array des champs à afficher
  config={formConfig}           // Configuration (endpoints, options, etc.)
  onSubmitSuccess={handleSuccess} // Callback succès (optionnel)
  onSubmitError={handleError}     // Callback erreur (optionnel)
/>
```

#### EditForm
Composant d'édition qui accepte :
```jsx
<EditForm 
  initialData={data}            // Données initiales
  fields={editFormFields}       // Array des champs
  config={editFormConfig}       // Configuration
  onSave={handleSave}           // Callback sauvegarde
  onCancel={handleCancel}       // Callback annulation
/>
```

### 3. Configuration d'un Champ

Chaque champ suit cette structure :
```javascript
{
  name: "fieldName",
  label: "Nom affiché",
  type: "text|email|tel|textarea|select|file",
  required: true|false,
  placeholder: "Texte d'aide",
  description: "Description détaillée",
  multiple: true|false,  // Pour les fichiers
  accept: "image/*"      // Pour les fichiers
}
```

### 4. Configuration Générale

```javascript
{
  title: "Titre du formulaire",
  accessCode: "CODE",              // Code d'accès requis
  submitEndpoint: "/api/submit",   // URL de soumission
  dataEndpoint: "/api/entries",    // URL pour récupérer/modifier les données
  enableAccessCode: true|false,    // Activer/désactiver le code d'accès
  selectOptions: {                 // Options pour les champs select
    fieldName: ["Option 1", "Option 2"]
  }
}
```

## Utilisation

### Créer un Nouveau Template

1. **Définir les champs** dans `formConfig.js` :
```javascript
export const monNouveauFormFields = [
  {
    name: "nom",
    label: "Votre nom",
    type: "text",
    required: true
  },
  // ... autres champs
];
```

2. **Définir la configuration** :
```javascript
export const monNouveauFormConfig = {
  title: "Mon Nouveau Formulaire",
  submitEndpoint: "/api/mon-endpoint",
  enableAccessCode: false,
  selectOptions: {
    // options si nécessaire
  }
};
```

3. **Créer une page** :
```jsx
"use client";
import DynamicForm from "../components/DynamicForm/DynamicForm";
import { monNouveauFormFields, monNouveauFormConfig } from "../config/formConfig";

export default function MaNouvellePagePage() {
  return (
    <DynamicForm 
      fields={monNouveauFormFields}
      config={monNouveauFormConfig}
    />
  );
}
```

### Types de Champs Supportés

- **`text`** : Champ texte simple
- **`email`** : Champ email avec validation
- **`tel`** : Champ téléphone
- **`textarea`** : Zone de texte multilignes
- **`select`** : Menu déroulant (requiert `selectOptions`)
- **`file`** : Upload de fichiers (supporte `multiple` et `accept`)

### Exemples Disponibles

1. **`/admin/create`** : Formulaire principal de création
2. **`/admin/edit`** : Interface d'édition des entrées
3. **`/admin/contact`** : Template de formulaire de contact
4. **`/admin/registration`** : Template d'inscription utilisateur

## Personnalisation Avancée

### Styling
Les styles sont appliqués via `DynamicForm.module.css`. Les classes CSS sont :
- `.input`, `.textarea`, `.select` : Champs de saisie
- `.fileInput`, `.fileInputContainer` : Upload de fichiers  
- `.form-card`, `.form-label`, `.form-actions` : Structure du formulaire

### Callbacks
Vous pouvez personnaliser le comportement avec les callbacks :
```jsx
const handleSuccess = (data) => {
  console.log("Formulaire soumis:", data);
  // Redirection, notification, etc.
};

const handleError = (error) => {
  console.error("Erreur:", error);
  // Gestion d'erreur personnalisée
};
```

### Validation
La validation se base sur :
- L'attribut `required` des champs
- Le type du champ (`email` pour les emails)
- Les contraintes définies dans le composant

Ce système offre une grande flexibilité pour créer rapidement différents types de formulaires tout en maintenant une cohérence visuelle et fonctionnelle.
