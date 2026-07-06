import { combineReducers } from "redux";
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
