import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBolt, FaMoneyBillWave, FaShieldAlt } from "react-icons/fa";
import { MdHome } from "react-icons/md";
import Loader from "./Loader";

const RenterHome = () => {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);

  const handleNavigate = () => {
    setShowLoader(true);
    const timer = setTimeout(() => {
      setShowLoader(false);
      navigate("/login");
    }, 1000);
  };
  return showLoader ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Loader />
    </div>
  ) : (
    <div
      className="position-relative"
      style={{ minHeight: "100vh" }}
    >
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", minHeight: "100vh", position: "relative", zIndex: 0 }}
      >
        {/* Hero Section */}
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center py-5"
          style={{ minHeight: "80vh", color: "#fff" }}
        >
          <h1 className="display-2 fw-bold animate__animated animate__fadeInDown">
            Rental System
          </h1>
          <p className="lead fs-4 mb-4 animate__animated animate__fadeInUp animate__delay-1s">
            Your complete rent & electricity manager – simple, smart, secure.
          </p>
          <button
            className="btn btn-outline-light btn-lg px-5 rounded-pill shadow animate__animated animate__fadeInUp animate__delay-2s"
            onClick={handleNavigate}
          >
            Login/ Sign Up
          </button>
        </div>

        {/* Features Section */}
        <div className="container my-5 text-white">
          <div className="row text-center">
            <h2 className="mb-5 fw-bold animate__animated animate__fadeInUp text-white">
              Why Choose Us?
            </h2>

            {[
              {
                icon: <MdHome size={40} className="mb-3 text-success" />,
                title: "Room Rent",
                desc: "Track and pay room rent with ease.",
              },
              {
                icon: <FaBolt size={40} className="mb-3 text-warning" />,
                title: "Electricity Bill",
                desc: "Pay and monitor your electricity bills.",
              },
              {
                icon: <FaMoneyBillWave size={40} className="mb-3 text-info" />,
                title: "One-click Payment",
                desc: "Make fast, secure payments online.",
              },
              {
                icon: <FaShieldAlt size={40} className="mb-3 text-danger" />,
                title: "Secure Portal",
                desc: "All data is encrypted and protected.",
              },
            ].map((item, i) => (
              <div className="col-md-3 mb-4" key={i}>
                <div
                  className={`bg-dark bg-opacity-50 p-4 rounded shadow h-100 animate__animated animate__fadeInUp animate__delay-${
                    i + 2
                  }s`}
                >
                  {item.icon}
                  <h5 className="text-white">{item.title}</h5>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-light bg-dark bg-opacity-75">
          <p className="mb-1">© 2025 Sharma's Renter System</p>
          <small>
            Email: support@sharmarentals.com | Phone: +91 98765 XXXXX
          </small>
        </footer>
      </div>
    </div>
  );
};

export default RenterHome;
