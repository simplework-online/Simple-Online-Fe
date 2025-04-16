import React from "react";
import { useFirebase } from "@/context/useFirebase";
import GigCardMessage from "../Cards/GigCardMessage";
import { extractUserDataAsLabelValue } from "@/utils/getKeyUserData";
import { useState } from "react";
import { useEffect } from "react";
import { GetUserByID } from "@/Api_Requests/Api_Requests";
const adminFirebaseUid = "67aa3de2327788caeb170964";

const ChatProfileSection = () => {
  const { users, selectedUser, setSelectedUser } = useFirebase();
  const [profileDetails, setProfileDetails] = useState([]);
  const [profileData, setProfileData] = useState([]);

  useEffect(() => {
    if (profileData) {
      const formattedData = extractUserDataAsLabelValue(profileData);
      setProfileDetails(formattedData);
    }
  }, [selectedUser]); // Re-run effect when selectedUser changes

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await GetUserByID(selectedUser?._id || selectedUser?.id);
        setProfileData(res.data.user);
      } catch (err) {
        console.log(err);
      }
    };

    if (selectedUser?._id || selectedUser?.id) {
      fetchUser();
    }
  }, [selectedUser]);


  const chatWithSupport = () => {
    const adminUser = users.find((user) => user.uid === adminFirebaseUid);
    setSelectedUser(adminUser);
  };

  return (
    <div className="w-1/4 p-6 rounded-lg text-white pt-0">
      <h2 className="text-2xl font-semibold mb-4">
        About {selectedUser?.username}
      </h2>
      <div className="space-y-2 text-sm">
        {profileDetails.map(({ label, value }, index) => (
          <p key={index} className="flex justify-between pr-6">
            <span className="text-gray-300">{label}</span>
            <span className="font-semibold">{value}</span>
          </p>
        ))}
      </div>
      <button
        className="mt-6 px-6 bg-gradient-to-r from-pink-500 to-purple-600 py-2 rounded-full font-normal mb-[5rem]"
        onClick={chatWithSupport}
      >
        Support
      </button>
      {/* <img src={gigChat} alt="gig" className="mt-4 w-[90%]" /> */}
      <GigCardMessage />
    </div>
  );
};

export default ChatProfileSection;
