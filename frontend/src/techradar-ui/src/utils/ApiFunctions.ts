import { AxiosError, AxiosPromise } from "axios";
import { getApiConfig } from "./Config";
import axios from "axios";

export const callDataApi = <T>(fn: (baseUrl: string) => AxiosPromise<T>): AxiosPromise<T> => {
  const baseUrl = `${window.origin}${getApiConfig("data")}`;
  return fn(baseUrl);
};

export const callBff = <T>(fn: (baseUrl: string) => AxiosPromise<T>): AxiosPromise<T> => {
  const baseUrl = `${window.origin}${getApiConfig("bff")}`;
  return fn(baseUrl);
};

export interface IValidationErrorResult {
  errors: Record<string, string[]>;
}

export const getErrorMessages = (e: Error | AxiosError<IValidationErrorResult>): Record<string, string[]> => {
  if (axios.isAxiosError(e)) {
    const aError = e as AxiosError<IValidationErrorResult>;
    if (aError.response?.status === 400) {
      // Validation errors, show message (e.response.data.errors)
      return aError.response.data.errors;
    }
  }
  // Validation errors, show message (e.response.data.errors)
  const error: Record<string, string[]> = {
    message: [(e as Error).message],
    name: [(e as Error).name],
  };
  return error;
};

export const handleApiError = (
  e: Error | AxiosError<IValidationErrorResult>,
  setFn: (value: Record<string, string[]>) => void,
): void => {
  setFn(getErrorMessages(e));
};
