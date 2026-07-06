import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "../../api/Data";
import { AppThunk } from "../store";
import { callDataApi } from "../../utils/ApiFunctions";

export interface RadarRingListState {
  rings: api.RadarArc[];
  radarId: number;
  isLoading: boolean;
}

interface FetchRadarRingListResult {
  data: api.RadarArc[];
  radarId: number;
}

function startLoading(state: RadarRingListState): void {
  state.isLoading = true;
}

function stopLoading(state: RadarRingListState): void {
  state.isLoading = false;
}

const initialState: RadarRingListState = {
  rings: [],
  radarId: 0,
  isLoading: false,
};

const radarRingListSlice = createSlice({
  name: "ringlist",
  initialState,
  reducers: {
    getRadarRingsStart: startLoading,
    getRadarRingsCompleted: stopLoading,
    getRadarRingsList: (state, action: PayloadAction<FetchRadarRingListResult>): void => {
      state.rings = action.payload.data;
      state.radarId = action.payload.radarId;
      state.isLoading = false;
    },
  },
});

export const { getRadarRingsStart, getRadarRingsCompleted, getRadarRingsList } = radarRingListSlice.actions;

export const fetchRadarRingList =
  (radarId: number): AppThunk =>
  async (dispatch): Promise<void> => {
    dispatch(getRadarRingsStart());

    const result = await callDataApi((baseUrl) => api.RadarApiFactory(undefined, baseUrl).radarIdArcsGet(radarId));

    // TODO: error check

    dispatch(
      getRadarRingsList({
        data: result.data,
        radarId: radarId,
      }),
    );
  };

export const radarRingListSliceReducer = radarRingListSlice.reducer;
