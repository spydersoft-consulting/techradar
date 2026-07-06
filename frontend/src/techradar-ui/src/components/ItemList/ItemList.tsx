import React, { useEffect } from "react";
import * as api from "../../api/Data";
import { Link, useParams } from "react-router-dom";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useSelector } from "react-redux";
import { IValidationErrorResult, callDataApi, getErrorMessages } from "../../utils/ApiFunctions";
import { RootState } from "../../store/store";
import { useAppDispatch } from "../../store/hooks";
import { fetchRadarList } from "../../store/slices/RadarListSlice";
import { fetchRadarRingList } from "../../store/slices/RadarRingListSlice";
import { updateFilter, fetchItemList } from "../../store/slices/ItemListSlice";
import { confirmAlert } from "react-confirm-alert";
import { fetchRadarQuadrantList } from "../../store/slices/RadarQuadrantListSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt, faEdit } from "@fortawesome/free-solid-svg-icons";
import { AxiosError } from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";

export const ItemList: React.FunctionComponent = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const radarId = parseInt(id ?? "0");

  const { radars } = useSelector((state: RootState) => state.radarlist);

  const { ringlist, quadlist } = useSelector((state: RootState) => state);

  const { selectedArcId, selectedQuadrantId, items } = useSelector((state: RootState) => state.itemlist);

  const radar = radars.find((r: api.Radar) => r.id === radarId);

  useEffect(() => {
    if (!radar) {
      dispatch(fetchRadarList());
    }
  }, [dispatch, radar]);

  useEffect(() => {
    if (ringlist.radarId !== radarId || quadlist.radarId !== radarId) {
      dispatch(updateFilter({ arc: 0, quadrant: 0 }));
    }
  }, [dispatch, ringlist.radarId, quadlist.radarId, radarId]);

  useEffect(() => {
    if (!ringlist.rings || ringlist.rings.length === 0 || ringlist.radarId !== radarId) {
      dispatch(fetchRadarRingList(radarId));
    }

    if (!quadlist.quadrants || quadlist.quadrants.length === 0 || quadlist.quadrants[0].radarId !== radarId) {
      dispatch(fetchRadarQuadrantList(radarId));
    }
  }, [dispatch, ringlist.rings, ringlist.radarId, quadlist.quadrants, quadlist.radarId, radarId]);

  useEffect(() => {
    dispatch(fetchItemList(radarId, selectedArcId, selectedQuadrantId));
  }, [dispatch, radarId, selectedArcId, selectedQuadrantId]);

  const performDelete = (id: number): void => {
    callDataApi((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemIdDelete(id))
      .then(() => dispatch(fetchItemList(radarId, selectedArcId, selectedQuadrantId)))
      .catch((e) => handleError("Error deleting item", e));
  };

  const handleDeleteItem = (id: number): void => {
    if (id <= 0) {
      return;
    }

    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this item?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            performDelete(id);
          },
        },
        {
          label: "No",
          onClick: () => {
            console.log("No action");
          },
        },
      ],
    });
  };

  const handleError = (titleMessage: string, e: Error | AxiosError<IValidationErrorResult>): void => {
    const errors = getErrorMessages(e);
    confirmAlert({
      title: titleMessage,
      message: errors["message"].join(":") ?? "Unknown Error",
      buttons: [
        {
          label: "Ok",
        },
      ],
    });
  };

  const handleQuadrantChange = (e: { value: number }): void => {
    const newQuadrant = e.value;
    dispatch(updateFilter({ arc: selectedArcId, quadrant: newQuadrant }));
  };

  const handleArcChange = (e: { value: number }): void => {
    const newArc = e.value;
    dispatch(updateFilter({ arc: newArc, quadrant: selectedQuadrantId }));
  };

  const keyTemplate = (rowData: api.RadarItem) => {
    if (rowData.legendKey) {
      return <span>{rowData.legendKey}</span>;
    }
    return <i className="text-gray-500">No Key Defined</i>;
  };

  const actionsTemplate = (rowData: api.RadarItem) => {
    return (
      <div className="flex gap-2">
        <Link to={`/item/${rowData.id}/`}>
          <Button
            icon={<FontAwesomeIcon icon={faEdit} />}
            className="p-button-text p-button-sm"
            tooltip="Edit Item"
            tooltipOptions={{ position: "top" }}
          />
        </Link>
        <Button
          icon={<FontAwesomeIcon icon={faTrashAlt} />}
          className="p-button-text p-button-sm"
          severity="danger"
          onClick={() => handleDeleteItem(rowData.id ?? 0)}
          tooltip="Delete Item"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const headerTemplate = () => {
    return (
      <div className="flex justify-between items-center">
        <span>Actions</span>
        <Link to={`/radar/${radarId}/newitem`}>
          <Button
            icon={<FontAwesomeIcon icon={faPlus} />}
            className="p-button-text p-button-sm"
            tooltip="Add New Item"
            tooltipOptions={{ position: "top" }}
          />
        </Link>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4">
      <Card>
        <h4 className="text-2xl font-bold mb-6">
          Radar Items - <small className="text-gray-500">{radar?.title ?? "unknown"}</small>
        </h4>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="field">
              <label htmlFor="cmbQuadrant" className="block text-sm font-medium mb-2">
                Quadrant
              </label>
              <Dropdown
                id="cmbQuadrant"
                value={selectedQuadrantId}
                onChange={handleQuadrantChange}
                options={[{ label: "", value: 0 }, ...quadlist.quadrants.map((x) => ({ label: x.name, value: x.id }))]}
                placeholder="Select a Quadrant"
                className="w-full"
              />
            </div>
            <div className="field">
              <label htmlFor="cmbArc" className="block text-sm font-medium mb-2">
                Arc
              </label>
              <Dropdown
                id="cmbArc"
                value={selectedArcId}
                onChange={handleArcChange}
                options={[
                  { label: "", value: 0 },
                  ...ringlist.rings.map((x: api.RadarArc) => ({ label: x.name, value: x.id })),
                ]}
                placeholder="Select a Ring"
                className="w-full"
              />
            </div>
          </div>
        </div>
        <DataTable value={items} stripedRows showGridlines scrollable emptyMessage="No items found">
          <Column field="legendKey" header="Key" body={keyTemplate} sortable />
          <Column field="name" header="Name" sortable />
          <Column body={actionsTemplate} header={headerTemplate} style={{ width: "10rem" }} />
        </DataTable>
      </Card>
    </div>
  );
};
