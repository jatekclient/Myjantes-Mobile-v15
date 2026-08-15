# MyToolsApp — Notes pour Apple App Review

> Document de référence à coller (ou résumer) dans le champ **App Review Information** de App Store Connect avant chaque soumission.
> Version : **2.0.5 — build 24** (iOS)
> Bundle ID : `app.mytoolsmobile.mytoolsgroup.eu`
> Apple Team ID : `GP593F562X`
> ASC App ID : `6759137046`
> Dernière mise à jour : avril 2026

---

## 1. Résumé pour le reviewer (à copier dans App Review Notes)

> **(English version below)**
>
> Bonjour,
>
> MyToolsApp est une application **B2B SaaS** destinée aux gérants et collaborateurs de **garages automobiles** abonnés à la plateforme MyTools Group (`saas.mytoolsgroup.eu`). Elle permet de gérer devis, factures, rendez-vous et clients d'un atelier de mécanique.
>
> Le compte de test ci-dessous donne accès à toutes les fonctionnalités. Aucune carte bancaire ni paiement in-app n'est requis : l'abonnement à la plateforme est géré hors-app via notre site web (modèle B2B SaaS classique).
>
> **Test account**
> - Email : `appmytools@gmail.com`
> - Password : `T0000000`
> - Role : Admin garage (accès complet)
>
> ---
>
> Hello reviewer,
>
> MyToolsApp is a **B2B SaaS application** for **car repair shop owners and staff** subscribed to the MyTools Group platform (`saas.mytoolsgroup.eu`). It manages quotes, invoices, appointments and clients for an auto-repair workshop.
>
> The test account below grants access to every feature. No credit card or in-app purchase is required: the subscription to the platform is managed outside the app through our website (standard B2B SaaS model).
>
> **Test account**
> - Email: `appmytools@gmail.com`
> - Password: `T0000000`
> - Role: Garage admin (full access)
>
> Thanks for your review!
> MyTools Group team — `contact@mytoolsgroup.eu`

---

## 2. Description fonctionnelle (Guideline 2.1 — App Completeness)

L'application est **fonctionnellement complète**. Toutes les fonctionnalités décrites sur la fiche App Store sont accessibles immédiatement après connexion :

| Fonctionnalité | Comment y accéder |
|---|---|
| Tableau de bord & KPI | Onglet **Accueil** |
| Création / suivi de devis | Onglet **Devis** ou bouton « + » |
| Création / suivi de factures | Onglet **Factures** ou bouton « + » |
| Conversion devis → facture | Détail d'un devis approuvé > bouton **Convertir** |
| Calendrier de rendez-vous | Onglet **Plus > Rendez-vous** |
| Annuaire clients | Onglet **Clients** |
| Catalogue de prestations | Onglet **Plus > Services** |
| Gestion équipe | Onglet **Plus > Utilisateurs** |
| Génération PDF | Bouton « PDF » dans le détail de chaque devis/facture |
| Synchronisation calendrier natif | Réglages > Calendrier |
| Authentification biométrique | Réglages > Sécurité |
| Suppression de compte | Réglages > Supprimer mon compte |
| Politique de confidentialité | Réglages > Politique de confidentialité (et écran login) |

---

## 3. Conformité Apple — point par point

### 3.1. Guideline 4.8 — Sign in with Apple ✅
L'app propose **Sign in with Apple**, **Connexion Google** et **Email/mot de passe**. Sign in with Apple est implémenté via `expo-apple-authentication` et apparaît sur l'écran de connexion au-dessus des autres méthodes, avec le bouton officiel Apple.

### 3.2. Guideline 5.1.1(v) — Suppression de compte ✅
Accessible depuis :
- **Réglages > Supprimer mon compte** (chemin direct, ≤ 2 taps)

La suppression est immédiate, irréversible et supprime toutes les données personnelles. Seules les factures sont conservées sous forme anonymisée pour conformité légale française (art. L102 B LPF — obligation de conservation comptable de 10 ans).

### 3.3. Guideline 5.1.1 — Permissions

Toutes les permissions sont déclarées dans `Info.plist` avec une description claire en français. Toutes sont **optionnelles** :

| Clé | Usage |
|---|---|
| `NSCameraUsageDescription` | Photographier véhicules / pièces pour les devis |
| `NSPhotoLibraryUsageDescription` | Joindre des photos existantes |
| `NSPhotoLibraryAddUsageDescription` | Enregistrer des photos générées par l'app |
| `NSCalendarsUsageDescription` | Synchroniser les rendez-vous |
| `NSFaceIDUsageDescription` | Connexion biométrique |
| `NSMicrophoneUsageDescription` | Enregistrer le son lors d'une capture vidéo (optionnel) |
| `NSUserNotificationsUsageDescription` | Alertes push (devis, factures, RDV) |

### 3.4. Guideline 2.5.2 — Software Requirements
- Aucun code dynamiquement chargé hors update natif Expo.
- Aucun SDK de tracking publicitaire (pas d'IDFA, pas de Facebook SDK, pas de Branch.io).
- Pas d'**App Tracking Transparency** nécessaire (`NSUserTrackingUsageDescription` non déclaré).

### 3.5. Export Compliance
- `ITSAppUsesNonExemptEncryption = NO` (HTTPS standard uniquement, pas de chiffrement propriétaire).

### 3.6. Privacy Manifest (iOS 17+)
- Pas de SDK tiers nécessitant un `PrivacyInfo.xcprivacy` propre. Firebase Auth iOS publie son propre manifest.
- API « Required Reason » utilisées via Expo SDK : justifications standard documentées par Expo.

### 3.7. Guideline 3.1.1 — Pas de paiement in-app
L'app est **B2B SaaS**. L'abonnement à la plateforme est géré **hors application** via le site web `saas.mytoolsgroup.eu` (paiement par virement / facture entreprise). Aucun lien d'achat n'est promu dans l'app, aucun "Buy now / Subscribe" n'apparaît dans l'UI mobile.

Conforme à la **Guideline 3.1.3(b) Multiplatform Services** : application compagnon d'un service web SaaS, l'achat se fait sur le web hors écosystème Apple.

### 3.8. iPad Support
`supportsTablet: false` — l'app est conçue pour iPhone uniquement. Aucune capture d'écran iPad n'est requise.

---

## 4. Identifiants de test (à fournir dans App Review)

| Champ | Valeur |
|---|---|
| **Username (email)** | `appmytools@gmail.com` |
| **Password** | `T0000000` |
| **Notes** | Compte admin garage avec données de démonstration. Tous les écrans nécessitent une connexion. |

> ⚠️ **Important** : ce compte doit rester actif pendant toute la période de review. Ne pas modifier le mot de passe avant approbation.

---

## 5. Sign in with Apple — flux de test

1. Lancer l'app
2. Sur l'écran de connexion, taper **« Continuer avec Apple »** (bouton noir, en haut)
3. Authentifier avec Apple ID de test
4. L'app crée automatiquement le compte côté serveur ou redirige vers l'inscription si premier login
5. Accès complet au tableau de bord

> En cas de souci avec un Apple ID de test, le compte email/password ci-dessus reste l'option de secours fonctionnelle.

---

## 6. Suppression de compte — flux de test

1. Connexion avec le compte de test
2. Onglet **Réglages**
3. Section **Compte > Supprimer mon compte**
4. Écran de confirmation avec avertissement
5. Bouton **« Je comprends, supprimer mon compte »**
6. Confirmation modale → suppression immédiate
7. Retour à l'écran de connexion

---

## 7. Architecture technique

- **Framework** : Expo SDK 54 (React Native), New Architecture activée
- **Backend** : Node.js sur `https://saas.mytoolsgroup.eu/api` (TLS 1.2+)
- **Base de données** : PostgreSQL hébergé en Europe (RGPD)
- **Auth** : Firebase Authentication (projet `crud-ae9d9`)
- **Push notifications** : APNs via Expo Push Service
- **PDF** : génération côté serveur, distribution via tokens à usage unique

---

## 8. Conformité RGPD & vie privée

- Hébergement européen
- Consentement explicite au premier lancement (politique de confidentialité, cookies, traitement données)
- Droit à la suppression : flux in-app immédiat (cf §6)
- Droit d'accès / portabilité : sur demande à `contact@mytoolsgroup.eu` (réponse sous 30 jours)
- Politique de confidentialité publique : `https://saas.mytoolsgroup.eu/privacy`
- CGU : `https://saas.mytoolsgroup.eu/terms`

---

## 9. Métadonnées App Store Connect (récap)

| Champ | Valeur recommandée |
|---|---|
| **Nom de l'app** | MyToolsApp |
| **Sous-titre** | Gestion garage : devis, factures, RDV |
| **Catégorie principale** | Business |
| **Catégorie secondaire** | Productivity |
| **Classification** | 4+ |
| **Prix** | Gratuit (abonnement géré hors app) |
| **Disponibilité géographique** | France (extension Europe possible) |
| **Mots-clés** | garage, devis, facture, mécanique, atelier, automobile, gestion, RDV, planning |

### Description courte (proposée)
> MyToolsApp est l'application mobile officielle des garages automobiles abonnés à MyTools Group. Gérez vos devis, factures, rendez-vous et clients depuis votre iPhone : création rapide, signature numérique, génération PDF, synchronisation calendrier, notifications en temps réel et bien plus.

### Description longue (à adapter)
- Création de devis et factures professionnels en quelques secondes
- Conversion devis → facture en un seul geste
- Calendrier de rendez-vous synchronisé avec votre agenda iPhone
- Catalogue de prestations personnalisé
- Annuaire clients avec historique complet
- Notifications push pour ne rien manquer
- Sign in with Apple, Touch ID / Face ID
- Génération PDF et partage par email
- Mode sombre / clair automatique
- Conformité RGPD : hébergement européen, suppression de compte en 1 tap

---

## 10. Checklist finale avant soumission

- [x] Build number iOS incrémenté (24)
- [x] Icônes 1024×1024 sans transparence
- [x] `NSMicrophoneUsageDescription` ajoutée
- [x] `supportsTablet: false`
- [x] `ITSAppUsesNonExemptEncryption: NO`
- [x] Sign in with Apple présent et fonctionnel
- [x] Suppression de compte accessible en ≤ 2 taps depuis Réglages
- [x] Politique de confidentialité publique en ligne
- [x] Compte de test fourni et actif
- [x] App Review Notes (ce document) renseignées dans ASC
- [x] Captures d'écran iPhone (4 tailles requises) uploadées
- [ ] Build production iOS soumis via EAS (en attente credentials Apple)
- [ ] Soumission TestFlight pour test interne avant release

---

## 11. Contact équipe développement

- Email technique : `contact@mytoolsgroup.eu`
- Compte EAS Expo : `mytoolsapps`
- Bundle iOS : `app.mytoolsmobile.mytoolsgroup.eu`
- Project ID Expo : `184bb31c-8fb0-42ce-b71f-8408a91225b3`

En cas de question pendant la review, n'hésitez pas à nous contacter — nous répondons sous 24h ouvrées.

— L'équipe MyTools Group
