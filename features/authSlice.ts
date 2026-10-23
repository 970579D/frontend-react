import { ILogin } from "@/types/login";
import { createSlice } from "@reduxjs/toolkit";


const defaultState: ILogin = {
  username: null,
  password: null
}
const authSlice = createSlice({
  name: "auth",
  initialState: defaultState,
  reducers: {
    login: (state, action) => {
      state.username = action.payload;
      state.password = null;
    },
    logout: (state) => {
      state.username = null;
      state.password = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;