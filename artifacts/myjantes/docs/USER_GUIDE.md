# MyToolsApp — Guide utilisateur complet

> Application mobile de gestion pour gérants de garages automobiles
> Version 2.0.5 (build 24) — iOS & Android
> Plateforme MyTools Group — `saas.mytoolsgroup.eu`

---

## 1. À qui s'adresse cette application

MyToolsApp est l'application mobile destinée aux **administrateurs et collaborateurs de garages automobiles** abonnés à la plateforme MyTools Group. Elle permet de gérer au quotidien :

- Les **devis** envoyés aux clients
- Les **factures** émises et suivies
- Les **rendez-vous** clients dans l'atelier
- La **base clients** (particuliers et professionnels)
- Le **catalogue de prestations** du garage
- L'**équipe** (admins, managers, employés)

L'inscription se fait via votre espace MyTools Group ; les comptes sont validés par notre équipe avant activation.

---

## 2. Premier lancement

### 2.1. Écran de consentement
Au premier lancement, l'app vous demande d'accepter :
- La **politique de confidentialité**
- L'usage des **cookies / stockage local**
- Le **traitement des données** dans le cadre du service

Ces consentements sont obligatoires pour utiliser l'app conformément au RGPD.

### 2.2. Connexion
Vous pouvez vous connecter de 3 manières :
1. **Email + mot de passe** (méthode classique)
2. **Sign in with Apple** (iPhone)
3. **Connexion Google** (iOS et Android)

Si vous n'avez pas encore de compte, l'app vous redirige vers l'écran d'inscription qui vérifie automatiquement votre numéro **SIRET** auprès de l'administration française pour pré-remplir les informations légales du garage.

### 2.3. Authentification biométrique
Une fois connecté pour la première fois, vous pouvez activer **Face ID** (iPhone récents), **Touch ID** ou la reconnaissance d'**empreinte digitale** (Android) depuis :

> Réglages > Sécurité > Authentification biométrique

Aux ouvertures suivantes, un simple regard ou un appui de doigt suffit.

---

## 3. La barre de navigation

L'application comporte 6 onglets en bas de l'écran :

| Onglet | Rôle |
|---|---|
| **Accueil** | Tableau de bord avec indicateurs clés et graphique du chiffre d'affaires |
| **Devis** | Liste, création et suivi des devis |
| **Factures** | Liste, création et suivi des factures |
| **+** (bouton central rouge) | Menu rapide : nouveau devis, facture, rendez-vous, service |
| **Plus** | Outils avancés : rendez-vous, services, utilisateurs, notifications, IA, logs |
| **Clients** | Annuaire clients avec historique complet |
| **Réglages** | Profil, sécurité, notifications, thème, support, suppression de compte |

> Astuce : tirez vers le bas sur n'importe quelle liste pour rafraîchir les données.

---

## 4. Tableau de bord (Accueil)

L'écran d'accueil affiche en temps réel :
- **Chiffre d'affaires du mois** en cours
- **Devis actifs** (en attente de réponse client)
- **Factures impayées**
- **Clients enregistrés** au total
- **Rendez-vous à venir** sur 7 jours
- **Graphique sur 6 mois** du chiffre d'affaires

Chaque carte est cliquable et vous emmène directement sur la liste correspondante.

---

## 5. Devis

### Créer un devis
1. Bouton « + » > **Nouveau devis**
2. Choisissez le **client** (ou créez-le à la volée)
3. Ajoutez les **lignes de prestation** : description, quantité, prix HT, taux de TVA
4. Ajoutez des **photos** justificatives (jusqu'à 3, depuis l'appareil photo ou la galerie)
5. Validez

L'app calcule automatiquement les totaux **HT** et **TTC**.

### Statuts disponibles
- **En attente** (envoyé au client)
- **Approuvé** (le client a accepté)
- **Rejeté**
- **Annulé**

Depuis le détail d'un devis, vous pouvez :
- Voir / télécharger le **PDF**
- Le **convertir en facture** d'un seul geste
- Changer son statut

> En mode édition, les lignes existantes sont **verrouillées** (lecture seule) pour préserver l'intégrité du document. Pour modifier les lignes, créez un nouveau devis.

---

## 6. Factures

### Créer une facture
1. Bouton « + » > **Nouvelle facture**, OU depuis un devis approuvé > **Convertir en facture**
2. Vérifiez les lignes et le mode de paiement
3. Validez

### Statuts
- **En attente** de paiement
- **Payée**
- **En retard** (signalée en rouge automatiquement après la date d'échéance)
- **Annulée**

Le **PDF** est généré côté serveur et peut être téléchargé, partagé par email ou imprimé directement depuis l'app.

---

## 7. Rendez-vous

Accessible depuis l'onglet **Plus > Rendez-vous**.

### Deux vues
- **Vue calendrier** (agenda mensuel) — appuyez sur un jour pour voir les RDV
- **Vue liste** chronologique

### Création
Bouton « + » > **Nouveau RDV** : client, service, date, heure, véhicule, notes.

### Synchronisation calendrier natif
Vous pouvez **synchroniser vos RDV avec le calendrier de votre iPhone / Android** :
- Lecture : voir vos événements personnels pour éviter les conflits
- Écriture : créer un événement dans votre calendrier quand un RDV est confirmé

Activez la synchronisation depuis Réglages > Calendrier.

---

## 8. Clients

L'onglet **Clients** affiche votre annuaire complet :
- Nom, email, téléphone
- Nombre de devis et factures associés
- Recherche par nom, prénom ou email

Appuyez sur un client pour voir sa **fiche complète** : historique des devis, factures, rendez-vous, et accès rapide aux actions (appel, email, nouveau devis).

---

## 9. Services (catalogue de prestations)

Accessible depuis **Plus > Services**.

Définissez votre catalogue (ex : « Vidange complète », « Remplacement plaquettes », « Diagnostic électronique »...) avec :
- Nom et description
- Prix de référence HT
- Durée estimée
- Taux de TVA par défaut

Lors de la création d'un devis ou d'une facture, ces services pré-remplissent automatiquement les lignes.

---

## 10. Équipe (utilisateurs)

Réservé aux administrateurs. Depuis **Plus > Utilisateurs**, vous pouvez :
- Inviter de nouveaux collaborateurs (admin, manager, employé)
- Modifier les rôles
- Désactiver un compte

Chaque rôle a des permissions différentes (l'employé ne voit pas les chiffres financiers globaux par exemple).

---

## 11. Notifications

L'app envoie des **notifications push** pour :
- Nouveau devis créé par un client
- Devis accepté / rejeté
- Nouvelle demande de rendez-vous
- Paiement de facture reçu
- Rappel de rendez-vous (24h avant)

Activez / désactivez les notifications depuis **Réglages > Notifications**.

L'historique complet des notifications est consultable depuis **Plus > Notifications**.

---

## 12. Analyses IA (Plan Pro)

Réservé aux abonnements **Pro et supérieur**, depuis **Plus > Analyses IA** :

- **Analyse globale** : résumé d'activité avec recommandations
- **Analyse commerciale** : taux de conversion, performance par client
- **Analyse croissance** : tendances et prévisions

Pour activer, contactez `contact@mytoolsgroup.eu` ou upgradez votre plan dans l'espace client web.

---

## 13. Réglages & sécurité

### Personnalisation
- **Thème** : automatique, clair ou sombre
- **Notifications** : activer / désactiver par catégorie
- **Calendrier** : synchronisation native

### Profil
- Modifier vos coordonnées
- Changer votre mot de passe
- Activer / désactiver l'authentification biométrique

### Mode développeur (Root admins uniquement)
- Configurer l'URL du serveur API
- Accéder aux logs serveur en temps réel (filtrage par niveau, export CSV/JSON)

---

## 14. Permissions demandées par l'app

| Permission | Pourquoi | Obligatoire ? |
|---|---|---|
| **Appareil photo** | Photographier véhicules / pièces pour devis | Optionnel |
| **Photothèque** | Joindre des photos depuis votre galerie | Optionnel |
| **Calendrier** | Synchroniser les rendez-vous | Optionnel |
| **Face ID / Touch ID** | Connexion biométrique sécurisée | Optionnel |
| **Notifications** | Recevoir alertes en temps réel | Optionnel |
| **Microphone** | Enregistrement audio si vidéo | Optionnel |

**Toutes les permissions sont optionnelles.** Vous pouvez les refuser ou les révoquer depuis les Réglages système de votre téléphone à tout moment, sans perdre les fonctionnalités principales (texte, données, factures).

Aucune donnée biométrique (Face ID, empreinte) ne quitte votre appareil — Apple et Android la stockent localement dans une enclave sécurisée.

---

## 15. Confidentialité & sécurité des données

- **Chiffrement** : toutes les communications avec nos serveurs sont chiffrées en HTTPS (TLS 1.2+)
- **Stockage local** : tokens d'authentification stockés dans le **Keychain iOS** / **Keystore Android** (coffre-fort matériel)
- **Hébergement** : données stockées en Europe (conformité RGPD)
- **Pas de tracking publicitaire** : aucun SDK analytics tiers, aucun IDFA utilisé
- **Pas de partage avec des tiers** sauf ce qui est strictement nécessaire au service (Firebase Auth pour la connexion, Google Calendar si vous l'activez)

Politique de confidentialité complète : `https://saas.mytoolsgroup.eu/privacy`

---

## 16. Suppression de compte

Vous pouvez **supprimer définitivement votre compte** à tout moment depuis :

> Réglages > Supprimer mon compte

La suppression est :
- **Immédiate** dès confirmation
- **Irréversible** — aucune sauvegarde de récupération
- **Complète** : toutes vos données personnelles, devis, factures, rendez-vous, photos et messages sont effacés

Seules les données obligatoires par la loi française (factures conservées 10 ans, art. L102 B du Livre des procédures fiscales) sont anonymisées et conservées dans nos archives légales.

---

## 17. Support & contact

| Canal | Adresse |
|---|---|
| Email support | `contact@mytoolsgroup.eu` |
| Site web | `https://saas.mytoolsgroup.eu` |
| Délai de réponse | 24h ouvrées (lun-ven) |
| Urgences | Préciser « URGENT » dans l'objet |

Vous pouvez également ouvrir un ticket directement depuis l'app : **Réglages > Nous contacter**.

---

## 18. Versions & changelog

- **2.0.5 (build 24)** — Avril 2026
  - Verrouillage des lignes de devis/factures en mode édition
  - Toutes les redirections PDF basculées sur `saas.mytoolsgroup.eu`
  - Icônes optimisées 1024×1024 sans transparence (App Store)
  - Permission microphone correctement déclarée pour iOS
  - Fix Sign in with Apple complet
- **2.0.4** — Ajout vue agenda mensuelle pour les rendez-vous
- **2.0.3** — Synchronisation Google Calendar
- **2.0.0** — Refonte complète interface admin
