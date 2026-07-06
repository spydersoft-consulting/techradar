import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { RadarList } from "./RadarList/RadarList";
import { RadarEditor } from "./RadarEditor/RadarEditor";
import { ItemList } from "./ItemList/ItemList";
import { ItemEditor } from "./ItemEditor/ItemEditor";
import RingList from "./RingList/RingList";
import { RingEditor } from "./RingEditor/RingEditor";
import { QuadrantEditor } from "./QuadrantEditor/QuadrantEditor";
import { QuadrantList } from "./QuadrantList/QuadrantList";
import { RadarViewer } from "./RadarViewer/RadarViewer";
import EditorLayout from "../layouts/Editor";
import ViewLayout from "../layouts/View";

export const AppRouter = () => (
  <Router basename={"/"}>
    <Routes>
      <Route element={<EditorLayout />}>
        <Route path={`/`} element={<RadarList />} />
        <Route path={`/radar/`} element={<RadarEditor />} />
        <Route path={`/radar/:id`} element={<RadarEditor />} />
        <Route path={`/radar/:id/items`} element={<ItemList />} />
        <Route path={`/radar/:radarId/newitem`} element={<ItemEditor />} />
        <Route path={`/item/:id`} element={<ItemEditor />} />
        <Route path={`/radar/:id/arcs`} element={<RingList />} />
        <Route path={`/radar/:radarId/newArc`} element={<RingEditor />} />
        <Route path={`/arc/:id`} element={<RingEditor />} />
        <Route path={`/radar/:id/quadrants`} element={<QuadrantList />} />
        <Route path={`/quadrant/:id`} element={<QuadrantEditor />} />
      </Route>
      <Route element={<ViewLayout />}>
        <Route path={`/view/:id`} element={<RadarViewer />} />
      </Route>
    </Routes>
  </Router>
);
