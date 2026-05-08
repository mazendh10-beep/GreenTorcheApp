import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Review, ReviewInput } from "../../types";
import { reviewApi } from "../../services/api";
import type { RootState } from "../../state/store";

interface ReviewsState {
  items: Review[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
};

export const fetchGameReviews = createAsyncThunk(
  "reviews/fetchGameReviews",
  async (gameId: number | string, { rejectWithValue }) => {
    try {
      return await reviewApi.listForGame(gameId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load reviews";
      return rejectWithValue(message);
    }
  }
);

export const addReview = createAsyncThunk(
  "reviews/addReview",
  async ({ gameId, payload }: { gameId: number; payload: ReviewInput }, { rejectWithValue }) => {
    try {
      return await reviewApi.create(gameId, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit review";
      return rejectWithValue(message);
    }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGameReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGameReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Could not load reviews";
      })
      .addCase(addReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.items = [action.payload, ...state.items.filter((item) => item.userId !== action.payload.userId)];
      })
      .addCase(addReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) ?? "Could not submit review";
      });
  }
});

export const selectReviews = (state: RootState) => state.reviews;
export default reviewsSlice.reducer;
