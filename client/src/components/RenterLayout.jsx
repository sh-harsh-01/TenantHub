import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from "react-bootstrap";
import Header from './Header';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const RenterLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("https://tenanthub-ka34.onrender.com/renter/get-renter-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const userInitials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const handleProfileClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header
        userData={userData}
        profileImage={profileImage}
        userInitials={userInitials}
        handleProfileClick={handleProfileClick}
      />

      <div className="d-flex flex-grow-1">
        <Sidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          userData={userData}
          userInitials={userInitials}
          handleSignOut={handleSignOut}
          handleEditProfileClick={handleProfileClick}
        />

        <main className="flex-grow-1 p-4 bg-light">
          {children}
        </main>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your FullName"
                value={userData?.fullName || ""}
                onChange={(e) =>
                  setUserData({ ...userData, fullName: e.target.value })
                }
              />
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your email"
                value={userData?.email || ""}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
              />
              <Form.Label>Phone No.</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Phone No."
                value={userData?.phone || ""}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary">Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RenterLayout;
