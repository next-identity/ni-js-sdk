// app.js
document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const userDisplayDiv = document.getElementById('user-display');
  const userEmailDiv = document.getElementById('user-email');

  // Check for logout parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('logout') === 'true') {
    logoutButton.style.display = 'none';
    // Clear the URL parameters
    window.history.pushState({}, document.title, window.location.pathname);
  }

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
    register: () => {
      // Generate code verifier and challenge
      const codeVerifier = generateRandomString(128);
      generateCodeChallenge(codeVerifier)
      .then(codeChallenge => {
          localStorage.setItem('code_verifier', codeVerifier); // Store for later use

          const registerUrl = new URL(`${config.issuer}/register`);
          registerUrl.searchParams.set('response_type', 'code');
          registerUrl.searchParams.set('client_id', config.clientId);
          registerUrl.searchParams.set('redirect_uri', config.redirectUri);
          registerUrl.searchParams.set('scope', config.scopes.join(' '));
          registerUrl.searchParams.set('state', generateRandomString(32));
          registerUrl.searchParams.set('code_challenge', codeChallenge);
          registerUrl.searchParams.set('code_challenge_method', 'S256');
          window.location.href = registerUrl.toString();
        })
      .catch(error => console.error("Error generating code challenge:", error));
    },
    editProfile: () => {
      // Generate code verifier and challenge
      const codeVerifier = generateRandomString(128);
      generateCodeChallenge(codeVerifier)
      .then(codeChallenge => {
          localStorage.setItem('code_verifier', codeVerifier); // Store for later use

          const profileUrl = new URL(`${config.issuer}/personal-details`);
          profileUrl.searchParams.set('response_type', 'code');
          profileUrl.searchParams.set('client_id', config.clientId);
          profileUrl.searchParams.set('redirect_uri', config.redirectUri);
          profileUrl.searchParams.set('scope', config.scopes.join(' '));
          profileUrl.searchParams.set('state', generateRandomString(32));
          profileUrl.searchParams.set('code_challenge', codeChallenge);
          profileUrl.searchParams.set('code_challenge_method', 'S256');
          window.location.href = profileUrl.toString();
        })
      .catch(error => console.error("Error generating code challenge:", error));
    },
    getToken: async (code) => {
      const tokenUrl = `${config.tokenIssuer}/token`;
      const codeVerifier = localStorage.getItem('code_verifier'); // Retrieve from storage
      
      const payload = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        code_verifier: codeVerifier
      };
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
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
      localStorage.removeItem('id_token');
      localStorage.removeItem('user_info');
      userDisplayDiv.textContent = '';
      userEmailDiv.textContent = '';
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
      const authUrl = new URL(`${config.issuer}/endsession`);
        authUrl.searchParams.set('client_id', config.clientId);
        authUrl.searchParams.set('post_logout_redirect_uri', config.redirectUri);
        window.location.href = authUrl.toString();
        console.log(authUrl);
    },
    hasValidAccessToken: () => {
      const accessToken = localStorage.getItem('access_token');
      return !!accessToken; // Return true if access token exists, false otherwise
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
  
  // Add registration functionality if register button exists
  const registerButton = document.getElementById('register-button');
  if (registerButton) {
    registerButton.addEventListener('click', () => {
      nextIdentity.register();
    });
  }
  
  // Add edit profile functionality if edit profile button exists
  const editProfileButton = document.getElementById('edit-profile-button');
  if (editProfileButton) {
    editProfileButton.addEventListener('click', () => {
      nextIdentity.editProfile();
    });
  }

  // Handle the callback
  const code = urlParams.get('code');
  if (code) {
    // Exchange code for token and get user info
    nextIdentity.getToken(code)
    .then(tokenResponse => {
      // Store access token in local storage
      localStorage.setItem('access_token', tokenResponse.access_token);
      
      // Decode and store ID token
      const idTokenParts = tokenResponse.id_token.split('.');
      const decodedIdToken = JSON.parse(atob(idTokenParts[1]));
      localStorage.setItem('id_token', JSON.stringify(decodedIdToken));
      
      // Get user info using the access token
      return nextIdentity.getUserInfo(tokenResponse.access_token)
        .then(userInfo => {
          // Store user info in local storage
          localStorage.setItem('user_info', JSON.stringify(userInfo));
          
          return {
            idToken: decodedIdToken,
            userInfo: userInfo
          };
        });
    })
    .then(profile => {
      // Display user info and update UI
      displayUserInfo(profile.userInfo);
      
      // Clear the code from URL for security
      window.history.pushState({}, document.title, window.location.pathname);
    })
    .catch(error => console.error("Error during authentication:", error));
  } else {
    // Check if we have stored profile and token
    const storedUserInfo = localStorage.getItem('user_info');
    
    if (storedUserInfo) {
      displayUserInfo(JSON.parse(storedUserInfo));
    }
  }

  function displayUserInfo(userInfo) {
    if (userInfo) {
      // Display given_name or email or nothing based on what's available
      displayUserIdentifier(userInfo);
      
      // Update UI for logged in state
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';
    }
  }
  
  function displayUserIdentifier(userInfo) {
    if (userInfo.given_name) {
      userDisplayDiv.textContent = userInfo.given_name;
    } else {
      userDisplayDiv.textContent = '';
    }
    
    if (userInfo.email) {
      userEmailDiv.textContent = userInfo.email;
    } else {
      userEmailDiv.textContent = '';
    }
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