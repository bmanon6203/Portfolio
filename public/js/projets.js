/**
 * @param description {string} Description du projet. Supporte le markdown simple :
 *   - *texte* pour le gras
 *   - - pour les listes
 *   - ## pour les titres
 *   - Sauts de ligne pour les paragraphes
 * @param image {string} Nom du fichier image (dans /assets).
 * @param tags {string[]} Liste de tags pour le projet.
 * @param link {string} Lien externe du projet.
 */

export const projets = {
  "exemplePortfolio": {
    description: `\n\n*Lorem ipsum* dolor sit amet, consectetur adipiscing elit.\n\n## Fonctionnalités\n- Présentation interactive\n- Design responsive\n- Intégration 3D\n\nN'hésitez pas à tester ce projet !`,
    image: "image.png",
    tags: ["three.js", "webgl", "3D", "portfolio"],
    link: "https://exemple.com"
  },
  "exempleBlog": {
    description: `Un blog technique pour partager des astuces de développement.\n\n- Articles réguliers\n- Tutoriels\n- *Communauté active*`,
    image: "blog.png",
    tags: ["blog", "web", "javascript"],
    link: "https://exemple-blog.com"
  },
  "exempleJeu": {
    description: `\n\n*Petit jeu* en ligne avec des énigmes amusantes.\n\n- Graphismes cartoon\n- Plusieurs niveaux\n- Classement en ligne`,
    image: "adventure.png",
    tags: ["jeu", "game", "canvas", "énigme"],
    link: "https://exemple-jeu.com"
  },
  "exempleTodo": {
    description: `Application de gestion de tâches minimaliste.\n\n- Ajout rapide\n- Interface claire\n- *Synchronisation cloud*`,
    image: "todo.png",
    tags: ["productivité", "todo", "app"],
    link: "https://exemple-todo.com"
  },
  "exempleTest": {
    description: `Projet de test pour démonstration.\n\n- Simple\n- Rapide\n- *Efficace*`,
    image: "test.png",
    tags: ["test"],
    link: "#"
  }
};