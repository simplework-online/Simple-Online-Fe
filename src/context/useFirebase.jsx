import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  addDoc,
  getDocs,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import PropTypes from "prop-types";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { db } from "../../Firebase";
import { useSelector } from "react-redux";
import { GetUserByID } from "@/Api_Requests/Api_Requests";

const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);
const storage = getStorage();

export const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const gigSellerAsSelectedUser = useSelector((state) => state.gig.gigSellerId);

  // Register user and set up listeners when currentUser changes
  useEffect(() => {
    if (!currentUser?._id) return;

    // Function to register a user in Firebase
    const registerUser = async (user) => {
      if (!user?._id) return; // Ensure user exists

      try {
        const userDocRef = doc(db, "users", user._id);
        await setDoc(
          userDocRef,
          {
            uid: user._id,
            username: user.username || user.name || user.email,
            email: user.email,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        await setUserOnlineStatus(user._id, true);
      } catch (error) {
        console.error(`Error registering user ${user._id} in Firebase:`, error);
      }
    };

    // Set up beforeunload listener
    const handleBeforeUnload = () =>
      setUserOnlineStatus(currentUser._id, false);
    window.addEventListener("beforeunload", handleBeforeUnload);

    //

    let unsubscribeMessages; // Declare unsubscribe variable in scope

    const fetchUsersWithChatHistory = () => {
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("participants", "array-contains", currentUser._id)
      );

      unsubscribeMessages = onSnapshot(q, async (snapshot) => {
        const userIds = new Set();
        snapshot.docs.forEach((doc) => {
          const participants = doc.data().participants;
          participants.forEach((id) => {
            if (id !== currentUser._id) {
              userIds.add(id);
            }
          });
        });

        const usersList = [];
        for (const userId of userIds) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            usersList.push({ id: userId, ...userDoc.data() });
          }
        }

        setUsers(usersList);
        fetchLastMessagesForUsers(usersList);
      });
    };

    // Add this new function to your FirebaseProvider component
    const fetchLastMessagesForUsers = async (usersList) => {
      const messagesRef = collection(db, "messages");

      // First, get all messages where current user is a participant
      const q = query(
        messagesRef,
        where("participants", "array-contains", currentUser._id),
        orderBy("createdAt", "desc")
      );

      try {
        const messagesSnap = await getDocs(q);
        const messages = messagesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Create a map to store the latest message for each conversation
        const latestMessagesByUser = {};

        messages.forEach((message) => {
          // Determine the other user in this conversation
          const otherUserId = message.participants.find(
            (id) => id !== currentUser._id
          );

          // Only store the first (latest) message we encounter for each user
          if (!latestMessagesByUser[otherUserId]) {
            latestMessagesByUser[otherUserId] = {
              text: message.type === "voice" ? "Voice message" : message.text,
              createdAt: message.createdAt,
              senderId: message.senderId,
            };
          }
        });

        // Update the users array with the last messages
        setUsers((prevUsers) =>
          prevUsers.map((user) => ({
            ...user,
            lastMessage: latestMessagesByUser[user.id] || null,
          }))
        );
      } catch (error) {
        console.error("Error fetching last messages:", error);
      }
    };

    // Set up status listener
    const statusRef = collection(db, "status");
    const statusUnsubscribe = onSnapshot(statusRef, (snapshot) => {
      const statusData = {};
      snapshot.docs.forEach((doc) => {
        statusData[doc.id] = doc.data().online;
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          online: statusData[user.id] || false,
        }))
      );
    });

    // Execute register for current user
    registerUser(currentUser);
    fetchUsersWithChatHistory(); // Call the function directly

    // If gigSellerAsSelectedUser exists, fetch and register them
    if (gigSellerAsSelectedUser) {
      GetUserByID(gigSellerAsSelectedUser)
        .then(({ data: { user: seller } }) => {
          setSelectedUser(seller); // Set as selected user
          setUsers((prev) => [...prev, seller]); // Add to users list
          registerUser(seller); // Register in Firebase
        })
        .catch((error) =>
          console.error(`Error fetching gigSellerAsSelectedUser:`, error)
        );
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (unsubscribeMessages) unsubscribeMessages();
      if (statusUnsubscribe) statusUnsubscribe();
      setUserOnlineStatus(currentUser._id, false);
    };
  }, [currentUser, gigSellerAsSelectedUser]);

  // Listen for messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !currentUser?._id) return;

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("participants", "array-contains", currentUser._id),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const selectedUserId = selectedUser.id || selectedUser._id;
      const chatMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (msg) =>
            (msg.senderId === currentUser._id &&
              msg.receiverId === selectedUserId) ||
            (msg.senderId === selectedUserId &&
              msg.receiverId === currentUser._id)
        );

      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [currentUser, selectedUser]);

  // Set user online status
  const setUserOnlineStatus = async (userId, isOnline) => {
    if (!userId) return;

    try {
      const userStatusRef = doc(db, "status", userId);
      await setDoc(
        userStatusRef,
        {
          online: isOnline,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  // Send message
  const sendMessage = async (text) => {
    if (!text.trim() || !selectedUser || !currentUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: text.trim(),
        createdAt: serverTimestamp(),
        senderId: currentUser._id,
        senderName:
          currentUser.username || currentUser.name || currentUser.email,
        receiverId: selectedUser?.id || selectedUser?._id,
        participants: [currentUser._id, selectedUser?.id || selectedUser?._id],
      });

      // Update the last message for this user in the users state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          // If this is the user we just messaged
          if (user.id === (selectedUser?.id || selectedUser?._id)) {
            return {
              ...user,
              lastMessage: {
                text: text.trim(),
                createdAt: Timestamp.now(), // Temporary timestamp until Firestore updates
                senderId: currentUser._id,
              },
            };
          }
          return user;
        })
      );

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  };

  // send voice message
  const sendVoiceMessage = async (audioBlob) => {
    if (!audioBlob || !selectedUser || !currentUser) return;

    try {
      // Upload to Firebase Storage
      const fileName = `voice_${currentUser._id}_${Date.now()}.webm`;
      const storageRef = ref(storage, `voice_messages/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, audioBlob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          // Save message reference in Firestore
          await addDoc(collection(db, "messages"), {
            type: "voice",
            voiceUrl: downloadURL,
            duration: 0,
            createdAt: serverTimestamp(),
            senderId: currentUser._id,
            senderName:
              currentUser.username || currentUser.name || currentUser.email,
            receiverId: selectedUser.id || selectedUser._id,
            participants: [
              currentUser._id,
              selectedUser.id || selectedUser._id,
            ],
          });
        }
      );

      return true;
    } catch (error) {
      console.error("Error sending voice message:", error);
      return false;
    }
  };

  const fetchAndSetCurrentUser = useCallback(async (userData) => {
    setCurrentUser(userData);
  }, []);

  // Search messages function
  const searchMessages = async (searchTerm) => {
    if (!searchTerm || !currentUser?._id) return;

    setIsSearching(true);

    try {
      // Get all messages where current user is a participant
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("participants", "array-contains", currentUser._id)
      );

      const messagesSnap = await getDocs(q);

      // Filter messages client-side that contain the search term
      // Note: Firestore doesn't support direct text search, so we fetch and filter
      const matchingMessages = messagesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg => {
          // Check if text message contains search term (case insensitive)
          if (msg.text && typeof msg.text === 'string') {
            return msg.text.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });

      // For each matching message, fetch user details
      const resultsWithUserDetails = await Promise.all(
        matchingMessages.map(async (msg) => {
          const otherUserId = msg.senderId === currentUser._id ? msg.receiverId : msg.senderId;

          // Get user details (check if we already have them in users state first)
          let userDetails = users.find(u => u.id === otherUserId || u._id === otherUserId);

          if (!userDetails) {
            const userDoc = await getDoc(doc(db, "users", otherUserId));
            if (userDoc.exists()) {
              userDetails = { id: otherUserId, ...userDoc.data() };
            } else {
              userDetails = { id: otherUserId, username: "Unknown User" };
            }
          }

          return {
            ...msg,
            userDetails
          };
        })
      );

      setSearchResults(resultsWithUserDetails);
    } catch (error) {
      console.error("Error searching messages:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchResults([]);
  };

  const value = useMemo(
    () => ({
      currentUser,
      users,
      selectedUser,
      messages,
      searchResults,
      isSearching,
      fetchAndSetCurrentUser,
      setSelectedUser,
      sendMessage,
      sendVoiceMessage,
      searchMessages,
      clearSearch,
    }),
    [
      currentUser,
      users,
      selectedUser,
      messages,
      searchResults,
      isSearching,
      fetchAndSetCurrentUser,
      setSelectedUser,
      sendMessage,
      sendVoiceMessage,
      searchMessages,
      clearSearch,
    ]
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Add prop-types validation
FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired, // Ensures children is provided
};
