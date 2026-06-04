import { Atom } from "react-loading-indicators";
import React from "react";

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <Atom color="#a78bfa" size="large" />
    </div>
  );
}

export default Loader;
