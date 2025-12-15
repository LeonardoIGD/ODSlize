export const awsConfig = {
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID,
  domain: process.env.REACT_APP_COGNITO_DOMAIN,
};

// Valida se configs essenciais do Cognito estão setadas
export const validateAwsConfig = () => {
  const requiredFields = ['userPoolId', 'userPoolWebClientId'];
  const missing = requiredFields.filter(field => !awsConfig[field]);

  if (missing.length > 0) {
    console.warn('AWS Cognito configuration missing:', missing);
    return false;
  }

  return true;
};
