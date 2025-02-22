// app.js
document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');
  const profileInfo = document.getElementById('profile-info');
  const profileDetails = document.getElementById('profile-details');
  const logoutButton = document.getElementById('logout-button');

  const nextIdentity = {
    authorize: () => {
      // Generate code verifier and challenge
      const codeVerifier = generateRandomString(128);
      generateCodeChallenge(codeVerifier)
      .then(codeChallenge => {
          localStorage.setItem('code_verifier', codeVerifier); // Store for later use

          const authUrl = new URL(`${config.issuer}/authorize`);
          authUrl.searchParams.set('response_type', 'code');
          authUrl.searchParams.set('client_id', config.clientId);
          authUrl.searchParams.set('redirect_uri', config.redirectUri);
          authUrl.searchParams.set('scope', config.scopes.join(' '));
          authUrl.searchParams.set('state', generateRandomString(32));
          authUrl.searchParams.set('code_challenge', codeChallenge);
          authUrl.searchParams.set('code_challenge_method', 'S256');
          window.location.href = authUrl.toString();
        })
      .catch(error => console.error("Error generating code challenge:", error));
    },
    getToken: async (code) => {
      const tokenUrl = new URL(`${config.issuer}/token`);
      const codeVerifier = localStorage.getItem('code_verifier'); // Retrieve from storage
      tokenUrl.searchParams.set('grant_type', 'authorization_code');
      tokenUrl.searchParams.set('code', code);
      tokenUrl.searchParams.set('redirect_uri', config.redirectUri);
      tokenUrl.searchParams.set('client_id', config.clientId);
      tokenUrl.searchParams.set('code_verifier', codeVerifier); // Include code verifier
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return await response.json();
    },
    getUserInfo: async (accessToken) => {
      const userInfoUrl = `${config.issuer}/userinfo`;
      const response = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return await response.json();
    },
    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('profile');
      profileInfo.style.display = 'none';
      loginButton.style.display = 'block';

    }
  };

  function generateCodeChallenge(codeVerifier) {
    return new Promise((resolve, reject) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      crypto.subtle.digest('SHA-256', data)
      .then(buffer => {
          const base64Encoded = base64UrlEncode(buffer);
          resolve(base64Encoded);
        })
      .catch(error => reject(error));
    });
  }

  function base64UrlEncode(arrayBuffer) {
    let base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  }

  loginButton.addEventListener('click', () => {
      nextIdentity.authorize();
  });

  logoutButton.addEventListener('click', () => {
    nextIdentity.logout();
  });

  // Handle the callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    // Exchange code for token and get user info
    nextIdentity.getToken(code)
      .then(tokenResponse => {
        localStorage.setItem('access_token', tokenResponse.access_token);
        return nextIdentity.getUserInfo(tokenResponse.access_token)
      })
      .then(profile => {
        localStorage.setItem('profile', JSON.stringify(profile));
        displayProfile(profile);
      })
      .catch(error => console.error("Error during authentication:", error));

      // Clear the code from URL for security
      window.history.pushState({}, document.title, window.location.pathname);
  } else {
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
          displayProfile(JSON.parse(storedProfile));
      }
  }


  function displayProfile(profile) {
      profileDetails.textContent = JSON.stringify(profile, null, 2);
      profileInfo.style.display = 'block';
      loginButton.style.display = 'none';
  }


  function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

});