import { configureStore, Action } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { ThunkAction } from "redux-thunk";
import { loadState, saveState } from "./localStorage";
import { radarListSliceReducer } from "./slices/RadarListSlice";
import { radarRingListSliceReducer } from "./slices/RadarRingListSlice";
import { radarQuadrantListSliceReducer } from "./slices/RadarQuadrantListSlice";
import { itemListSliceReducer } from "./slices/ItemListSlice";
import { radarTagSliceReducer } from "./slices/RadarTagSlice";
import { radarViewSliceReducer } from "./slices/RadarViewSlice";

export const rootReducer = combineReducers({
  radarlist: radarListSliceReducer,
  ringlist: radarRingListSliceReducer,
  quadlist: radarQuadrantListSliceReducer,
  itemlist: itemListSliceReducer,
  radartags: radarTagSliceReducer,
  radarview: radarViewSliceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedState = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState,
});

store.subscribe(() => {
  saveState(store.getState());
});

export type AppDispatch = typeof store.dispatch;

export type AppThunk = ThunkAction<void, RootState, unknown, Action>;
