import axios from 'axios'

export const elementObserver = (element, callback) => {
  const observer = new MutationObserver(mutations => {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let z = 0; z < mutation.addedNodes.length; z++) {
        const addedNode = mutation.addedNodes[z];
        if (addedNode) {
          if (addedNode.querySelector) {
            const foundElement = addedNode.querySelector(element);
            if (foundElement) {
              callback(foundElement);
              observer.disconnect();
            }
          }
        }
      }
    }
  });
  const observeOptions = {
    childList: true,
    subtree: true
  };
  observer.observe(document, observeOptions);
};

export function instagram(instagramApiToken) {
  const REFRESH_URL = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${instagramApiToken}`
  const baseURL = `https://graph.instagram.com/me/media?fields=caption,media_url,media_type&access_token=${instagramApiToken}`

  const api = () => axios.create({ baseURL })

  axios.interceptors.response.use((response) => (response), (error) => {

    if (error.response.status === 400) {
      if (error.response.data && error.response.data.error) {
        this.refreshToken().then(data => console.log(data))
      }
    }
    
    return Promise.reject(error);
  });

  return {
    refreshToken: async function() {
      try {
        await axios.post(REFRESH_URL)
      } catch (err) {
        console.error(err)
        return err
      }
    },
    getMediaDetail: async function() {
      try {
        const res = await api().get()
        const { data } = res.data
  
        if (!data.length) return []
  
        return data.filter(image => image.media_type === 'IMAGE')
      } catch (err) {
        console.error(err)
        return err
      }
    }
  }
}

