# Mon Application React avec Supabase

## Description

Cette application permet de gérer des produits, utilisateurs et commandes, le tout avec un backend Supabase. Elle est construite avec React et utilise Supabase comme base de données pour gérer les utilisateurs, les produits et les commandes.

## Prérequis

- Node.js (version 16 ou supérieure)
- npm (ou yarn)
- Supabase (un compte Supabase et un projet configuré)

## Installation

1. **Clone le dépôt** :

   ```bash
   git clone https://github.com/ton-compte/ton-repository.git
   cd ton-repository
   ```
Installe les dépendances :
```bash
  npm install
```

Lance l'application :
```bash
npm start
```
Cela démarrera l'application et l'ouvrira dans ton navigateur à l'adresse http://localhost:3000.

##Structure de l'application
L'application est structurée en composants React et utilise Supabase pour gérer la base de données et la connexion. Voici un aperçu des pages principales :

Page d'accueil : Affiche les produits récents.

Page Produits : Liste des produits avec possibilité de les consulter.

Page Utilisateurs : Liste des utilisateurs avec des options de filtrage et d'édition pour les admins et employés.

Page Commandes : Permet de gérer et de suivre les commandes.

##Comptes Administrateur
Voici les informations de connexion pour différents rôles dans l'application :

Admin
Email : florianxzeo.ogueton@gmail.com

Mot de passe : #Xzeoflo28

User (utilisateur sans rôle)
Email : jesuisunuser@gmail.com

Mot de passe : #floflo28

Employé
Email : employedumois@gmail.com

Mot de passe : #Employe28

##Rôles
Les différents rôles dans l'application permettent des niveaux d'accès spécifiques :

Admin : Accès complet à toutes les fonctionnalités (utilisateurs, produits, commandes).

Employé : Accès limité à certaines pages (gestion des produits et des utilisateurs sans rôle).

Utilisateur : Peut uniquement consulter les produits et passer des commandes, mais ne peut rien ajouter ou modifier.

##Fonctionnalités
Authentification via Supabase.

Gestion des utilisateurs : Création, modification et suppression des utilisateurs (par admin et employé).

Gestion des produits : Visualisation des produits, avec une interface claire pour les consulter.

Gestion des commandes : Visualisation et mise à jour des commandes par les admins et employés.
