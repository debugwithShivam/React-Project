  import api from '../../../services/api'
  let getPageData = async () => {
    try {
      let res = await api.get('/getPages')
      return res?.data?.data
    } catch (err) {
      console.log(err);
    }
  }

  export default getPageData