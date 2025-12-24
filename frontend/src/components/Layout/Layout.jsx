import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import PdfPng from "../../pages/PdfPng";
import ImageWebp from "../../pages/ImageWbp";
import RemoveBg from "../../pages/RemoveBg";
import "./Layout.css";

const Layout = () => {
  const [activeTab, setActiveTab] = useState("pdf-to-png");

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "pdf-to-png":
        return <PdfPng />;
      case "image-to-webp":
        return <ImageWebp />;
      case "remove-bg":
        return <RemoveBg />;
      default:
        return <PdfPng />;
    }
  };

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="main-content">{renderContent()}</main>
    </div>
  );
};

export default Layout;
