import React, { useState } from "react";
import Image from "next/image";
import Modal from "react-modal";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <nav className="flex justify-between pl-4 pr-8 bg-gray-50 items-center">
        <div className="flex items-center m-3">
          <Image
            className="mx-4"
            src="/finallogoround.png"
            alt="logo"
            width={35}
            height={35}
            priority
          />
          <p className="text-gray-700 text-lg font-bold tracking-tightest font-sans">
            R.E.A.C.H
          </p>
        </div>
        <div className="flex items-center justify-between w-100">
          <div className="flex items-center justify-between w-55 m-1">
            <div className="text-gray-600 p-3 px-6 text-sm tracking-wider font-semibold hover:bg-neutral-300 hover:rounded-md hover:shadow-md cursor-pointer">
              Map
            </div>
            <div className="text-gray-600 p-3 px-4 text-sm tracking-wider font-semibold hover:bg-gray-300 hover:rounded-md hover:shadow-md cursor-pointer">
              Guidelines
            </div>
          </div>
          <Image
            className="rounded-lg m-2 cursor-pointer"
            src="/pfp.png"
            alt="profile"
            width={30}
            height={30}
            onClick={openModal}
          />
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
          <button onClick={closeModal} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md">Close</button>
        </div>
      </Modal>
    </>
  );
}

export default Header;
