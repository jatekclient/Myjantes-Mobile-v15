# Prompt pour l'agent backend — api.myjantes.fr

## Contexte

L'application mobile MyJantes (Expo/React Native) communique **exclusivement** avec `https://api.myjantes.fr`. Toutes les routes sont préfixées par `/api/mobile/` pour les clients et `/api/mobile/admin/` pour les administrateurs.

Ce prompt liste les endpoints **qui doivent exister ou être vérifiés/créés** côté backend pour que toutes les fonctionnalités de l'app fonctionnent correctement. **Ne créez aucun endpoint côté app mobile** — uniquement sur le backend.

---

## 1. Upload de photos pour les demandes de devis (clients)

**Flux attendu (deux étapes) :**

### Étape 1 — Créer le devis (JSON)
```
POST /api/mobile/quotes
Content-Type: application/json
Authorization: Bearer <token>

{
  "serviceId": "uuid",
  "additionalServiceIds": ["uuid"],
  "vehicleInfo": {
    "brand": "Peugeot",
    "model": "308",
    "year": "2020",
    "wheelCount": "4",
    "wheelSize": "17 pouces",
    "notes": "Rayures légères"
  },
  "requestDetails": "Peugeot 308 (2020) — 4 jantes 17 pouces",
  "paymentMethod": "virement_bancaire",
  "channel": "application_mobile",
  "source": "application_mobile",
  "status": "pending"
}
```
**Réponse attendue :** `{ "id": "uuid", ... }`

### Étape 2 — Uploader les photos sur le devis créé
```
POST /api/mobile/quotes/:id/media
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData:
  media: <fichier image 1>
  media: <fichier image 2>
  ...
```
**Réponse attendue :** `{ "success": true, "media": [...] }`

**À vérifier :** Cet endpoint existe-t-il ? Accepte-t-il le champ `media` (multipart) ? Si non, le créer.

---

## 2. Demandes d'enlèvement (clients professionnels)

Déjà envoyées via `POST /api/mobile/quotes` avec :
```json
{
  "serviceType": "demande_enlevement",
  "description": "TYPE: Pneus usagés\nQUANTITÉ ESTIMÉE: 5–10\n...",
  "notes": "DEMANDE D'ENLÈVEMENT PRO\n...",
  "status": "pending",
  "channel": "application_mobile",
  "source": "application_mobile",
  "wheelCount": "4",
  "vehicleCount": "1",
  "pickupMethod": "navette"
}
```

**À vérifier :**
- Le champ `serviceType` est-il bien indexé/filtrable côté admin ?
- Les admins voient-ils ces demandes dans leur dashboard et dans la liste des devis, filtrées par `serviceType: "demande_enlevement"` ?
- Un tag ou badge visuel est-il affiché côté admin pour distinguer ces demandes des devis ordinaires ?

---

## 3. Demandes de facturation groupée (clients professionnels)

Envoyées via `POST /api/mobile/quotes` avec :
```json
{
  "serviceType": "facture_groupee",
  "description": "PÉRIODE: Mois dernier\nENTREPRISE: Garage Martin\nSIRET: 12345678901234\n...",
  "notes": "DEMANDE FACTURE GROUPÉE PRO\n...",
  "status": "pending",
  "channel": "application_mobile",
  "source": "application_mobile"
}
```

**À vérifier :**
- Les admins reçoivent-ils bien ces demandes et peuvent-ils les traiter ?
- Est-il possible de créer un endpoint dédié pour cela ? Ex: `POST /api/mobile/invoices/grouped-request`
  - Si oui, nous adapterons l'app mobile pour utiliser cet endpoint.

---

## 4. Bons de livraison (Delivery Notes)

L'app appelle :
```
GET /api/mobile/bon-livraison          → liste tous les bons de livraison du client
GET /api/mobile/bon-livraison/:id      → détail d'un bon de livraison
```

**À vérifier :**
- Ces endpoints existent-ils ?
- Si non, les créer. La réponse doit contenir au minimum : `id`, `reference`, `date`, `status`, `items[]`, `clientId`.

---

## 5. Compte pro — Solde et remise négociée

L'app appelle :
```
GET /api/mobile/account/summary        → résumé du compte client pro
GET /api/mobile/account/contacts       → interlocuteur(s) dédié(s)
```

**Format de réponse attendu pour `/account/summary` :**
```json
{
  "available": true,
  "balance": 1250.00,          // solde dû en €
  "discountRate": 15           // remise négociée en %
}
```

**Format de réponse attendu pour `/account/contacts` :**
```json
[
  {
    "id": "uuid",
    "name": "Jean Dupont",
    "role": "Commercial",
    "email": "jean@myjantes.fr",
    "phone": "0321000000",
    "avatarUrl": null
  }
]
```

**À vérifier :** Ces endpoints existent-ils ? Sont-ils accessibles uniquement pour les clients `client_professionnel` ?

---

## 6. Médias des devis côté client (récupération)

L'app appelle :
```
GET /api/mobile/quotes/:id/media
```

**Format de réponse attendu :**
```json
[
  { "id": "uuid", "url": "https://...", "fileUrl": "https://...", "fileName": "photo.jpg" }
]
```

**À vérifier :** Cet endpoint retourne-t-il bien les URLs publiques/signées des photos du devis ?

---

## 7. Support — Historique des messages

L'app appelle :
```
GET  /api/mobile/support/messages      → historique des messages de support
POST /api/mobile/support/messages      → envoyer un message
     Body: { "message": "texte" }
```

**Format GET attendu :**
```json
[
  {
    "id": "uuid",
    "message": "texte",
    "sender": "client" | "admin",
    "createdAt": "2026-01-01T00:00:00Z",
    "isRead": false
  }
]
```

---

## 8. Endpoints admin — Vérifications critiques

### Push notifications / Appareils
```
POST   /api/mobile/devices           → enregistrer un token push
DELETE /api/mobile/devices/:token    → supprimer un token
GET    /api/mobile/devices           → lister les appareils enregistrés
```

**À vérifier :** Les notifications push sont-elles envoyées quand un admin change le statut d'un devis ou d'une facture ?

### Refresh token
```
POST /api/mobile/refresh-token
Body: { "refreshToken": "..." }
Response: { "accessToken": "...", "refreshToken": "..." }
```
**À vérifier :** L'expiration des tokens est-elle bien gérée ? Le refresh est-il fonctionnel ?

---

## 9. Champs importants pour la compatibilité

Le frontend mobile utilise ces alias de champs (il faut que **au moins un** des noms soit présent dans la réponse API) :

**Pour les devis :**
- Montant total : `totalAmount` | `total` | `quoteAmount` | `totalTTC`
- Référence : `quoteNumber` | `reference`
- Photos : `photos` | `mediaUrls` | `requestDetails.mediaUrls`
- Infos véhicule : `vehicleInfo` (objet ou JSON string parseable)

**Pour les factures :**
- Total TTC : `totalTTC` | `total_ttc` | `totalIncludingTax` | `amount` | `totalAmount` | `total`
- Numéro : `invoiceNumber`

**Pour les réservations :**
- Date : `scheduledDate` | `date`
- Créneau : `timeSlot` | `time_slot`

---

## Résumé des priorités

| Priorité | Endpoint | État |
|----------|----------|------|
| 🔴 Critique | `POST /api/mobile/quotes/:id/media` | À vérifier/créer |
| 🔴 Critique | `GET /api/mobile/quotes/:id/media` | À vérifier |
| 🟡 Important | `GET /api/mobile/bon-livraison` | À vérifier/créer |
| 🟡 Important | `GET /api/mobile/account/summary` | À vérifier |
| 🟡 Important | `GET /api/mobile/account/contacts` | À vérifier |
| 🟢 Normal | Tag `serviceType` visible côté admin | À vérifier |
| 🟢 Normal | `POST /api/mobile/invoices/grouped-request` | Optionnel |
