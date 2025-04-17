# Modifying the Next Identity JavaScript SDK

This guide explains how to modify the Next Identity JavaScript SDK to add custom functionality and adapt it to your specific requirements.

## 1. Clone the SDK Repository
To get started, clone the SDK repository:
```sh
git clone https://github.com/next-reason/ni-js-oidc.git
cd ni-js-oidc
```

## 2. Locate `next-identity-client.js`
The main file handling authentication logic is `next-identity-client.js`. Open it in a code editor to make modifications.

## 3. Modify Authentication Logic
You can customize the login and logout process by updating the functions inside `next-identity-client.js`.

### Example: Custom Login Handling
Modify the `login` function to include additional logging or redirect logic:
```javascript
function login() {
  console.log("Custom login process initiated");
  window.location.href = `${config.authority}/authorize?client_id=${config.client_id}&redirect_uri=${config.redirect_uri}&response_type=code&scope=${config.scope}`;
}
```

### Example: Custom Logout Handling
Modify the `logout` function to perform extra cleanup steps:
```javascript
function logout() {
  console.log("Clearing user data before logout");
  localStorage.removeItem("user_token");
  window.location.href = config.post_logout_redirect_uri;
}
```

## 4. User Information Display
The SDK now includes a simplified way to display user information. It will show either the user's given name or email address (whichever is available) in a designated HTML element.

### Setup the User Display Element
Add a div with the ID `user-display` to your HTML:
```html
<div id="user-display"></div>
<div id="user-email"></div>
```

### How it Works
The SDK automatically handles:
- Displaying the user's given name in the user-display element
- Displaying the user's email in the user-email element
- Toggling login/logout button visibility based on authentication state
- Clearing user information on logout

### Example HTML Structure
```html
<button id="login-button">Log In</button>
<button id="logout-button" style="display: none;">Log Out</button>
<div id="user-display"></div>
<div id="user-email"></div>
```

### Checking Authentication Status
The SDK provides a simple method to check if the user has a valid access token:

```javascript
if (nextIdentity.hasValidAccessToken()) {
  // User is authenticated
  console.log("User is logged in");
} else {
  // User is not authenticated
  console.log("User is not logged in");
}
```

### Protecting Content with Authentication
Here's how to gate content on a page that requires authentication:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Check if user has valid access token
  if (!nextIdentity.hasValidAccessToken()) {
    // No valid token found, redirect to homepage
    window.location.href = '/index.html';
    return;
  }
  
  // User is authenticated, show protected content
  const protectedContent = document.getElementById('protected-content');
  if (protectedContent) {
    protectedContent.style.display = 'block';
  }
  
  // Optional: Load user-specific data
  const accessToken = localStorage.getItem('access_token');
  fetch('/api/user-data', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Process user data
    console.log('User data:', data);
  })
  .catch(error => {
    console.error('Error fetching user data:', error);
  });
});
```

## 5. Add a Custom Function
You can add a new function to enhance the SDK with additional capabilities.

### Example: Fetch User Info After Login
Add a function to retrieve and log user information after authentication:
```javascript
async function getUserInfo() {
  const token = localStorage.getItem("user_token");
  if (!token) {
    console.log("No token found, user not logged in");
    return;
  }

  const response = await fetch(`${config.authority}/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userInfo = await response.json();
  console.log("User Info:", userInfo);
  return userInfo;
}
```

## 6. Rebuild and Use the Modified SDK
After making changes, rebuild the SDK to generate an updated version:
```sh
npm run build
```

### Using the Modified SDK
To use the modified SDK in a project:
```javascript
import { login, logout, getUserInfo } from './next-identity-client.js';
login();
getUserInfo();
logout();
```

## 7. Testing Locally
Run the development server to test your changes:
```sh
npm run dev
```
This will allow you to verify that your modifications work as expected before deploying.

## 8. Deploying Your Custom SDK
To publish your modified SDK:
1. Commit and push your changes to a repository.
2. If using a CDN, upload the modified `next-identity-client.js`.
3. If publishing to npm, update `package.json` and run:
```sh
npm publish
```

---
With these steps, you can fully customize the Next Identity JavaScript SDK to fit your authentication needs.


