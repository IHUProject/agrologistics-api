import axios from 'axios';

export const getImgurToken = async () => {
  const clientId = 'b346aa38b14f95b';
  const clientSecret = 'eb21e1fc6bc55189c2971b8167d192f4a9f8ef99';
  console.log('asd');

  const response = await axios.post(
    'https://api.imgur.com/oauth2/token',
    null,
    {
      params: {
        grant_type: 'client_credentials',
      },
      auth: {
        username: clientId,
        password: clientSecret,
      },
    }
  );
  console.log('asd');
  const accessToken = response.data.access_token;
  console.log('Access Token:', accessToken);
};
