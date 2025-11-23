import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { awsConfig, validateAwsConfig } from '../config/awsConfig';

class AuthService {
  constructor() {
    this.userPool = null;
    this.isConfigured = false;
    this.initializeService();
  }

  initializeService() {
    if (!validateAwsConfig()) {
      console.warn('AWS Cognito not configured. Authentication features will be disabled.');
      return;
    }

    try {
      this.userPool = new CognitoUserPool({
        UserPoolId: awsConfig.userPoolId,
        ClientId: awsConfig.userPoolWebClientId
      });
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to initialize Cognito User Pool:', error);
    }
  }

  isAvailable() {
    return this.isConfigured && this.userPool !== null;
  }

  // Registrar novo usuário
  signUp(email, password, username = '') {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Authentication service not available'));
    }

    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email
      })
    ];

    if (username && username.trim()) {
      attributeList.push(new CognitoUserAttribute({
        Name: 'preferred_username',
        Value: username.trim()
      }));
    }

    return new Promise((resolve, reject) => {
      // Usa email como username no Cognito
      this.userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  // Confirmar registro com código (usando email como username)
  confirmRegistration(email, confirmationCode) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Authentication service not available'));
    }

    const userData = {
      Username: email, // Usa email como username
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  // Login (usando email como username)
  signIn(email, password) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Authentication service not available'));
    }

    const userData = {
      Username: email, // Usa email como username
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);
    const authenticationDetails = new AuthenticationDetails({
      Username: email, // Usa email como username
      Password: password
    });

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            user: cognitoUser,
            tokens: {
              accessToken: result.getAccessToken().getJwtToken(),
              idToken: result.getIdToken().getJwtToken(),
              refreshToken: result.getRefreshToken().getToken()
            }
          });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Se precisar de nova senha, rejeita por enquanto
          reject(new Error('Nova senha requerida. Entre em contato com o suporte.'));
        }
      });
    });
  }

  // Logout
  signOut() {
    if (!this.isAvailable()) {
      return;
    }

    const currentUser = this.userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
  }

  // Obter usuário atual
  getCurrentUser() {
    if (!this.isAvailable()) {
      return null;
    }
    return this.userPool.getCurrentUser();
  }

  // Verificar se está autenticado
  isAuthenticated() {
    if (!this.isAvailable()) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        resolve(false);
        return;
      }

      currentUser.getSession((err, session) => {
        if (err) {
          resolve(false);
          return;
        }
        resolve(session.isValid());
      });
    });
  }

  // Obter informações do usuário
  getUserInfo() {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Authentication service not available'));
    }

    return new Promise((resolve, reject) => {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        reject(new Error('No current user'));
        return;
      }

      currentUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        currentUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
            return;
          }

          const userInfo = {};
          attributes.forEach(attribute => {
            userInfo[attribute.getName()] = attribute.getValue();
          });

          const preferredUsername = userInfo['preferred_username'];
          const displayName = preferredUsername || userInfo.email || currentUser.getUsername();

          resolve({
            ...userInfo,
            userId: currentUser.getUsername(), // Será o email
            username: currentUser.getUsername(),
            displayName: displayName,
            tokens: {
              accessToken: session.getAccessToken().getJwtToken(),
              idToken: session.getIdToken().getJwtToken()
            }
          });
        });
      });
    });
  }

  // Reenviar código de confirmação
  resendConfirmationCode(email) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Authentication service not available'));
    }

    const userData = {
      Username: email,
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
}

export const authService = new AuthService();