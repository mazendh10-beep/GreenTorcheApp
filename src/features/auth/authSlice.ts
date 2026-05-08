import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { LoginPayload, RegisterPayload, User } from "../../types";
import { authApi, clearToken, getToken, setToken, userApi } from "../../services/api";
import type { RootState } from "../../state/store";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  token: null,
  loading: false,
  initialized: false,
  error: null
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      await setToken(response.token);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      await setToken(response.token);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const loadSession = createAsyncThunk("auth/loadSession", async (_, { rejectWithValue }) => {
  try {
    const token = await getToken();
    if (!token) return null;
    const user = await authApi.me();
    return { user, token };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Session load failed";
    await clearToken();
    return rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload: { name?: string; bio?: string; avatarUrl?: string }, { rejectWithValue }) => {
    try {
      return await userApi.updateProfile(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Profile update failed";
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.currentUser = null;
      state.token = null;
      state.error = null;
      state.initialized = true;
      void clearToken();
    },
    markInitialized(state) {
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Registration failed";
        state.initialized = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Login failed";
        state.initialized = true;
      })
      .addCase(loadSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.currentUser = action.payload?.user ?? null;
        state.token = action.payload?.token ?? null;
      })
      .addCase(loadSession.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.currentUser = null;
        state.token = null;
        state.error = (action.payload as string) ?? null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Profile update failed";
      });
  }
});

export const { logout, markInitialized, clearAuthError } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
