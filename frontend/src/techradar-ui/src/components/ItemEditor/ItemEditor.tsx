import React, { useState, useEffect, useCallback, MouseEvent } from "react";
import * as api from "../../api/Data";
import { ItemNotesList } from "../ItemNotesList/ItemNotesList";
import { WithContext as ReactTags, Tag } from "react-tag-input";
import { useNavigate, useParams } from "react-router-dom";
import { callDataApi, handleApiError } from "../../utils/ApiFunctions";
import { AxiosError, AxiosPromise } from "axios";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../store/hooks";
import { RootState } from "../../store/store";
import { fetchRadarRingList } from "../../store/slices/RadarRingListSlice";
import { fetchRadarQuadrantList } from "../../store/slices/RadarQuadrantListSlice";
import { fetchRadarTags } from "../../store/slices/RadarTagSlice";
import { fetchRadarList } from "../../store/slices/RadarListSlice";
import { UiTag } from "../../types/objects";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

export const ItemEditor: React.FunctionComponent = () => {
  // Constants
  const navigate = useNavigate();
  const routeParams = useParams();

  const dispatch = useAppDispatch();

  // Route extraction
  const routeItemId: number = parseInt(routeParams.id ?? "0");

  const [radarId, setRadarId] = useState<number>(parseInt(routeParams.radarId ?? "0"));

  // Local State
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [item, setLocalItem] = useState<api.RadarItem>({
    id: routeItemId,
    radarId: radarId,
  });
  const [itemTags, setItemTags] = useState<Tag[]>();

  // Redux State Retrieval
  const { radars } = useSelector((state: RootState) => state.radarlist);

  const { rings } = useSelector((state: RootState) => state.ringlist);

  const { quadrants } = useSelector((state: RootState) => state.quadlist);

  const { radarTags } = useSelector((state: RootState) => state.radartags);

  const LoadItemTags = useCallback(() => {
    callDataApi((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemIdTagGet(routeItemId)).then((result) => {
      const itemTags: Tag[] = [];

      result.data.forEach((itemTag: api.RadarItemTag) => {
        const tag = radarTags.find((suggestion: UiTag) => {
          return suggestion.tagId === itemTag.tagId;
        });

        if (tag != null) {
          itemTags.push({
            id: tag.id,
            text: tag.text,
            className: "",
          });
        }
      });
      setItemTags(itemTags);
    });
  }, [routeItemId, radarTags]);

  const radar = radars.find((r: api.Radar) => r.id === radarId);
  useEffect(() => {
    if (!radar && radarId > 0) {
      dispatch(fetchRadarList());
    }
  }, [dispatch, radar, radarId]);

  // UseEffect calls
  useEffect(() => {
    if (routeItemId > 0) {
      callDataApi((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemIdGet(routeItemId)).then((result) => {
        setLocalItem(result.data);
        setRadarId(result.data.radarId ?? 0);
      });

      LoadItemTags();
    }
  }, [dispatch, routeItemId, LoadItemTags]);

  useEffect(() => {
    if (!rings || rings.length === 0) {
      dispatch(fetchRadarRingList(radarId));
    }
    if (!quadrants || quadrants.length === 0) {
      dispatch(fetchRadarQuadrantList(radarId));
    }
  }, [dispatch, radarId, rings, quadrants]);

  useEffect(() => {
    dispatch(fetchRadarTags(radarId));
  }, [dispatch, radarId]);

  // Action Handlers
  const handleCancelButtonClick = (): void => {
    navigate(`/radar/${item.radarId}/items/`);
  };

  const handleSubmitEditForm = (e: MouseEvent<HTMLButtonElement>): void => {
    let promise: AxiosPromise<void>;
    if (routeItemId === 0) {
      promise = callDataApi<void>((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemPost(item));
    } else {
      promise = callDataApi<void>((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemIdPut(routeItemId, item));
    }

    promise
      .then(() => {
        navigate(`/radar/${item.radarId}/items/`);
      })
      .catch((e: Error | AxiosError) => handleApiError(e, setErrors));

    e.preventDefault();
  };

  const handleDeleteItemTag = (i: number): void => {
    if (itemTags == null) {
      return;
    }
    const deletedItem = itemTags[i];
    const itemId = parseInt(deletedItem.id);
    if (itemId > 0) {
      callDataApi((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemIdTagTagIdDelete(item.id ?? 0, itemId)).then(
        () => LoadItemTags(),
      );
    }
  };

  const handleAddItemTag = (tag: Tag): void => {
    const suggestion = radarTags.find((sugg: UiTag) => {
      return sugg.text === tag.text;
    });

    if (suggestion != null) {
      const tagData: api.ItemTag = {
        tagId: suggestion.tagId,
      };

      callDataApi((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemIdTagPut(item.id ?? 0, tagData)).then(() =>
        LoadItemTags(),
      );
    } else {
      const tagData: api.ItemTag = {
        name: tag.text,
      };
      callDataApi((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemIdTagPost(item.id ?? 0, tagData)).then(() =>
        dispatch(fetchRadarTags(item.radarId ?? 0)),
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="shadow-md">
        <form className="space-y-6" noValidate>
          <h4 className="text-2xl font-bold mb-6">
            Radar Item - <small className="text-gray-500">{radar?.title ?? "unknown"}</small>
          </h4>
          <div className="space-y-2">
            <label htmlFor="txtName" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <InputText
              id="txtName"
              value={item.name ?? ""}
              onChange={(e) => setLocalItem({ ...item, name: e.target.value })}
              className={`w-full ${errors["Name"] ? "p-invalid" : ""}`}
              placeholder="Enter item name"
            />
            {errors["Name"] && <div className="text-red-500 text-sm">{errors["Name"]}</div>}
          </div>
          <div className="space-y-2">
            <label htmlFor="txtKey" className="block text-sm font-medium text-gray-700">
              Legend Key
            </label>
            <InputText
              id="txtKey"
              value={item.legendKey ?? ""}
              onChange={(e) => setLocalItem({ ...item, legendKey: e.target.value })}
              className={`w-full ${errors["LegendKey"] ? "p-invalid" : ""}`}
              placeholder="Enter legend key"
            />
            {errors["LegendKey"] && <div className="text-red-500 text-sm">{errors["LegendKey"]}</div>}
          </div>
          <div className="space-y-2">
            <label htmlFor="txtUrl" className="block text-sm font-medium text-gray-700">
              Url
            </label>
            <InputText
              id="txtUrl"
              value={item.url ?? ""}
              onChange={(e) => setLocalItem({ ...item, url: e.target.value })}
              className={`w-full ${errors["Url"] ? "p-invalid" : ""}`}
              placeholder="Enter URL"
            />
            {errors["Url"] && <div className="text-red-500 text-sm">{errors["Url"]}</div>}
          </div>
          <div className="space-y-2">
            <label htmlFor="cmbQuadrant" className="block text-sm font-medium text-gray-700">
              Quadrant
            </label>
            <Dropdown
              id="cmbQuadrant"
              value={item.quadrantId}
              onChange={(e) => setLocalItem({ ...item, quadrantId: e.value })}
              options={[
                { label: "Select a quadrant", value: 0 },
                ...quadrants.map((x) => ({ label: x.name, value: x.id })),
              ]}
              placeholder="Select a quadrant"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cmbArc" className="block text-sm font-medium text-gray-700">
              Arc
            </label>
            <Dropdown
              id="cmbArc"
              value={item.arcId}
              onChange={(e) => setLocalItem({ ...item, arcId: e.value })}
              options={[
                { label: "Select a ring", value: 0 },
                ...rings.map((x: api.RadarArc) => ({ label: x.name, value: x.id })),
              ]}
              placeholder="Select an arc"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="border border-gray-300 rounded-md p-2">
              <ReactTags
                id="tagControl"
                tags={itemTags?.map((tag) => {
                  return { id: tag.id, text: tag.text, className: "" };
                })}
                suggestions={radarTags.map((tag) => {
                  return { id: tag.id, text: tag.text, className: "" };
                })}
                handleDelete={handleDeleteItemTag}
                handleAddition={handleAddItemTag}
                delimiters={delimiters}
                allowDragDrop={false}
                inputFieldPosition="bottom"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="txtNote" className="block text-sm font-medium text-gray-700">
              Add Note
            </label>
            <InputTextarea
              id="txtNote"
              value={item.note ?? ""}
              onChange={(e) => setLocalItem({ ...item, note: e.target.value })}
              className={`w-full ${errors["Note"] ? "p-invalid" : ""}`}
              rows={4}
              placeholder="Enter note"
            />
            {errors["Note"] && <div className="text-red-500 text-sm">{errors["Note"]}</div>}
          </div>
          <div className="flex space-x-4">
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
          <ItemNotesList radarItemId={item.id ?? 0} />
        </form>
      </Card>
    </div>
  );
};
