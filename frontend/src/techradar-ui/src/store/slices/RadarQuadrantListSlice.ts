import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "../../api/Data";
import { AppThunk } from "../store";
import { callDataApi } from "../../utils/ApiFunctions";

export interface RadarQuadrantListState {
  quadrants: api.Quadrant[];
  radarId: number;
  isLoading: boolean;
}

interface FetchRadarQuadrantListResult {
  data: api.Quadrant[];
  radarId: number;
}

function startLoading(state: RadarQuadrantListState): void {
  state.isLoading = true;
}

function stopLoading(state: RadarQuadrantListState): void {
  state.isLoading = false;
}

const initialState: RadarQuadrantListState = {
  quadrants: [],
  radarId: 0,
  isLoading: false,
};

const radarQuadrantListSlice = createSlice({
  name: "quadlist",
  initialState,
  reducers: {
    getRadarQuadrantsStart: startLoading,
    getRadarQuadrantsCompleted: stopLoading,
    getRadarQuadrantsList: (state, action: PayloadAction<FetchRadarQuadrantListResult>): void => {
      state.quadrants = action.payload.data;
      state.radarId = action.payload.radarId;
      state.isLoading = false;
    },
  },
});

export const { getRadarQuadrantsStart, getRadarQuadrantsCompleted, getRadarQuadrantsList } =
  radarQuadrantListSlice.actions;

export const fetchRadarQuadrantList =
  (radarId: number): AppThunk =>
  async (dispatch): Promise<void> => {
    dispatch(getRadarQuadrantsStart());

    const result = await callDataApi((baseUrl) => api.RadarApiFactory(undefined, baseUrl).radarIdQuadrantsGet(radarId));

    // TODO: error check

    dispatch(
      getRadarQuadrantsList({
        data: result.data,
        radarId: radarId,
      }),
    );
  };

export const radarQuadrantListSliceReducer = radarQuadrantListSlice.reducer;
