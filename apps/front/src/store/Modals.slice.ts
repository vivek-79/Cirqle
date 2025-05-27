import { createSlice, PayloadAction } from "@reduxjs/toolkit";



const initialState ={
    name:""
}

export const ModelsSlice = createSlice({

    initialState,
    name:"modals",

    reducers:{

        setModel:(state,action:PayloadAction<{name:string}>)=>{

            const {name} = action.payload;
            state.name = name;
        }
    }
})


export const { setModel } =  ModelsSlice.actions;
export default ModelsSlice.reducer;