# GreenTorcheApp

GreenTorcheApp is a cross-platform application for desktop and web, built with React Native and Expo. It provides a game store experience with user authentication, game browsing, reviews, and role-based access for players, developers, and admins.

## Main Functionalities

### 1. User Authentication
- Register and log in as a player or developer.
- Secure authentication flow with protected screens.

### 2. Game Store
- Browse a catalog of games with details, screenshots, and banners.
- Search and filter games by category.
- View popular and featured games on the landing page.

### 3. Game Details
- View detailed information about each game.
- See screenshots, banners, and ratings.
- Add and read reviews for games.

### 4. Reviews & Ratings
- Players can rate and review games.
- View average ratings and user feedback.

### 5. Role-Based Access
- Players: Browse, review, and rate games.
- Developers: Manage their own games and view analytics.
- Admins: Access admin dashboard and manage users/games.

### 6. Responsive UI
- Works on both web and desktop platforms.
- Modern, clean interface with navigation and theming.

### 7. Assets & Theming
- Custom icons, banners, and SVG assets for a polished look.
- Theming support for consistent colors and styles.

## Project Structure
- `src/components/`: Reusable UI components (NavBar, GameCard, etc.)
- `src/screens/`: Main app screens (Landing, Store, GameDetail, Auth, etc.)
- `src/features/`: Redux slices for state management (auth, games, reviews, analytics)
- `dist-web/`: Web build output and static assets

## Getting Started
1. Install dependencies: `npm install`
2. Run the app:
   - For web: `npm run web`
   - For desktop/mobile: `npm start`
3. Open in your browser or Expo Go app.

## License
MIT
