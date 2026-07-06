import React from "react";
import { NavigationBar } from "../components/NavigationBar/NavigationBar";
import { Outlet } from "react-router-dom";

const EditorLayout: React.FunctionComponent = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavigationBar brand="Tech Radar"></NavigationBar>
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </main>
  );
};
export default EditorLayout;
