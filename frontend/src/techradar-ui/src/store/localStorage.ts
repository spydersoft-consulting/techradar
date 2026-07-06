import { logError } from "../logging";
import { RootState } from "./store";

export const loadState = (): RootState | undefined => {
  try {
    const serializedState = localStorage.getItem("tech_radar_state");
    if (!serializedState) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    logError(error);
  }
  return undefined;
};

export const saveState = (state: RootState): void => {
  try {
    const stateCopy: RootState = structuredClone(state);

    const serializedState = JSON.stringify(stateCopy);

    localStorage.setItem("tech_radar_state", serializedState);
  } catch (error) {
    logError(error);
  }
};
