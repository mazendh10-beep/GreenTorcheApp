import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Game, GameInput } from "../../types";
import { gameApi } from "../../services/api";
import type { RootState } from "../../state/store";

interface GamesState {
  items: Game[];
  popular: Game[];
  currentGame: Game | null;
  developerGames: Game[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: GamesState = {
  items: [],
  popular: [],
  currentGame: null,
  developerGames: [],
  meta: {
    total: 0,
    page: 1,
    limit: 12
  },
  loading: false,
  error: null
};

export const fetchGames = createAsyncThunk(
  "games/fetchGames",
  async (
    query: { search?: string; category?: string; page?: number; limit?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await gameApi.list(query);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch games";
      return rejectWithValue(message);
    }
  }
);

export const fetchPopularGames = createAsyncThunk("games/fetchPopular", async (_, { rejectWithValue }) => {
  try {
    return await gameApi.popular();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch popular games";
    return rejectWithValue(message);
  }
});

export const fetchGameById = createAsyncThunk(
  "games/fetchById",
  async (id: number | string, { rejectWithValue }) => {
    try {
      return await gameApi.getById(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch game";
      return rejectWithValue(message);
    }
  }
);

export const fetchDeveloperGames = createAsyncThunk(
  "games/fetchDeveloperGames",
  async (_, { rejectWithValue }) => {
    try {
      return await gameApi.mine();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch your games";
      return rejectWithValue(message);
    }
  }
);

export const createGame = createAsyncThunk(
  "games/createGame",
  async (payload: GameInput, { rejectWithValue }) => {
    try {
      return await gameApi.create(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create game";
      return rejectWithValue(message);
    }
  }
);

export const updateGame = createAsyncThunk(
  "games/updateGame",
  async ({ id, payload }: { id: number; payload: GameInput }, { rejectWithValue }) => {
    try {
      return await gameApi.update(id, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update game";
      return rejectWithValue(message);
    }
  }
);

export const deleteGame = createAsyncThunk("games/deleteGame", async (id: number, { rejectWithValue }) => {
  try {
    await gameApi.remove(id);
    return id;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete game";
    return rejectWithValue(message);
  }
});

export const downloadGame = createAsyncThunk("games/download", async (id: number, { rejectWithValue }) => {
  try {
    return await gameApi.markDownload(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start download";
    return rejectWithValue(message);
  }
});

const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    clearGameError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.games;
        state.meta = action.payload.meta;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Could not fetch games";
      })
      .addCase(fetchPopularGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularGames.fulfilled, (state, action) => {
        state.loading = false;
        state.popular = action.payload;
      })
      .addCase(fetchPopularGames.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Could not fetch popular games";
      })
      .addCase(fetchGameById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGame = action.payload;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Could not fetch game";
      })
      .addCase(fetchDeveloperGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeveloperGames.fulfilled, (state, action) => {
        state.loading = false;
        state.developerGames = action.payload;
      })
      .addCase(fetchDeveloperGames.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Could not fetch your games";
      })
      .addCase(createGame.fulfilled, (state, action) => {
        state.developerGames = [action.payload, ...state.developerGames];
      })
      .addCase(updateGame.fulfilled, (state, action) => {
        state.developerGames = state.developerGames.map((game) =>
          game.id === action.payload.id ? action.payload : game
        );
        if (state.currentGame?.id === action.payload.id) {
          state.currentGame = action.payload;
        }
      })
      .addCase(deleteGame.fulfilled, (state, action) => {
        state.developerGames = state.developerGames.filter((game) => game.id !== action.payload);
        state.items = state.items.filter((game) => game.id !== action.payload);
      });
  }
});

export const { clearGameError } = gamesSlice.actions;
export const selectGames = (state: RootState) => state.games;
export default gamesSlice.reducer;
