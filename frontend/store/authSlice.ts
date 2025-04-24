import { UserType } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: UserType | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: UserType; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setUserFromStorage: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, setUserFromStorage, logout } = authSlice.actions;
export default authSlice.reducer;
