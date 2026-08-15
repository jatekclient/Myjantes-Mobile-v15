# MyJantes — Documentation API complète

> **Base URL mobile** : `https://api.myjantes.fr`  
> **Authentification** : Bearer JWT (`Authorization: Bearer <accessToken>`)  
> Tous les endpoints `/api/mobile/*` et `/api/admin/*` nécessitent un token valide sauf mention contraire.

---

## Sommaire

1. [Authentification](#1-authentification)
2. [Profil & Compte](#2-profil--compte)
3. [Garage](#3-garage)
4. [Services](#4-services)
5. [Devis (Quotes)](#5-devis-quotes)
6. [Factures (Invoices)](#6-factures-invoices)
7. [Avoirs (Credit Notes)](#7-avoirs-credit-notes)
8. [Factures groupées (Pro)](#8-factures-groupées-pro)
9. [Réservations](#9-réservations)
10. [Demandes de devis (Quote Requests)](#10-demandes-de-devis-quote-requests)
11. [Configurateur 3D / Demande enlèvement](#11-configurateur-3d--demande-denlèvement)
12. [Paiements Stripe](#12-paiements-stripe)
13. [Notifications](#13-notifications)
14. [Appareils Push (Devices)](#14-appareils-push-devices)
15. [Chat / Messagerie](#15-chat--messagerie)
16. [Upload de médias](#16-upload-de-médias)
17. [AR / Simulateur de jantes](#17-ar--simulateur-de-jantes)
18. [Assistante IA](#18-assistante-ia)
19. [Liens publics (Deep Links)](#19-liens-publics-deep-links)
20. [Clients Pro — Permissions par rôle](#20-clients-pro--permissions-par-rôle)
21. [Admin — Gestion utilisateurs](#21-admin--gestion-utilisateurs)
22. [Admin — Tableau de bord](#22-admin--tableau-de-bord)
23. [Admin — Devis](#23-admin--devis)
24. [Admin — Factures](#24-admin--factures)
25. [Admin — Réservations](#25-admin--réservations)
26. [Admin — Dossiers Atelier](#26-admin--dossiers-atelier)
27. [Admin — Bons de livraison](#27-admin--bons-de-livraison)
28. [Admin — Comptabilité & Exports](#28-admin--comptabilité--exports)
29. [Admin — Stripe Financier](#29-admin--stripe-financier)
30. [Temps réel — WebSocket](#30-temps-réel--websocket)
31. [Universal Links / Deep Links mobiles](#31-universal-links--deep-links-mobiles)

---

## 1. Authentification

Tous les tokens d'authentification sont des JWT. Le SDK gère le refresh automatiquement.

### `POST /api/mobile/auth/login`
Connexion email + mot de passe.

**Body**
```json
{ "email": "user@example.com", "password": "••••••••" }
```
**Réponse** `200`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "user": { "id": "uuid", "email": "...", "role": "client", ... }
}
```

---

### `POST /api/mobile/auth/firebase`
Connexion via Firebase (Google / Apple Sign-In).

**Body**
```json
{ "idToken": "<firebase_id_token>", "provider": "google" | "apple" }
```
**Réponse** `200` — même structure qu'`/auth/login`

---

### `POST /api/mobile/auth/register`
Inscription d'un nouveau compte client ou client professionnel.

**Body**
```json
{
  "email": "pro@example.com",
  "password": "••••••••",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33600000000",
  "role": "client" | "client_professionnel",
  "companyName": "Garage XYZ",     // Pro uniquement
  "siret": "12345678901234",        // Pro
  "tvaNumber": "FR12345678901",     // Pro
  "companyAddress": "1 rue des Jantes"
}
```

---

### `POST /api/mobile/auth/logout`
Révoque la session côté serveur.

---

### `POST /api/mobile/auth/forgot-password`
Envoi d'un email de réinitialisation.

**Body** `{ "email": "user@example.com" }`

---

### `GET /api/mobile/auth/reset-password/:token`
Vérifie la validité d'un token de réinitialisation.

---

### `POST /api/mobile/auth/reset-password`
Réinitialise le mot de passe.

**Body** `{ "token": "...", "password": "nouveau_mdp" }`

---

### `POST /api/mobile/refresh-token`
Renouvelle l'access token sans Bearer (utilise le refresh token).

**Body** `{ "refreshToken": "eyJ..." }`  
**Réponse** `{ "accessToken": "...", "refreshToken": "..." }`

---

### `GET /api/mobile/auth/me`
Retourne l'utilisateur connecté.

**Réponse**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33600000000",
  "role": "client",
  "garageId": "uuid",
  "profileImageUrl": "https://...",
  "address": "...",
  "companyName": null,
  "siret": null,
  "tvaNumber": null
}
```

---

## 2. Profil & Compte

### `GET /api/mobile/profile`
Récupère le profil complet de l'utilisateur connecté.

---

### `PATCH /api/mobile/profile`
Met à jour les informations du profil.

**Body** (tous optionnels)
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33600000000",
  "address": "1 rue des Lilas",
  "postalCode": "75001",
  "city": "Paris",
  "companyName": "Garage Pro",
  "siret": "12345678901234",
  "tvaNumber": "FR12345678901",
  "companyAddress": "..."
}
```

---

### `POST /api/mobile/profile/avatar`
Upload de la photo de profil.

**Body** `multipart/form-data` — champ `avatar` (fichier image JPG/PNG/WEBP)  
**Réponse** `{ "success": true, "url": "https://..." }`

---

### `DELETE /api/mobile/profile`
Suppression du compte (irréversible). Efface aussi les tokens locaux.

---

### `GET /api/mobile/profile/preferences`
Préférences de notifications.

**Réponse** `{ "smsConsent": false, "emailMarketingConsent": false }`

---

### `PATCH /api/mobile/profile/preferences`
Met à jour les préférences.

**Body** `{ "smsConsent": true, "emailMarketingConsent": false }`

---

## 3. Garage

### `GET /api/mobile/garage`
Informations du garage associé à l'utilisateur connecté.

**Réponse**
```json
{
  "id": "uuid",
  "name": "MyJantes",
  "slug": "myjantes",
  "logo": "https://...",
  "tagline": "Spécialiste des jantes",
  "address": "...",
  "city": "Casablanca",
  "phone": "+212...",
  "email": "contact@myjantes.fr",
  "primaryColor": "#dc2626",
  "secondaryColor": "#1a1a1a"
}
```

---

## 4. Services

### `GET /api/mobile/services`
Liste les services actifs du garage (endpoint authentifié).

### `GET /api/mobile/public/services`
Liste publique des services (sans authentification).

**Réponse**
```json
[
  {
    "id": "uuid",
    "name": "Rénovation jantes",
    "description": "...",
    "basePrice": "150.00",
    "category": "renovation",
    "imageUrl": "https://...",
    "isActive": true
  }
]
```

---

## 5. Devis (Quotes)

### `GET /api/mobile/quotes?limit=20&offset=0`
Liste paginée des devis. Clients : uniquement les leurs. Staff : tous.

**Réponse**
```json
{
  "items": [...],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

**Statuts possibles** : `pending` | `approved` | `accepted` | `rejected` | `completed`

---

### `GET /api/mobile/quotes/:id`
Détail d'un devis avec lignes, médias, client et service.

**Réponse**
```json
{
  "id": "uuid",
  "reference": "DEV-08-00001",
  "clientId": "uuid",
  "serviceId": "uuid",
  "status": "pending",
  "quoteAmount": "350.00",
  "wheelCount": 4,
  "diameter": "18",
  "paymentMethod": "wire_transfer",
  "pickupMode": "depot" | "enlevement" | null,
  "pickupAddress": "3 rue de la Paix, Paris" | null,
  "vehicleMake": "BMW",
  "vehicleModel": "Série 3",
  "vehicleRegistration": "AA-123-BB",
  "notes": "...",
  "createdAt": "2026-08-15T10:00:00Z",
  "items": [ { "description": "...", "quantity": 4, "unitPrice": "75.00", "totalPrice": "300.00" } ],
  "media": [ { "id": "uuid", "filePath": "https://...", "fileType": "image" } ],
  "client": { "id": "uuid", "email": "...", "firstName": "Jean", "lastName": "Dupont", "phone": "..." },
  "service": { "id": "uuid", "name": "Rénovation jantes" }
}
```

---

### `POST /api/mobile/quotes`
Crée un devis client avec photos (multipart).

**Body** `multipart/form-data`
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `images` | fichiers (×1–10) | ✅ | Photos des jantes (JPG/PNG/WEBP/HEIC) |
| `serviceId` | string | ✅ | UUID du service |
| `paymentMethod` | string | – | `wire_transfer` (défaut), `card`, `cash` |
| `requestDetails` | JSON string | – | Détails additionnels |
| `vehicleRegistration` | string | – | Immatriculation |
| `vehicleMake` | string | – | Marque |
| `vehicleModel` | string | – | Modèle |
| `vehicleVin` | string | – | VIN |
| `vehicleFuelType` | string | – | Carburant |
| `vehicleFiscalPower` | string | – | Puissance fiscale |
| `vehicleFirstRegDate` | string | – | Date 1ère immat |
| `vehicleColor` | string | – | Couleur |

---

### `GET /api/mobile/quotes/:id/media`
Liste les médias attachés à un devis.

---

### `POST /api/mobile/quotes/:id/media`
Ajoute des photos à un devis existant.

**Body** `multipart/form-data` — champ `images` (×1–10)

---

### `POST /api/mobile/quotes/:id/accept`
Client accepte un devis approuvé.

---

### `POST /api/mobile/quotes/:id/view-link`
Génère un lien de visualisation publique (deep link).

**Réponse** `{ "viewUrl": "https://api.myjantes.fr/devis/<token>" }`

---

### `GET /api/mobile/quotes/:id/pdf`
Télécharge le PDF du devis (retourne le binaire PDF).

---

## 6. Factures (Invoices)

### `GET /api/mobile/invoices?limit=20&offset=0`
Liste paginée des factures. Clients : les leurs. Staff : toutes.

**Statuts** : `pending` | `paid` | `overdue` | `cancelled`

---

### `GET /api/mobile/invoices/:id`
Détail complet d'une facture avec lignes, médias et client.

**Réponse** (en plus des champs de base)
```json
{
  "invoiceNumber": "FAC-08-00001",
  "amount": "420.00",
  "priceExcludingTax": "350.00",
  "taxAmount": "70.00",
  "dueDate": "2026-09-15T00:00:00Z",
  "paidAt": null,
  "type": "invoice" | "credit_note",
  "customTaxRate": null,
  "items": [...],
  "media": [...],
  "client": {...}
}
```

---

### `GET /api/mobile/invoices/:id/media`
Médias attachés à une facture.

---

### `POST /api/mobile/invoices/:id/media`
Ajoute des photos à une facture.

---

### `POST /api/mobile/invoices/:id/view-link`
Génère un lien de visualisation publique (deep link).

---

### `GET /api/mobile/invoices/:id/pdf`
Télécharge le PDF de la facture.

---

### `POST /api/mobile/invoices/:invoiceId/payment-intent`
Crée un PaymentIntent Stripe pour régler la facture en ligne.

**Réponse**
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx",
  "amount": 42000,
  "currency": "eur",
  "publishableKey": "pk_live_..."
}
```

---

## 7. Avoirs (Credit Notes)

> Accès **admin uniquement**.

### `GET /api/admin/credit-notes`
Liste tous les avoirs du garage.

**Réponse**
```json
[
  {
    "id": "uuid",
    "creditNoteNumber": "AV-08-0001",
    "clientId": "uuid",
    "invoiceId": "uuid" | null,
    "reason": "Remboursement partiel",
    "totalHT": "100.00",
    "tva": "20.00",
    "totalTTC": "120.00",
    "status": "pending" | "applied" | "cancelled",
    "createdAt": "..."
  }
]
```

---

### `GET /api/admin/credit-notes/:id`
Détail d'un avoir avec ses lignes.

---

### `POST /api/admin/credit-notes`
Crée un avoir.

**Body**
```json
{
  "clientId": "uuid",
  "invoiceId": "uuid",       // Facultatif — facture de référence
  "reason": "Remboursement suite à litige",
  "items": [
    { "description": "Remboursement jantes", "quantity": 1, "unitPriceHT": "100.00", "tvaRate": 20 }
  ]
}
```

---

### `PATCH /api/admin/credit-notes/:id`
Met à jour un avoir (statut, montants).

---

### `POST /api/admin/ocr/create-credit-note`
Crée un avoir par extraction OCR d'un document scanné.

**Body** `multipart/form-data` — champ `file` (PDF ou image)

---

## 8. Factures groupées (Pro)

> Conçues pour les clients **client_professionnel** avec facturation mensuelle regroupée.  
> Accès **admin uniquement**.

### `GET /api/admin/grouped-invoices`
Liste toutes les factures groupées avec totaux et nombre de lignes.

**Réponse**
```json
[
  {
    "id": "uuid",
    "invoiceNumber": "FGP-08-0001",
    "clientId": "uuid",
    "firstName": "Jean",
    "lastName": "Dupont",
    "companyName": "Garage XYZ",
    "periodStart": "2026-08-01",
    "periodEnd": "2026-08-31",
    "totalExcludingTax": "1200.00",
    "totalTax": "240.00",
    "totalIncludingTax": "1440.00",
    "status": "pending" | "sent" | "paid" | "cancelled",
    "viewToken": "abc123...",
    "itemCount": "5",
    "createdAt": "..."
  }
]
```

---

### `POST /api/admin/grouped-invoices`
Crée une facture groupée à partir de factures et/ou devis existants.

**Body**
```json
{
  "clientId": "uuid",
  "invoiceIds": ["uuid1", "uuid2"],    // Factures à regrouper
  "quoteIds": ["uuid3"],              // Devis à inclure
  "periodStart": "2026-08-01",
  "periodEnd": "2026-08-31",
  "notes": "Récapitulatif mensuel"
}
```
**Réponse** : l'objet `grouped_invoice` créé avec son numéro `FGP-MM-NNNN` auto-généré.

---

### `GET /api/admin/grouped-invoices/:id`
Détail complet avec lignes, client et totaux.

---

### `GET /api/admin/grouped-invoices/:id/pdf`
Télécharge le PDF de la facture groupée.

---

### `POST /api/admin/grouped-invoices/:id/send-email`
Envoie la facture groupée par email au client.

**Body** (optionnel) `{ "subject": "...", "message": "..." }`

---

### `PATCH /api/admin/grouped-invoices/:id/status`
Met à jour le statut.

**Body** `{ "status": "sent" | "paid" | "cancelled" }`

---

### `DELETE /api/admin/grouped-invoices/:id`
Supprime une facture groupée.

---

### `GET /api/grouped-invoices/view/:token`
Visualisation publique par token (sans auth).

---

## 9. Réservations

### `GET /api/mobile/reservations`
Liste des réservations de l'utilisateur (ou toutes pour le staff).

**Statuts** : `pending` | `confirmed` | `completed` | `cancelled`

---

### `GET /api/mobile/reservations/:id`
Détail d'une réservation avec service et client.

---

### `GET /api/mobile/reservations/availability?year=2026&month=8&duration=60`
Créneaux disponibles pour un mois donné.

| Param | Description |
|-------|-------------|
| `year` | Année (ex: 2026) |
| `month` | Mois 1–12 |
| `duration` | Durée en minutes (défaut : 60) |

**Réponse**
```json
{
  "year": 2026,
  "month": 8,
  "duration": 60,
  "days": [
    {
      "date": "2026-08-20",
      "slots": [
        { "start": "2026-08-20T09:00:00", "end": "2026-08-20T10:00:00" }
      ]
    }
  ]
}
```

---

### `POST /api/mobile/reservations`
Crée une réservation.

**Body**
```json
{
  "serviceId": "uuid",
  "scheduledDate": "2026-08-20T09:00:00Z",
  "estimatedEndDate": "2026-08-20T11:00:00Z",
  "wheelCount": 4,
  "diameter": "18",
  "notes": "...",
  "vehicleRegistration": "AA-123-BB",
  "vehicleMake": "BMW",
  "vehicleModel": "Série 5"
}
```

---

### `PATCH /api/mobile/reservations/:id`
Reprogramme une réservation.

**Body** `{ "scheduledDate": "2026-09-01T10:00:00Z" }`

---

### `DELETE /api/mobile/reservations/:id`
Annule une réservation (statut → `cancelled`).

---

### `GET /api/mobile/reservations/:id/view-token`
Génère un token HMAC signé pour partager la réservation (liens SMS/email).

**Réponse** `{ "token": "base64url.sig", "reference": "RES-08-00001" }`

---

## 10. Demandes de devis (Quote Requests)

> Ce sont les demandes entrantes depuis le widget vitrine ou l'app mobile.

### `GET /api/admin/quote-requests?status=pending`
Liste des demandes de devis.

| Query | Valeurs | Description |
|-------|---------|-------------|
| `status` | `pending`, `converted`, `rejected`, `all` | Filtre par statut |

**Réponse**
```json
[
  {
    "id": "uuid",
    "clientName": "Jean Dupont",
    "clientEmail": "jean@example.com",
    "clientPhone": "+33600000000",
    "vehicleRegistration": "AA-123-BB",
    "vehicleMake": "BMW",
    "vehicleModel": "M3",
    "serviceType": "renovation",
    "description": "4 jantes à rénover",
    "photos": ["https://...", "https://..."],
    "status": "pending",
    "convertedQuoteId": null,
    "source": "vitrine" | "configurateur" | "app",
    "pickupMode": "enlevement" | "depot" | null,
    "pickupAddress": "3 allée des Roses, Lyon",
    "createdAt": "..."
  }
]
```

---

### `GET /api/admin/quote-requests/:id/photos/:index/download`
Télécharge la photo à l'index donné (protégé, SSRF-safe).

| Query | Description |
|-------|-------------|
| `inline=1` | Affiche inline au lieu de télécharger |

---

### `GET /api/admin/quote-requests/:id/photos/download-zip`
Télécharge toutes les photos de la demande en archive ZIP.

---

### `POST /api/admin/quote-requests/sync-photos`
Re-synchronise les photos stockées (migration depuis un ancien bucket).

---

### `PATCH /api/admin/quote-requests/:id`
Met à jour le statut d'une demande.

**Body** `{ "status": "pending" | "converted" | "rejected" }`

---

### `POST /api/admin/quote-requests/:id/convert`
**Convertit** une demande en client (si nouveau) + devis officiel.

**Body**
```json
{
  "clientId": "uuid-existant",      // Optionnel si client déjà connu
  "serviceId": "uuid",
  "quoteDescription": "Rénovation 4 jantes 18\"",
  "quoteAmount": "350.00",
  "notes": "...",
  "services": [                     // Alternative multi-services
    { "serviceId": "uuid", "description": "...", "unitPrice": "85", "quantity": 4 }
  ]
}
```

---

### `POST /api/public/upload-photo`
Upload public d'une photo (utilisé par le widget vitrine avant soumission).

**Body** `multipart/form-data` — champ `photo`  
**Réponse** `{ "url": "/objects/uploads/quote-requests/..." }`

---

### `POST /api/public/quote-request`
Soumission publique d'une demande de devis (widget vitrine embarqué).

**Body** (application/json)
```json
{
  "clientName": "Jean Dupont",
  "clientEmail": "jean@example.com",
  "clientPhone": "+33600000000",
  "vehicleRegistration": "AA-123-BB",
  "vehicleMake": "BMW",
  "vehicleModel": "M3",
  "serviceType": "renovation",
  "description": "Jantes abîmées",
  "photoUrls": ["https://..."]
}
```

---

### `POST /api/public/website-quote-request`
Webhook vitrine : crée automatiquement le devis ET copie les photos.  
Idempotent par email (fenêtre 5 min). Utilise le bucket `DEFAULT_OBJECT_STORAGE_ID_3`.

---

## 11. Configurateur 3D / Demande d'enlèvement

### `POST /api/mobile/configurator/estimate`
Calcule une estimation tarifaire sans créer de devis.

**Body**
```json
{
  "serviceType": "renovation" | "personnalisation" | "polissage",
  "color": "#dc2626",
  "finish": "brillant" | "mat" | "satine" | "metallise",
  "size": "18",
  "wheelCount": 4,
  "accessories": ["centre_de_roue", "valve_chrome"]
}
```
**Réponse**
```json
{
  "totalHT": 280.00,
  "tva": 56.00,
  "totalTTC": 336.00,
  "perWheel": 70.00,
  "count": 4
}
```

---

### `POST /api/mobile/configurator/quote-request`
Soumet une demande de devis depuis le configurateur 3D.  
Supporte le mode **enlèvement** (le garage vient chercher les jantes).

**Body**
```json
{
  "configuration": {
    "serviceType": "renovation",
    "color": "#dc2626",
    "finish": "brillant",
    "size": "18",
    "wheelCount": 4,
    "accessories": []
  },
  "notes": "Jantes légèrement rayées",
  "photoUrls": ["https://..."],
  "pickupMode": "depot" | "enlevement",
  "pickupAddress": "3 allée des Roses, Lyon 69003"
}
```

> ⚠️ `pickupAddress` est **obligatoire** si `pickupMode === "enlevement"`.

**Réponse** `{ "success": true, "quoteId": "uuid", "message": "Devis créé" }`

---

### `GET /api/mobile/wheel-simulator/config`
Paramètres dynamiques du configurateur (couleurs, finitions, tailles, prix).

**Réponse**
```json
{
  "prices": { "renovation": 75, "personnalisation": 95 },
  "colors": [{ "name": "Rouge Vif", "hex": "#dc2626" }],
  "finishes": ["brillant", "mat", "satine", "metallise"],
  "sizes": ["14", "15", "16", "17", "18", "19", "20", "21"],
  "maxPhotos": 5,
  "enabledOptions": ["accessories", "color", "finish"]
}
```

---

### `POST /api/mobile/ai/analyze-wheel-params`
Analyse IA des paramètres d'une jante à partir d'une description texte.

---

## 12. Paiements Stripe

### `GET /api/mobile/payment/config`
Configuration Stripe publique.

**Réponse** `{ "publishableKey": "pk_live_...", "currency": "eur", "countryCode": "FR" }`

---

### `POST /api/mobile/invoices/:invoiceId/payment-intent`
Crée un PaymentIntent pour régler une facture via Stripe.

---

### `GET /api/public/invoices/:token/payment-status`
Vérifie le statut du paiement Stripe pour une facture publique.

---

### `POST /api/public/invoices/:token/create-checkout`
Crée une session Checkout Stripe (paiement via lien sécurisé).

**Réponse** `{ "sessionId": "cs_xxx", "url": "https://checkout.stripe.com/pay/..." }`

---

## 13. Notifications

### `GET /api/mobile/notifications`
Liste toutes les notifications de l'utilisateur.

**Réponse**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "quote" | "invoice" | "reservation" | "service" | "chat",
    "title": "Votre devis a été approuvé",
    "message": "Le devis DEV-08-00001 est prêt.",
    "relatedId": "uuid",
    "isRead": false,
    "createdAt": "..."
  }
]
```

---

### `GET /api/mobile/notifications/unread-count`
Nombre de notifications non lues.

**Réponse** `{ "count": 3 }`

---

### `PATCH /api/mobile/notifications/:id/read`
Marque une notification comme lue.

---

### `POST /api/mobile/notifications/mark-all-read`
Marque toutes les notifications comme lues.

---

## 14. Appareils Push (Devices)

### `POST /api/mobile/devices/register`
Enregistre un appareil pour les notifications push.

**Body**
```json
{
  "token": "ExponentPushToken[xxx]",
  "platform": "ios" | "android",
  "appVersion": "1.2.0",
  "deviceModel": "iPhone 15",
  "locale": "fr-FR"
}
```
**Réponse** `{ "ok": true }`

---

### `DELETE /api/mobile/devices/:encodedToken`
Supprime un appareil (désinscription push). Le token doit être URL-encodé.

---

### `GET /api/mobile/storage/status`
Statut des backends de stockage disponibles (R2, GDrive, local).

---

## 15. Chat / Messagerie

### `GET /api/mobile/chat/conversations`
Liste les conversations de l'utilisateur avec dernier message et unread count.

---

### `POST /api/mobile/chat/conversations`
Crée une nouvelle conversation.

**Body**
```json
{
  "title": "Question sur mon devis",
  "participantIds": ["uuid-admin"],
  "type": "client_admin"
}
```

---

### `GET /api/mobile/chat/conversations/:id/messages`
Messages d'une conversation (50 derniers, mise à jour du lastReadAt).

---

### `POST /api/mobile/chat/conversations/:id/messages`
Envoie un message (texte et/ou pièces jointes). Déclenche WS + push.

**Body**
```json
{
  "content": "Bonjour, j'ai une question...",
  "attachments": [
    {
      "url": "https://...",
      "fileName": "photo.jpg",
      "fileType": "image" | "video" | "document",
      "mimeType": "image/jpeg",
      "fileSize": 204800
    }
  ]
}
```

---

### `POST /api/mobile/chat/conversations/:id/read`
Marque la conversation comme lue (lastReadAt = now).

---

## 16. Upload de médias

### `POST /api/mobile/upload`
Upload d'une image unique.

**Body** `multipart/form-data` — champ `image` + `folder` (optionnel, défaut `uploads`)  
**Réponse**
```json
{
  "success": true,
  "url": "https://...",
  "objectPath": "...",
  "fileName": "photo.jpg",
  "size": 204800,
  "contentType": "image/jpeg"
}
```

---

### `POST /api/mobile/upload/multiple`
Upload de plusieurs images (max 10).

**Body** `multipart/form-data` — champ `images` (×1–10)  
**Réponse** `{ "success": true, "files": [ { "url": "...", "fileName": "...", ... } ] }`

---

### `POST /api/mobile/upload/presigned`
Génère une URL présignée Cloudflare R2 pour upload direct depuis le client.

**Body** `{ "fileName": "jante.jpg", "contentType": "image/jpeg", "folder": "quotes" }`  
**Réponse** `{ "success": true, "uploadUrl": "https://...", "key": "quotes/xxx", "fileUrl": "https://..." }`

---

## 17. AR / Simulateur de jantes

### `POST /api/mobile/ar/detect-wheels`
Détecte les roues dans une photo via Gemini Vision.

**Body** `multipart/form-data` — champ `image`  
**Réponse**
```json
{
  "positions": [
    { "x": 0.23, "y": 0.71, "radius": 0.09 },
    { "x": 0.76, "y": 0.71, "radius": 0.09 }
  ]
}
```
Les coordonnées sont normalisées 0–1 par rapport aux dimensions de l'image.

---

### `POST /api/mobile/wheel-simulator/analyze`
Analyse IA d'une jante — suggestions de couleur, finition, diamètre.

**Body** `multipart/form-data` — champ `image`  
**Réponse** `{ "analysis": "...", "diameter": "18", "finish": "brillant", "color": "#silver", "confidence": 0.87 }`

---

### `POST /api/mobile/ar/composite`
Génère l'image de try-on AR : jantes colorées superposées sur la photo.

**Body** `multipart/form-data`
| Champ | Description |
|-------|-------------|
| `image` | Photo de la voiture |
| `wheels` | JSON string : `[{"x":0.23,"y":0.71,"radius":0.09}, ...]` |
| `color` | Couleur hex : `#dc2626` |

**Réponse** : binaire `image/jpeg` (image composite prête à partager)

---

## 18. Assistante IA

### `POST /api/mobile/ai/assistant`
Dialogue avec l'assistant IA contextuel.

**Body**
```json
{
  "messages": [
    { "role": "user", "content": "Quel est le délai pour une rénovation de jantes ?" }
  ]
}
```
**Réponse** `{ "response": "En général, comptez 2 à 3 jours ouvrés..." }`

---

## 19. Liens publics (Deep Links)

> Ces routes ne nécessitent **aucune authentification**. Le token est l'auth.

### `GET /api/mobile/public/quotes/:token`
Visualisation publique d'un devis par lien partagé.

**Réponse**
```json
{
  "quote": {
    "id": "uuid", "reference": "DEV-08-00001", "status": "pending",
    "quoteAmount": "350.00", "wheelCount": 4, "diameter": "18",
    "vehicleMake": "BMW", "vehicleModel": "M3", "validUntil": "..."
  },
  "client": { "name": "Jean Dupont" },
  "items": [ { "description": "...", "quantity": 4, "unitPriceExcludingTax": "75.00", "totalIncludingTax": "360.00" } ],
  "garage": { "name": "MyJantes", "logo": "...", "primaryColor": "#dc2626", "phone": "...", "email": "...", "city": "..." }
}
```

---

### `POST /api/mobile/public/quotes/:token/accept`
Client accepte le devis via lien.

---

### `POST /api/mobile/public/quotes/:token/reject`
Client refuse le devis via lien.

---

### `GET /api/mobile/public/quotes/:token/available-slots`
Créneaux disponibles pour réserver après acceptation.

---

### `POST /api/mobile/public/quotes/:token/book`
Réserve un créneau depuis le lien de devis.

---

### `GET /api/mobile/public/quotes/:token/reservation`
Consulte la réservation associée à un devis.

---

### `GET /api/mobile/public/invoices/:token`
Visualisation publique d'une facture.

---

### `POST /api/mobile/public/invoices/:token/create-checkout`
Paiement Stripe depuis le lien facture.

---

### `GET /api/mobile/public/invoices/:token/payment-status`
Vérifie le statut du paiement.

---

### `GET /api/mobile/public/reviews/:token`
Formulaire d'avis associé à une facture.

### `POST /api/mobile/public/reviews/:token`
Soumet un avis.

**Body** `{ "rating": 5, "comment": "Excellent travail !" }`

---

### `GET /api/mobile/public/reservations/:token`
Consultation publique d'une réservation (token HMAC signé).

---

### `POST /api/mobile/public/reservations/:token/confirm`
Confirme une réservation via token.

---

### `POST /api/mobile/public/reservations/:token/cancel`
Annule une réservation via token.

---

### `GET /api/mobile/public/resolve-token?kind=devis&token=xxx`
Résout un token vers son propriétaire pour rediriger un user authentifié.

| Query | Valeurs | Description |
|-------|---------|-------------|
| `kind` | `devis`, `facture`, `avis`, `reservation` | Type de ressource |
| `token` | string | Token public |

**Réponse** `{ "ownerId": "uuid" | null, "resourceId": "uuid" }`

---

## 20. Clients Pro — Permissions par rôle

### `GET /api/role-permissions/me`
Retourne les permissions actives du rôle de l'utilisateur connecté.

**Réponse** (map feature → boolean)
```json
{
  "grouped_invoices": true,
  "credit_notes": false,
  "ar_simulator": true,
  "configurator": true
}
```

---

### `GET /api/admin/role-permissions`
Liste toutes les permissions configurées par rôle. **Root uniquement.**

---

### `PUT /api/admin/role-permissions`
Crée ou met à jour une permission (upsert). **Root uniquement.**

**Body**
```json
{
  "role": "technicien" | "atelier_manager" | "employe" | "admin" | "superadmin",
  "feature": "grouped_invoices",
  "allowed": true
}
```

---

## 21. Admin — Gestion utilisateurs

### `GET /api/admin/users`
Liste tous les utilisateurs (filtrage par garage sauf superadmin).

### `GET /api/admin/users/:id`
Détail d'un utilisateur.

### `POST /api/admin/users`
Crée un utilisateur (staff ou client).

**Body**
```json
{
  "email": "tech@myjantes.fr",
  "password": "••••••••",
  "firstName": "Marc",
  "lastName": "Martin",
  "role": "client" | "client_professionnel" | "technicien" | "atelier_manager" | "admin",
  "garageId": "uuid",
  "companyName": "...",
  "siret": "...",
  "tvaNumber": "..."
}
```

### `POST /api/admin/clients`
Raccourci — crée un client (role forcé à `client` ou `client_professionnel`).

### `PATCH /api/admin/users/:id`
Met à jour un utilisateur (rôle, infos). Restrictions : ne peut pas modifier un admin sans droits.

### `PATCH /api/admin/users/:id/password`
Change le mot de passe d'un utilisateur.

### `DELETE /api/admin/users/:id`
Supprime un utilisateur (non-admin uniquement sauf superadmin).

### `GET /api/admin/clients/:clientId/invoices`
Liste les factures d'un client spécifique.

### `GET /api/admin/clients/:clientId/dossier`
Dossier complet d'un client (devis + factures + réservations).

---

## 22. Admin — Tableau de bord

### `GET /api/mobile/admin/dashboard`
Stats synthétiques pour l'app mobile admin.

**Réponse**
```json
{
  "totalClients": 142,
  "totalQuotes": 89,
  "totalInvoices": 67,
  "totalReservations": 54,
  "pendingQuotes": 12,
  "pendingInvoices": 8,
  "todayReservations": 3,
  "totalRevenue": "15420.00",
  "paidAmount": "12800.00",
  "pendingAmount": "2620.00",
  "forecastAmount": "4500.00"
}
```

---

## 23. Admin — Devis

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/quotes` | Liste tous les devis |
| `GET` | `/api/admin/quotes/kpi` | KPIs devis (conversion, CA prévisionnel) |
| `GET` | `/api/admin/quotes/:id` | Détail devis |
| `POST` | `/api/admin/quotes` | Crée un devis (admin) |
| `PATCH` | `/api/admin/quotes/:id` | Met à jour un devis (status, montants, notes) |
| `DELETE` | `/api/admin/quotes/:id` | Supprime un devis |
| `POST` | `/api/admin/quotes/:id/send-email` | Envoie le devis par email |
| `GET` | `/api/admin/quotes/:id/items` | Lignes du devis |
| `POST` | `/api/admin/quotes/:id/items` | Ajoute une ligne |
| `PATCH` | `/api/admin/quote-items/:id` | Modifie une ligne |
| `DELETE` | `/api/admin/quote-items/:id` | Supprime une ligne |
| `GET` | `/api/admin/quotes/:id/media` | Médias du devis |
| `POST` | `/api/admin/quotes/:id/media` | Ajoute des médias |
| `GET` | `/api/admin/quotes/:id/media/download-zip` | ZIP de tous les médias |
| `DELETE` | `/api/admin/quote-media/:mediaId` | Supprime un média |
| `PATCH` | `/api/mobile/admin/quotes/:id/status` | *(Mobile)* Mise à jour statut |
| `GET` | `/api/admin/export/quotes` | Export CSV des devis |

---

## 24. Admin — Factures

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/invoices` | Liste toutes les factures |
| `GET` | `/api/admin/invoices/kpi` | KPIs facturation (CA, impayés, taux recouvrement) |
| `GET` | `/api/admin/invoices/:id` | Détail facture |
| `POST` | `/api/admin/invoices` | Crée une facture depuis un devis |
| `POST` | `/api/admin/invoices/direct` | Crée une facture directe (sans devis) |
| `PATCH` | `/api/admin/invoices/:id` | Met à jour (status, paidAt, montants, customTaxRate) |
| `DELETE` | `/api/admin/invoices/:id` | Supprime une facture |
| `POST` | `/api/admin/invoices/:id/send-email` | Envoie la facture par email |
| `GET` | `/api/admin/invoices/:id/items` | Lignes |
| `POST` | `/api/admin/invoices/:id/items` | Ajoute une ligne |
| `PATCH` | `/api/admin/invoice-items/:id` | Modifie une ligne |
| `DELETE` | `/api/admin/invoice-items/:id` | Supprime une ligne |
| `GET` | `/api/admin/invoices/:id/media` | Médias |
| `POST` | `/api/admin/invoices/:id/media` | Ajoute des médias |
| `GET` | `/api/admin/invoices/:id/media/download-zip` | ZIP des médias |
| `DELETE` | `/api/admin/invoice-media/:mediaId` | Supprime un média |
| `PATCH` | `/api/mobile/admin/invoices/:id/status` | *(Mobile)* Mise à jour statut |

**Taux de TVA personnalisé** : Le champ `customTaxRate` sur la facture (décimal) remplace le taux global du garage. Utile pour les clients pro avec TVA intracommunautaire.

---

## 25. Admin — Réservations

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/reservations` | Liste toutes les réservations |
| `GET` | `/api/admin/reservations/kpi` | KPIs réservations |
| `GET` | `/api/admin/reservations/:id` | Détail |
| `POST` | `/api/admin/reservations` | Crée une réservation (admin) |
| `PATCH` | `/api/admin/reservations/:id` | Met à jour (statut, date, notes) |
| `DELETE` | `/api/admin/reservations/:id` | Supprime |
| `POST` | `/api/admin/reservations/:id/validate-booking` | Valide une demande de créneau |
| `POST` | `/api/admin/reservations/:id/reject-booking` | Refuse une demande de créneau |
| `GET` | `/api/admin/reservations/:id/services` | Services associés |
| `PATCH` | `/api/mobile/admin/reservations/:id/status` | *(Mobile)* Mise à jour statut |

---

## 26. Admin — Dossiers Atelier

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/dossiers` | Liste des dossiers atelier |
| `GET` | `/api/dossiers/stats` | Stats globales atelier |
| `GET` | `/api/dossiers/tv` | Mode TV (affichage mural temps réel) |
| `GET` | `/api/dossiers/agenda/day` | Vue agenda du jour |
| `GET` | `/api/dossiers/leaderboard` | Classement techniciens |
| `POST` | `/api/dossiers` | Crée un dossier |
| `GET` | `/api/dossiers/:id` | Détail dossier |
| `PATCH` | `/api/dossiers/:id/status` | Avance le statut du dossier |
| `GET` | `/api/dossiers/:id/photos` | Photos du dossier |
| `POST` | `/api/dossiers/:id/timer` | Démarre/arrête le chrono technicien |
| `GET` | `/api/dossiers/:id/related` | Dossiers liés (même véhicule) |
| `GET` | `/api/dashboard/atelier` | Dashboard atelier temps réel |
| `GET` | `/api/admin/repair-orders` | Ordres de réparation |
| `POST` | `/api/admin/repair-orders` | Crée un ordre de réparation |
| `PATCH` | `/api/admin/repair-orders/:id` | Met à jour un OR |

---

## 27. Admin — Bons de livraison

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/delivery-notes` | Liste des bons de livraison |
| `GET` | `/api/admin/delivery-notes/:id` | Détail |
| `POST` | `/api/admin/delivery-notes` | Crée un bon |
| `PATCH` | `/api/admin/delivery-notes/:id` | Met à jour |
| `DELETE` | `/api/admin/delivery-notes/:id` | Supprime |

---

## 28. Admin — Comptabilité & Exports

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/accounting/profit-loss` | Compte de résultat (P&L) |
| `GET` | `/api/admin/audit-logs` | Logs d'audit (toutes actions) |
| `GET` | `/api/admin/entity-history/:entityType/:entityId` | Historique d'une entité |
| `GET` | `/api/admin/export/quotes` | Export CSV devis |
| `GET` | `/api/admin/data-integrity/check` | Rapport intégrité DB↔audit↔Resend |
| `POST` | `/api/admin/data-integrity/resync` | Re-synchronise les écarts détectés |

---

## 29. Admin — Stripe Financier

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/stripe-financial/status` | Statut de la connexion Stripe |
| `GET` | `/api/stripe-financial/accounts` | Comptes financiers Stripe |
| `POST` | `/api/stripe-financial/create-session` | Crée une session Stripe Financial |
| `GET` | `/api/stripe-financial/transactions/:accountId` | Transactions d'un compte |

---

## 30. Temps réel — WebSocket

### Connexion

```
wss://api.myjantes.fr/ws?token=<accessToken>
```

Le SDK gère la connexion via `client.openWebSocket()`.

### Événements reçus

| Type | Description | Payload |
|------|-------------|---------|
| `chat_message` | Nouveau message de chat | `{ conversationId, message: { ... } }` |
| `notification` | Notification système | `{ id, type, title, message, relatedId }` |
| `dossier_update` | Mise à jour dossier atelier | `{ dossierId, status, technicienId }` |
| `quote_update` | Changement de statut devis | `{ quoteId, status }` |
| `reservation_update` | Changement de statut réservation | `{ reservationId, status }` |

---

## 31. Universal Links / Deep Links mobiles

Ces fichiers permettent à iOS et Android d'ouvrir l'app MyJantes automatiquement.

### `GET /.well-known/apple-app-site-association`
Fichier de configuration iOS Universal Links.

### `GET /.well-known/assetlinks.json`
Fichier de configuration Android App Links.

### Paths interceptés par l'app

| URL publique | Écran app |
|-------------|-----------|
| `https://app.myjantes.fr/public/devis/:token` | Écran devis public |
| `https://app.myjantes.fr/public/facture/:token` | Écran facture publique |
| `https://app.myjantes.fr/public/reservation/:token` | Écran réservation |
| `https://app.myjantes.fr/public/avis/:token` | Formulaire d'avis |

---

## Codes d'erreur standards

| Code | Signification |
|------|--------------|
| `400` | Données invalides — `{ "message": "..." }` |
| `401` | Non authentifié — token absent ou expiré |
| `403` | Accès refusé — permissions insuffisantes |
| `404` | Ressource introuvable |
| `500` | Erreur serveur interne |

---

## Rôles et niveaux d'accès

| Rôle | Accès |
|------|-------|
| `client` | Ses propres devis, factures, réservations |
| `client_professionnel` | Idem + facturation groupée si permission activée |
| `technicien` | Dossiers atelier, réservations assignées |
| `atelier_manager` | Technicien + gestion atelier complète |
| `employe` | Lecture globale (devis, factures, clients) |
| `admin` | Toutes les routes admin |
| `superadmin` | Admin multi-garage |
| `root` / `rootadmin` | Toutes les routes + permissions système |
