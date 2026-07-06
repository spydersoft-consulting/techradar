import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../api/Data";
//import ReactTooltip from 'react-tooltip'
import { fetchRadarList } from "../../store/slices/RadarListSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../store/hooks";
import { RootState } from "../../store/store";
import { useAuth } from "../../context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faWifi, faList, faEye, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export const RadarList: React.FunctionComponent = (): React.JSX.Element => {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { radars, isLoading } = useSelector((state: RootState) => state.radarlist);

  useEffect(() => {
    // Only fetch if we don't have radars and we're not already loading
    if (radars.length === 0 && !isLoading) {
      dispatch(fetchRadarList());
    }
  }, [dispatch, radars.length, isLoading]);

  const actionsTemplate = (radar: api.Radar) => {
    return (
      <div className="flex gap-2">
        {/* <ReactTooltip id="toolTip" /> */}
        {isAuthenticated && (
          <>
            <Button
              icon={<FontAwesomeIcon icon={faEdit} />}
              className="p-button-sm p-button-text"
              tooltip="Edit Radar"
              onClick={() => navigate(`/radar/${radar.id}/`)}
            />
            <Button
              icon={<FontAwesomeIcon icon={faWifi} />}
              className="p-button-sm p-button-text"
              tooltip="Edit Radar Rings"
              onClick={() => navigate(`/radar/${radar.id}/arcs`)}
            />
            <Button
              icon={<FontAwesomeIcon icon={faChartPie} />}
              className="p-button-sm p-button-text"
              tooltip="Edit Radar Quadrants"
              onClick={() => navigate(`/radar/${radar.id}/quadrants`)}
            />
            <Button
              icon={<FontAwesomeIcon icon={faList} />}
              className="p-button-sm p-button-text"
              tooltip="Edit Radar Items"
              onClick={() => navigate(`/radar/${radar.id}/items`)}
            />
          </>
        )}
        <Button
          icon={<FontAwesomeIcon icon={faEye} />}
          className="p-button-sm p-button-text"
          tooltip="View Radar"
          onClick={() => navigate(`/view/${radar.id}`)}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4">
      <Card className="shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Technology Radars</h2>
          {isAuthenticated && (
            <Button
              icon={<FontAwesomeIcon icon={faPlus} />}
              label="Add Radar"
              className="p-button-outlined p-button-sm hidden sm:inline-flex"
              onClick={() => navigate("/radar/")}
            />
          )}
          {isAuthenticated && (
            <Button
              icon={<FontAwesomeIcon icon={faPlus} />}
              className="p-button-outlined p-button-sm sm:hidden"
              onClick={() => navigate("/radar/")}
              tooltip="Add Radar"
              tooltipOptions={{ position: "left" }}
            />
          )}
        </div>
        <DataTable value={radars} className="p-datatable-striped" emptyMessage="No radars found">
          <Column field="title" header="Title" sortable className="font-medium" />
          <Column field="description" header="Description" sortable />
          <Column header="Actions" body={actionsTemplate} className="text-center" style={{ width: "200px" }} />
        </DataTable>
      </Card>
    </div>
  );
};
