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

## 4. Add a Custom Function
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

## 5. Rebuild and Use the Modified SDK
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

## 6. Testing Locally
Run the development server to test your changes:
```sh
npm run dev
```
This will allow you to verify that your modifications work as expected before deploying.

## 7. Deploying Your Custom SDK
To publish your modified SDK:
1. Commit and push your changes to a repository.
2. If using a CDN, upload the modified `next-identity-client.js`.
3. If publishing to npm, update `package.json` and run:
```sh
npm publish
```

---
With these steps, you can fully customize the Next Identity JavaScript SDK to fit your authentication needs.


