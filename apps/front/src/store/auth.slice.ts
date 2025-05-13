import { createSlice } from "@reduxjs/toolkit"



interface AuthState {
    status: boolean;
    data: any | null;

}


const initialState: AuthState = {
    status: false,
    data: null,
}

const authSlice = createSlice({

    name: "auth",
    initialState,

    reducers: {

        login: (state, action) => {
            state.status = true,
            state.data = action.payload
        },
        logout: (state) => {
            state.status = false,
                state.data = null
        },
        updateUser: (state, action) => {
            state.data = { ...action.payload }
        },
    }
})


export const { login, logout } = authSlice.actions;
export default authSlice.reducer;