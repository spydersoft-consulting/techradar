import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "../../api/Data";
import { AppThunk } from "../store";
import { callDataApi } from "../../utils/ApiFunctions";

export interface RadarViewState {
  id: number;
  radarData: api.RadarData;
  daysOld?: number;
  selectedTagIds?: number[];
  isLoading: boolean;
}

interface FetchRadarView {
  id: number;
  radarData: api.RadarData;
  days?: number;
  selectedTagIds?: number[];
}

function startLoading(state: RadarViewState): void {
  state.isLoading = true;
}

function stopLoading(state: RadarViewState): void {
  state.isLoading = false;
}

const initialState: RadarViewState = {
  id: 0,
  radarData: {},
  isLoading: false,
};

const radarViewSlice = createSlice({
  name: "radarview",
  initialState,
  reducers: {
    getRadarViewStart: startLoading,
    getRadarViewComplete: stopLoading,
    getRadarView: (state, action: PayloadAction<FetchRadarView>): void => {
      state.id = action.payload.id;
      state.radarData = action.payload.radarData;
      state.daysOld = action.payload.days;
      state.selectedTagIds = action.payload.selectedTagIds;
      state.isLoading = false;
    },
  },
});

export const { getRadarViewStart, getRadarViewComplete, getRadarView } = radarViewSlice.actions;

export const fetchRadarView =
  (radarId: number, selectedTagIds?: number[], days?: number): AppThunk =>
  async (dispatch): Promise<void> => {
    dispatch(getRadarViewStart());

    const result = await callDataApi((baseUrl) =>
      api.RadarDataApiFactory(undefined, baseUrl).radarDataIdGet(radarId, selectedTagIds, days),
    );
    // TODO: error check

    dispatch(
      getRadarView({
        id: radarId,
        radarData: result.data,
        days: days,
        selectedTagIds: selectedTagIds,
      }),
    );
  };

export const radarViewSliceReducer = radarViewSlice.reducer;
