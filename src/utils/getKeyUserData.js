/**
 * Extracts key user data points and formats them as label-value pairs
 * @param {Object} userData - Raw user data object
 * @returns {Array} - Array of objects with label and value properties
 */
export function extractUserDataAsLabelValue(userData) {
  const profileDetails = [];

  // Email
  // profileDetails.push({
  //   label: "Email",
  //   value: userData.email || "No email provided"
  // });

  // Location
  profileDetails.push({
    label: "From",
    value: userData.location || "Unknown location"
  });

  // Join Date - Format to be more readable
  if (userData.createdAt) {
    const joinDate = new Date(userData.createdAt);
    const formattedDate = joinDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
    profileDetails.push({
      label: "Member since",
      value: formattedDate
    });
  } else {
    profileDetails.push({
      label: "Member since",
      value: "Unknown"
    });
  }

  // Service Expertise
  profileDetails.push({
    label: "Expertise",
    value: userData.servicesExperties || "No expertise listed"
  });

  // Languages
  // Assuming languages field might be a string or array
  let languagesValue = userData.languages;
  if (Array.isArray(languagesValue)) {
    // If it's an array, format each language
    languagesValue = languagesValue.join(", ");
  }
  profileDetails.push({
    label: "Languages",
    value: languagesValue || "None specified"
  });

  // Activity Summary - Select the most relevant metric
  const gigCount = Array.isArray(userData.createdGigs) ? userData.createdGigs.length : 0;
  const projectCount = Array.isArray(userData.projects) ? userData.projects.length : 0;
  const favoriteCount = Array.isArray(userData.favouriteGigs) ? userData.favouriteGigs.length : 0;

  profileDetails.push({
    label: "Created Gigs",
    value: gigCount.toString()
  });

  profileDetails.push({
    label: "Completed Projects",
    value: projectCount.toString()
  });

  // Payment Method
  profileDetails.push({
    label: "Payment Method",
    value: userData.payment ? userData.payment.charAt(0).toUpperCase() + userData.payment.slice(1) : "Not specified"
  });

  return profileDetails;
}