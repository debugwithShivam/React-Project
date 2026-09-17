# UrbanRide - Modern React Native Rider App

A complete, cutting-edge **React Native** Rider (Customer/Passenger) mobile application built for the `rapido-clone` project ecosystem.

---

## ✨ Features & Architecture

### 🎨 1. Custom Neo-Mobility UI Design
- Replaces generic yellow branding with a distinctive, high-end mobile interface (Deep Obsidian `#0B0F19`, Electric Cyan `#0EA5E9`, Vivid Indigo `#6366F1`, and Emerald `#10B981`).
- Fully reactive **Dark Mode** and **Light Mode** toggle with persistent context state.
- Smooth glass cards, pill badges, and vector icons (`@expo/vector-icons`).

### 🚫 2. Excluded Features (As Requested)
- **Travel** (Outstation/Intercity) has been completely removed.
- **Send Anything** (Parcel/Courier delivery) has been omitted.
- **Metro Tickets** have been omitted.
- Focus is 100% on fast, reliable **Urban Ride Hailing**.

### ⚡ 3. Ride Services Available
- 🛵 **Bike Taxi**: Solo & fast, helmet verified, pocket-friendly fare.
- 🛺 **City Auto**: Quick 3-wheeler without meter bargaining.
- 🚗 **Cab Mini**: Affordable compact AC hatchback.
- 🚘 **Cab Comfort (Sedan)**: Premium sedans with top-rated captains.
- 🚙 **Prime XL**: Spacious 6-seater SUVs for groups & luggage.

### 🗺️ 4. End-to-End Interactive Ride Flow
1. **Interactive Simulated Map**: Real-time canvas with road networks, water bodies, parks, live ambient vehicle pins, and animated moving trip markers.
2. **Route Selector**: Dual search modal with autocomplete, saved places pills, and swap button.
3. **Vehicle Compare Sheet**: Compare wait times, seats, features, transparent fare estimates, and payment method selector.
4. **Driver Search Radar**: Pulsing wave animation while matching nearest captains.
5. **Captain Assigned**: Captain photo, name, rating (★ 4.94), vehicle model & license plate, 4-digit PIN/OTP, and Call & Chat buttons.
6. **Live Ride Progress**: Route tracking, SOS button, destination status.
7. **Trip Completed & Rating**: Fare receipt breakdown, interactive 5-star rating, compliment badges, and tip options.

### ⚙️ 5. Comprehensive Settings & Safety Hub
- **My Profile**: View and edit Name, Phone, Email, Gender, and Emergency Guardian Contact.
- **Saved Places**: Manage Home, Work, and Custom favorites with 1-click booking and delete.
- **Payments & UrbanRide Wallet**: Wallet balance, ₹100/₹200/₹500 instant top-up simulation, linked UPI apps (GPay, PhonePe, Paytm), and saved cards.
- **Emergency SOS Toolkit**:
  - Direct 112 National Emergency Hotline dialer.
  - Trusted Family Contacts with auto-share after 8 PM.
  - AI Audio Shield & Unusual Route Stoppage check.
  - Night Safety Shield (Mandatory OTP verification).
- **Ride Preferences**: Quiet Ride Mode, Accidental Trip Insurance cover, and language selector (English, Hindi, Kannada, Telugu, Tamil, Bengali).
- **24/7 Help & Support**: Live chat desk, report lost items, fare recalculation requests, and interactive FAQ accordion.
- **Legal**: Terms of Service and Privacy Policy modals.

---

## 🚀 How to Run the App

Open terminal in `D:\code\project\rapido-clone\RiderApp`:

### Run in Web Browser
```bash
npm run web
# or
npx expo start --web
```

### Run on Mobile (Android / iOS via Expo Go)
```bash
npm start
# Scan the QR code using the Expo Go app on your phone
```

### Run on Android Emulator
```bash
npm run android
```

---

## 📁 Directory Structure
```
D:\code\project\rapido-clone\RiderApp/
├── App.js                         # Root provider wrapper (Theme, User, Ride, Navigation)
├── app.json                       # Expo configuration
├── package.json                   # Dependencies
├── src/
│   ├── theme/                     # Color tokens, Typography, Spacing, Border radii
│   ├── context/
│   │   ├── ThemeContext.js        # Dark/Light theme state
│   │   ├── UserContext.js         # Profile, saved addresses, wallet balance
│   │   └── RideContext.js         # Ride booking lifecycle & history
│   ├── data/
│   │   └── mockData.js            # Sample drivers, vehicles, past trips, locations
│   ├── components/
│   │   ├── common/                # CustomHeader, CustomButton, InputField, StatusBadge
│   │   ├── map/                   # SimulatedMap canvas
│   │   ├── ride/                  # VehicleSelectCard, RadarDriverSearch, ActiveRideCard, FareBreakdownModal
│   │   └── settings/              # SettingItem
│   ├── screens/
│   │   ├── home/                  # HomeScreen
│   │   ├── search/                # LocationSearchModal
│   │   ├── ride/                  # RideSelectScreen, TripCompleteScreen
│   │   ├── activity/              # ActivityScreen (My Rides)
│   │   ├── safety/                # SafetyScreen (SOS, Shields)
│   │   └── settings/              # SettingsScreen, ProfileScreen, SavedPlacesScreen, WalletScreen, PreferencesScreen, HelpSupportScreen
│   └── navigation/
│       └── AppNavigator.js        # Bottom Tab Bar & Sub-screen Coordinator
```
