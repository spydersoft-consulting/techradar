import React, { useEffect } from "react";

import { useSelector } from "react-redux";
import { useAppDispatch } from "../../store/hooks";
import * as api from "../../api/Data";
import { Link, useParams } from "react-router-dom";
import "react-confirm-alert/src/react-confirm-alert.css";
import { RootState } from "../../store/store";
import { fetchRadarList } from "../../store/slices/RadarListSlice";
import { fetchRadarQuadrantList } from "../../store/slices/RadarQuadrantListSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export const QuadrantList: React.FunctionComponent = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const routeParams = useParams();
  const radarId = parseInt(routeParams.id ?? "0");

  useEffect(() => {
    dispatch(fetchRadarQuadrantList(radarId));
  }, [dispatch, radarId]);

  const { radars } = useSelector((state: RootState) => state.radarlist);

  const { quadrants } = useSelector((state: RootState) => state.quadlist);

  const radar = radars.find((r: api.Radar) => r.id === radarId);

  useEffect(() => {
    if (!radar) {
      dispatch(fetchRadarList());
    }
  }, [dispatch, radar]);

  const actionsTemplate = (quadrant: api.Quadrant) => {
    return (
      <Link to={`/quadrant/${quadrant.id}/`}>
        <Button
          icon={<FontAwesomeIcon icon={faEdit} />}
          className="p-button-text p-button-sm"
          tooltip="Edit Quadrant"
          tooltipOptions={{ position: "top" }}
        />
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4">
      <Card>
        <DataTable value={quadrants} stripedRows showGridlines scrollable emptyMessage="No quadrants found">
          <Column field="name" header="Name" sortable />
          <Column field="position" header="Position" sortable />
          <Column body={actionsTemplate} header="Actions" style={{ width: "8rem" }} />
        </DataTable>
      </Card>
    </div>
  );
};
