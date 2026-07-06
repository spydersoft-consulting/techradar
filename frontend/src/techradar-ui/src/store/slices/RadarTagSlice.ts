import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "../../api/Data";
import { AppThunk } from "../store";
import { callDataApi } from "../../utils/ApiFunctions";
import { UiTag } from "../../types/objects";

export interface RadarTagsState {
  radarTags: UiTag[];
  radarId: number;
}

interface FetchRadarTags {
  radarTags: UiTag[];
  radarId: number;
}

const initialState: RadarTagsState = {
  radarId: 0,
  radarTags: [],
};

const radarTagSlice = createSlice({
  name: "radartags",
  initialState,
  reducers: {
    getRadarTags: (state, action: PayloadAction<FetchRadarTags>): void => {
      state.radarTags = action.payload.radarTags;
      state.radarId = action.payload.radarId;
    },
  },
});

export const { getRadarTags } = radarTagSlice.actions;

export const fetchRadarTags =
  (radarId: number): AppThunk =>
  async (dispatch): Promise<void> => {
    const result = await callDataApi((baseUrl) => api.RadarApiFactory(undefined, baseUrl).radarIdTagsGet(radarId));

    // TODO: error check
    const suggs: UiTag[] = [];
    result.data.forEach((sugg: api.ItemTag) => {
      if (sugg.tagId !== undefined && sugg.tagId > 0) {
        suggs.push({
          id: `${sugg.tagId}`,
          text: sugg.name ?? "N/A",
          tagId: sugg.tagId ?? 0,
          className: "",
        });
      }
    });

    dispatch(
      getRadarTags({
        radarTags: suggs,
        radarId: radarId,
      }),
    );
  };

export const radarTagSliceReducer = radarTagSlice.reducer;
