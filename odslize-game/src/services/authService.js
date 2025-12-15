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
      console.warn('AWS Cognito não configurado. Recursos de autenticação serão desativados.');
      return;
    }

    try {
      this.userPool = new CognitoUserPool({
        UserPoolId: awsConfig.userPoolId,
        ClientId: awsConfig.userPoolWebClientId
      });
      this.isConfigured = true;
    } catch (error) {
      console.error(' Falha ao inicializar o Cognito User Pool:', error);
    }
  }

  isAvailable() {
    return this.isConfigured && this.userPool !== null;
  }

  // Registra novo user no Cognito usando username como identificador
  signUp(email, password, username) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Serviço de autenticação não disponível.'));
    }

    if (!username || !username.trim()) {
      return Promise.reject(new Error('Username é obrigatório.'));
    }

    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email
      }),
      new CognitoUserAttribute({
        Name: 'preferred_username',
        Value: username.trim()
      })
    ];

    return new Promise((resolve, reject) => {
      this.userPool.signUp(username.trim(), password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  // Valida o código de confirmação enviado por email
  confirmRegistration(username, confirmationCode) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Serviço de autenticação não disponível.'));
    }

    const userData = {
      Username: username,
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

  // Autentica user no Cognito e retorna tokens de sessão
  signIn(usernameOrEmail, password) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Serviço de autenticação não disponível.'));
    }

    const userData = {
      Username: usernameOrEmail,
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);
    const authenticationDetails = new AuthenticationDetails({
      Username: usernameOrEmail,
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
          reject(new Error('Nova senha requerida. Entre em contato com o suporte.'));
        }
      });
    });
  }

  // Desloga user e limpa sessão
  signOut() {
    if (!this.isAvailable()) {
      return;
    }

    const currentUser = this.userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
  }

  // Pega instância do user logado
  getCurrentUser() {
    if (!this.isAvailable()) {
      return null;
    }
    return this.userPool.getCurrentUser();
  }

  // Checa se tem sessão ativa válida
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

  // Busca dados do user (sub, username, email) do Cognito
  getUserInfo() {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Serviço de autenticação não disponível.'));
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

          const userId = userInfo['sub'];
          const username = currentUser.getUsername();
          const preferredUsername = userInfo['preferred_username'];
          const displayName = preferredUsername || username;

          resolve({
            ...userInfo,
            userId: userId,
            username: username,
            displayName: displayName,
            preferredUsername: preferredUsername,
            tokens: {
              accessToken: session.getAccessToken().getJwtToken(),
              idToken: session.getIdToken().getJwtToken()
            }
          });
        });
      });
    });
  }

  // Reenvia código de verificação por email
  resendConfirmationCode(email) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Serviço de autenticação não disponível.'));
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

  // Inicia fluxo de recuperação de senha
  forgotPassword(username) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Serviço de autenticação não disponível.'));
    }

    const userData = {
      Username: username,
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        },
        inputVerificationCode: (data) => {
          resolve(data);
        }
      });
    });
  }

  // Confirma nova senha usando código recebido
  confirmPassword(username, verificationCode, newPassword) {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Serviço de autenticação não disponível.'));
    }

    const userData = {
      Username: username,
      Pool: this.userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          resolve('Senha alterada com sucesso');
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }

  // Deleta conta do user permanentemente do Cognito
  deleteUserAccount() {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('Serviço de autenticação não disponível.'));
    }

    const currentUser = this.userPool.getCurrentUser();
    
    if (!currentUser) {
      return Promise.reject(new Error('Nenhum usuário logado.'));
    }

    return new Promise((resolve, reject) => {
      currentUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        if (!session.isValid()) {
          reject(new Error('Sessão inválida. Faça login novamente.'));
          return;
        }

        currentUser.deleteUser((deleteErr, deleteResult) => {
          if (deleteErr) {
            reject(deleteErr);
            return;
          }

          localStorage.clear();
          sessionStorage.clear();
          
          resolve(deleteResult);
        });
      });
    });
  }
}

export const authService = new AuthService();