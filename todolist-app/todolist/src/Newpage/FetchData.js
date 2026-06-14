  import axios from 'axios'
  let getPageData = async () => {
    try {
      let res = await axios.get('http://localhost:3000/getPages')
      return res?.data?.data
    } catch (err) {
      console.log(err);
    }
  }

  export default getPageData