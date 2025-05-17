const { default: axios } = require("axios");

const getGooglePlaces=(category,radius)=>{
    return axios.get('/api/search-category?'+
'category='+category+'&radius='+radius+'&lat=38.6280278&lng=-90.1910154')}

export default{
    getGooglePlaces
}