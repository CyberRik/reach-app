const { default: axios } = require("axios");

const getGooglePlaces = (category, radius) => {
  const resources = ['Hospitals', "Fire-Equipment", "Medical-Equipment"];
  const params = `category=${category}&radius=${radius}&lat=38.6280278&lng=-90.1910154`;

  if (category === "Hospitals") {
    return axios.get(`/api/search-category?${params}`);
  } else if (resources.includes(category)) {
    return axios.get(`/api/random?${params}`);
  } else {
    return axios.get(`/api/alerts?${params}`);
  }
};

export default {
  getGooglePlaces
};
