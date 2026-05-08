import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AnalyticsOverview, DeveloperAnalytics } from "../../types";
import { analyticsApi } from "../../services/api";
import type { RootState } from "../../state/store";

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  developerStats: DeveloperAnalytics[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  overview: null,
  developerStats: [],
  loading: false,
  error: null
};

export const fetchAdminOverview = createAsyncThunk(
  "analytics/fetchAdminOverview",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsApi.overview();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load admin analytics";
      return rejectWithValue(message);
    }
  }
);

export const fetchDeveloperAnalytics = createAsyncThunk(
  "analytics/fetchDeveloperAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsApi.developer();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load analytics";
      return rejectWithValue(message);
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchAdminOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Could not load analytics";
      })
      .addCase(fetchDeveloperAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeveloperAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.developerStats = action.payload;
      })
      .addCase(fetchDeveloperAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Could not load analytics";
      });
  }
});

export const selectAnalytics = (state: RootState) => state.analytics;
export default analyticsSlice.reducer;
