import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "react-modal";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState("/default-profile.png");
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedProfilePicture = localStorage.getItem("userProfilePicture") || "/default-profile.png";

    setIsLoggedIn(storedIsLoggedIn);
    setUserProfilePicture(storedProfilePicture);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const logout = () => {
    setIsLoggedIn(false);
    setUserProfilePicture("/default-profile.png");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userProfilePicture");
    closeModal();
  };

  const loginSuccess = () => {
    setIsLoggedIn(true);
    setUserProfilePicture("/pfp.png");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userProfilePicture", "/pfp.png");
  };

  const goToLoginPage = () => {
    router.push("/login");
  };

  if (!mounted) return null;

  return (
    <>
      <nav className="flex justify-between pl-4 pr-4 bg-gray-50 items-center w-full h-[64px]">
        <div className="flex items-center">
          <Image
            className="mx-4 cursor-pointer"
            src="/finallogoround.png"
            alt="logo"
            width={35}
            height={35}
            priority
          />
          <p className="text-gray-700 text-lg font-bold tracking-tightest font-sans">R.E.A.C.H</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center justify-between gap-2 m-1">
            <div className="text-gray-600 p-3 px-6 text-sm tracking-wider font-semibold hover:bg-neutral-300 hover:rounded-md hover:shadow-md cursor-pointer">
              Map
            </div>
            <div className="text-gray-600 p-3 px-4 text-sm tracking-wider font-semibold hover:bg-gray-300 hover:rounded-md hover:shadow-md cursor-pointer">
              Guidelines
            </div>
          </div>

          {isLoggedIn ? (
            <Image
              className="rounded-lg m-2 cursor-pointer"
              src={userProfilePicture}
              alt="profile"
              width={30}
              height={30}
              onClick={openModal}
            />
          ) : (
            <button
              onClick={goToLoginPage}
              className="text-gray-600 p-3 px-6 text-sm tracking-wider font-semibold hover:bg-neutral-300 hover:rounded-md hover:shadow-md cursor-pointer"
            >
              Login / Register
            </button>
          )}
        </div>
      </nav>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Settings"
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
        className="absolute right-0 top-1/13 w-64 bg-white shadow-lg rounded-md p-4 z-50"
        overlayClassName="fixed inset-0 bg-transparent"
      >
        <div className="modal-content">
          <h2 className="text-lg font-bold mb-2 text-black">User</h2>
          <div className="text-gray-700 cursor-pointer mx-4">
            <div>Profile</div>
            <div>Certifications</div>
            <div>Activity History</div>
            <div>Event Codes</div>
            <div>Feedback and Community</div>
            <div>Redeem Gifts</div>
          </div>

          <h2 className="text-lg font-bold mb-2 mt-2 text-black">Settings</h2>
          <div className="text-gray-700 cursor-pointer mx-4">
            <div>Notification</div>
            <div>App Customization</div>
            <div>Device Integration</div>
            <div>Account Management</div>
            <div>Feedback and Community</div>
            <div>Legal and Policies</div>
          </div>
          
          <div className="flex justify-between">
          <button
            onClick={logout}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
          <button
            onClick={closeModal}
            className="mt-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
          >
            Close
          </button>
          </div>
        </div>
      </Modal>

      {!isLoggedIn && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={loginSuccess}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Simulate Login Success
          </button>
        </div>
      )}
    </>
  );
}

export default Header;


