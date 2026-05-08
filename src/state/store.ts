import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import gamesReducer from "../features/games/gamesSlice";
import reviewsReducer from "../features/reviews/reviewsSlice";
import analyticsReducer from "../features/analytics/analyticsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    games: gamesReducer,
    reviews: reviewsReducer,
    analytics: analyticsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
