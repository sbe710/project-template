import { createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface AppInfoModel {
    language: string;
}

const initialState: AppInfoModel = {
    language: 'en_EN',
};

export const appInfoSlice = createSlice({
    name: 'appInfo',
    initialState,
    reducers: {
        changeAppInfoLanguageAction(state: AppInfoModel, { payload }) {
            state.language = payload;
        },
    },
});

// actions
export const { changeAppInfoLanguageAction } = appInfoSlice.actions;

// reducer
export default appInfoSlice.reducer;

// selectors
const selectAppInfo = (state: RootState) => state.appInfo;
const selectAppInfoLanguage = createSelector([selectAppInfo], appInfo => appInfo.language);

export { selectAppInfo, selectAppInfoLanguage };
