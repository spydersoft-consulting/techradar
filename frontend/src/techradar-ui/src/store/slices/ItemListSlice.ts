import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "../../api/Data";
import { AppThunk } from "../store";
import { callDataApi } from "../../utils/ApiFunctions";

export interface ItemListState {
  radarId: number;
  selectedArcId: number;
  selectedQuadrantId: number;
  items: api.RadarItem[];
  isLoading: boolean;
}

interface FetchItemListResult {
  data: api.RadarItem[];
  quadrant: number;
  radarId: number;
  arc: number;
}

interface UpdateFilterData {
  quadrant: number;
  arc: number;
}

function startLoading(state: ItemListState): void {
  state.isLoading = true;
}

function stopLoading(state: ItemListState): void {
  state.isLoading = false;
}

const initialState: ItemListState = {
  selectedArcId: 0,
  selectedQuadrantId: 0,
  radarId: 0,
  items: [],
  isLoading: false,
};

const itemListSlice = createSlice({
  name: "itemlist",
  initialState,
  reducers: {
    getItemsStart: startLoading,
    getItemsCompleted: stopLoading,
    getItemsList: (state, action: PayloadAction<FetchItemListResult>): void => {
      state.items = action.payload.data;
      state.selectedArcId = action.payload.arc;
      state.selectedQuadrantId = action.payload.quadrant;
      state.isLoading = false;
    },
    updateFilter: (state, action: PayloadAction<UpdateFilterData>): void => {
      state.selectedQuadrantId = action.payload.quadrant;
      state.selectedArcId = action.payload.arc;
    },
  },
});

export const { getItemsStart, getItemsCompleted, getItemsList, updateFilter } = itemListSlice.actions;

export const fetchItemList =
  (radarId: number, arcId: number, quadrantId: number): AppThunk =>
  async (dispatch): Promise<void> => {
    dispatch(getItemsStart());

    const result = await callDataApi((baseUrl) =>
      // todo: implement paging here
      api.RadarApiFactory(undefined, baseUrl).radarIdItemsGet(radarId, arcId, quadrantId, undefined),
    );

    // TODO: error check

    dispatch(
      getItemsList({
        data: result.data,
        quadrant: quadrantId,
        radarId: radarId,
        arc: arcId,
      }),
    );
  };

export const itemListSliceReducer = itemListSlice.reducer;
