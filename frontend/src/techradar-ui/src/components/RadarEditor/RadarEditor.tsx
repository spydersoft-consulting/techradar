import React, { useEffect, useState, MouseEventHandler, MouseEvent } from "react";
import * as api from "../../api/Data";
import { ColorPicker } from "../ColorPicker/ColorPicker";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { callDataApi, handleApiError } from "../../utils/ApiFunctions";
import { AxiosPromise } from "axios";
import { fetchRadarList } from "../../store/slices/RadarListSlice";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export const RadarEditor: React.FunctionComponent = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const routeParams = useParams();

  const itemId = parseInt(routeParams.id ?? "0");
  const [radar, setLocalRadar] = useState<api.Radar>({
    id: 0,
    title: "",
    description: "",
    backgroundColor: "#FFFFFF",
    inactiveColor: "#DDDDDD",
    gridlineColor: "#BBBBBB",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Only load radar data if we have a valid ID (not creating a new radar)
    if (itemId > 0) {
      callDataApi((baseUrl) => api.RadarApiFactory(undefined, baseUrl).radarIdGet(itemId)).then((result) =>
        setLocalRadar(result.data),
      );
    }
  }, [itemId]);

  const handleCancelButtonClick = () => {
    navigate("/");
  };

  const handleSubmitEditForm: MouseEventHandler<HTMLButtonElement> = (e: MouseEvent<HTMLButtonElement>) => {
    let promise: AxiosPromise<void>;
    if (itemId === 0) {
      promise = callDataApi<void>((baseUrl) => api.RadarApiFactory(undefined, baseUrl).radarPost(radar));
    } else {
      promise = callDataApi<void>((baseUrl) => api.RadarApiFactory(undefined, baseUrl).radarIdPut(itemId, radar));
    }
    promise
      .then(() => {
        dispatch(fetchRadarList(true));
        navigate("/");
      })
      .catch((e) => handleApiError(e, setErrors));
    e.preventDefault();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-md">
        <form className="space-y-6" noValidate>
          <h4 className="text-2xl font-bold mb-6">{radar.id === 0 ? "New" : "Edit"} Radar</h4>

          <div className="space-y-2">
            <label htmlFor="txtTitle" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <InputText
              id="txtTitle"
              name="title"
              value={radar.title ?? ""}
              onChange={(e) => setLocalRadar({ ...radar, title: e.target.value })}
              className={`w-full ${errors["Title"] ? "p-invalid" : ""}`}
              placeholder="Enter radar title"
            />
            {errors["Title"] && <div className="text-red-500 text-sm">{errors["Title"]}</div>}
          </div>

          <div className="space-y-2">
            <label htmlFor="txtDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <InputText
              id="txtDescription"
              value={radar.description ?? ""}
              onChange={(e) => setLocalRadar({ ...radar, description: e.target.value })}
              className="w-full"
              placeholder="Enter radar description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="pickerBackground" className="block text-sm font-medium text-gray-700">
                Background Color
              </label>
              <ColorPicker
                id="pickerBackground"
                color={radar.backgroundColor}
                onColorChange={(e: string) => setLocalRadar({ ...radar, backgroundColor: e })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pickerGrid" className="block text-sm font-medium text-gray-700">
                Grid Line Color
              </label>
              <ColorPicker
                id="pickerGrid"
                color={radar.gridlineColor}
                onColorChange={(e: string) => setLocalRadar({ ...radar, gridlineColor: e })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pickerInactive" className="block text-sm font-medium text-gray-700">
                Inactive Color
              </label>
              <ColorPicker
                id="pickerInactive"
                color={radar.inactiveColor}
                onColorChange={(e: string) => setLocalRadar({ ...radar, inactiveColor: e })}
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-6">
            <Button
              type="button"
              label="Save"
              icon="pi pi-check"
              className="p-button-primary"
              onClick={handleSubmitEditForm}
            />
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={handleCancelButtonClick}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
