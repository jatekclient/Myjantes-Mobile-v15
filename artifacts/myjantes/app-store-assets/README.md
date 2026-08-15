# App Store Assets — MyTools Admin

## Screenshot Specifications

### iPhone 6.7" (required for App Store)
- **Resolution:** 1290 × 2796 px
- **Scale:** 3x
- **Device:** iPhone 14 Pro Max, 15 Pro Max
- **Template:** `templates/iphone-67.html`

### iPhone 6.5" (required for App Store)
- **Resolution:** 1242 × 2688 px
- **Scale:** 3x
- **Device:** iPhone 11 Pro Max, XS Max
- **Template:** `templates/iphone-65.html`

### iPhone 5.5" (required for App Store)
- **Resolution:** 1242 × 2208 px
- **Scale:** 3x
- **Device:** iPhone 8 Plus, 7 Plus
- **Template:** `templates/iphone-55.html`

---

## Screenshot Set (5 screenshots per size)

| #  | Screen              | Caption (FR)                           | Caption (EN)                       |
|----|---------------------|----------------------------------------|------------------------------------|
| 1  | Dashboard           | Tableau de bord en temps réel          | Real-time business dashboard       |
| 2  | Quotes list         | Gérez vos devis facilement             | Manage your quotes with ease       |
| 3  | Invoices list       | Suivi complet de la facturation        | Complete invoice tracking          |
| 4  | Reservations        | Réservations & rendez-vous             | Appointments & reservations        |
| 5  | Client database     | Base clients complète                  | Full client database               |

---

## How to Generate Screenshots

### Method 1: HTML Templates (Fast)
1. Open `templates/iphone-67.html` in a browser
2. Set browser zoom to fit the template
3. Screenshot each slide
4. Export at correct resolution

### Method 2: Expo (Recommended for accuracy)
1. Run the app on a physical device or simulator
2. Use the correct device frame
3. Use Expo's `expo-capture` or Xcode screenshot tool
4. Add overlays using Figma or the HTML templates

### Method 3: Figma
1. Import the brand colors from `branding/brand-guidelines.md`
2. Create frames at the specified resolutions
3. Use real app screenshots as background
4. Add title overlays with Michroma font

---

## Brand Colors for Screenshot Overlays

```
Background gradient: #0A0A0A → #1A0505
Accent: #DC2626
Text: #F0F0F0
Subtext: #A8A8A8
```

---

## Overlay Text Style

- **Title:** Michroma, 48–64px, white
- **Subtitle:** Inter SemiBold, 24–32px, #A8A8A8
- **Background:** Full-bleed dark with subtle red glow
