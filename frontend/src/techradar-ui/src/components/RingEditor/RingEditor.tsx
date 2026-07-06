import React, { useState, useEffect, MouseEvent } from "react";
import * as api from "../../api/Data";
import { ColorPicker } from "../ColorPicker/ColorPicker";
import { useAppDispatch } from "../../store/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { callDataApi, handleApiError } from "../../utils/ApiFunctions";
import { AxiosPromise } from "axios";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export const RingEditor: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const routeParams = useParams();

  const dispatch = useAppDispatch();

  const [radarId, setRadarId] = useState<number>(parseInt(routeParams.radarId ?? "0"));
  const routeRingId: number = parseInt(routeParams.id ?? "0");

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [ring, setLocalRing] = useState<api.RadarArc>({
    id: 0,
    radarId: radarId,
    name: "",
    radius: 10,
    color: "#000000",
    position: 0,
  });

  useEffect(() => {
    if (routeRingId > 0) {
      callDataApi((baseUrl) =>
        // todo: implement paging here
        api.ArcApiFactory(undefined, baseUrl).arcIdGet(routeRingId),
      ).then((result) => {
        setLocalRing(result.data);
        setRadarId(result.data.radarId ?? 0);
      });
    }
  }, [dispatch, routeRingId]);

  const handleCancelButtonClick = (): void => {
    navigate(`/radar/${ring.radarId}/arcs/`);
  };

  const handleSubmitEditForm = (e: MouseEvent<HTMLButtonElement>) => {
    let promise: AxiosPromise<void>;
    if (!routeRingId) {
      promise = callDataApi<void>((baseUrl) => api.ArcApiFactory(undefined, baseUrl).arcPost(ring));
    } else {
      promise = callDataApi<void>((baseUrl) => api.ArcApiFactory(undefined, baseUrl).arcIdPut(routeRingId, ring));
    }
    promise.then(() => navigate(`/radar/${ring.radarId}/arcs/`)).catch((e) => handleApiError(e, setErrors));

    e.preventDefault();
  };

  return (
    <div className="container mx-auto px-4">
      <Card>
        <form className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="field">
              <label htmlFor="txtName" className="block text-sm font-medium mb-2">
                Name
              </label>
              <InputText
                id="txtName"
                value={ring.name}
                onChange={(e) => setLocalRing({ ...ring, name: e.target.value })}
                className={`w-full ${errors["Name"] != null ? "p-invalid" : ""}`}
              />
              {errors["Name"] && <small className="p-error">{errors["Name"]}</small>}
            </div>
            <div className="field">
              <label htmlFor="txtRadius" className="block text-sm font-medium mb-2">
                Radius
              </label>
              <InputNumber
                id="txtRadius"
                value={ring.radius}
                onValueChange={(e) => setLocalRing({ ...ring, radius: e.value ?? 0 })}
                className={`w-full ${errors["Radius"] != null ? "p-invalid" : ""}`}
                min={1}
              />
              {errors["Radius"] && <small className="p-error">{errors["Radius"]}</small>}
            </div>
            <div className="field">
              <label htmlFor="txtPosition" className="block text-sm font-medium mb-2">
                Position
              </label>
              <InputNumber
                id="txtPosition"
                value={ring.position}
                onValueChange={(e) => setLocalRing({ ...ring, position: e.value ?? 0 })}
                className={`w-full ${errors["Position"] != null ? "p-invalid" : ""}`}
                min={0}
              />
              {errors["Position"] && <small className="p-error">{errors["Position"]}</small>}
            </div>
            <div className="field">
              <label htmlFor="pickerColor" className="block text-sm font-medium mb-2">
                Color
              </label>
              <ColorPicker
                id="pickerColor"
                className={`form-control ${errors["Color"] == null ? "" : "is-invalid"}`}
                color={ring.color}
                onColorChange={(e: string) => setLocalRing({ ...ring, color: e })}
              />
              {errors["Color"] && <small className="p-error">{errors["Color"]}</small>}
            </div>
          </div>
          <div className="flex justify-center gap-2 pt-4">
            <Button label="Save" icon="pi pi-save" onClick={handleSubmitEditForm} />
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              onClick={handleCancelButtonClick}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
