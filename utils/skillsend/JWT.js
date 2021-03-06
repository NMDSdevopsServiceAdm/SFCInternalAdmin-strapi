const jwt = require('jsonwebtoken');
const Token_Secret = process.env.TOKEN_SECRET;
const TOKEN_EXPIRY=15;
const TOKEN_AUDIENCE='ADS-WDS-Internal-Admin-App';

// this generates the JWT that can be presented to the the ASC WDS Backend
exports.ASCWDS_JWT = () => {
  const THIS_ISS = strapi.config.currentEnvironment.jwt_iss;
  var claims = {
    aud: TOKEN_AUDIENCE,
    iss: THIS_ISS
  };

  if (!Token_Secret) {
    strapi.log.error('Invalid ASC WDS API Token Secret');
    return null;
  }

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${TOKEN_EXPIRY}s`});
};

// middleware for confirming ASC Internal Admin JWT
const AUTH_HEADER = 'authorization';
exports.isAuthenticated = (req, res , next) => {
  const THIS_ISS = strapi.config.currentEnvironment.jwt_iss;
  const token = getToken(req.headers[AUTH_HEADER]);

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== TOKEN_AUDIENCE || claim.iss !== THIS_ISS) {
        return res.status(403).send('Invalid Token');
      } else {
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};
