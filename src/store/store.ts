import storage from 'redux-persist/lib/storage';
import { Action, combineReducers, configureStore, getDefaultMiddleware, ThunkAction } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import appInfo from './app-info/app-info.slice';

const middleware = [
    ...getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
    // logger,
];

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['appInfo'],
};

const persistedReducer = persistReducer(
    persistConfig,
    combineReducers({
        appInfo,
    })
);

export const store = configureStore({
    reducer: persistedReducer,
    middleware,
    preloadedState: {},
    enhancers: [],
});

export const Persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
