import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

interface UIState {
  theme: ThemeMode
}

const initialState: UIState = {
  theme: 'system',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload
    },
  },
})

export const { setTheme } = uiSlice.actions
export default uiSlice.reducer