import React, { useEffect } from "react";
import * as api from "../../api/Data";
import { Link, useParams } from "react-router-dom";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../store/hooks";
import { RootState } from "../../store/store";
import { fetchRadarList } from "../../store/slices/RadarListSlice";
import { fetchRadarRingList } from "../../store/slices/RadarRingListSlice";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export const RingList: React.FunctionComponent = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const routeParams = useParams();
  const radarId = parseInt(routeParams.id ?? "0");

  useEffect(() => {
    dispatch(fetchRadarRingList(radarId));
  }, [dispatch, radarId]);

  const { radars } = useSelector((state: RootState) => state.radarlist);

  const { rings } = useSelector((state: RootState) => state.ringlist);

  const radar = radars.find((r: api.Radar) => r.id === radarId);

  useEffect(() => {
    if (!radar) {
      dispatch(fetchRadarList());
    }
  }, [dispatch, radar]);

  const actionsTemplate = (ring: api.RadarArc) => {
    return (
      <Link to={`/arc/${ring.id}/`}>
        <Button
          icon={<FontAwesomeIcon icon={faEdit} />}
          className="p-button-text p-button-sm"
          tooltip="Edit Ring"
          tooltipOptions={{ position: "top" }}
        />
      </Link>
    );
  };

  const headerTemplate = () => {
    return (
      <div className="flex justify-between items-center">
        <span>Actions</span>
        <Link to={`/radar/${radarId}/newarc`}>
          <Button
            icon={<FontAwesomeIcon icon={faPlus} />}
            className="p-button-text p-button-sm"
            tooltip="Add New Ring"
            tooltipOptions={{ position: "top" }}
          />
        </Link>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4">
      <Card>
        <DataTable value={rings} stripedRows showGridlines scrollable emptyMessage="No rings found">
          <Column field="name" header="Name" sortable />
          <Column field="position" header="Position" sortable />
          <Column body={actionsTemplate} header={headerTemplate} style={{ width: "10rem" }} />
        </DataTable>
      </Card>
    </div>
  );
};

export default RingList;
