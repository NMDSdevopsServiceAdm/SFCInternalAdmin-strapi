# ASC WDS Slack "Internal Admin" app

# start
To start, within the top level project for developing content type, `strapi develop` or `npm run start`. To start, within the top project for fixed content type: `strapi start` or `npm (run) start`.

## Config
### ENV vars
All mandatory:
* `TOKEN_SECRET` - this is the JWT token secret used to create ASC WDS JWT
* `DATABASE_HOST` - this is the target hostname/IP of the MongoDB instance/cluster
* `DATABASE_PORT` - this is the target port of the MonogDB instance/cluster
* `DATABASE_NAME` - this is the target database name of the MonogDB collection
* `DATABASE_USERNAME` - this is the target port of the MonogDB instance
* `DATABASE_PASSWORD` - this is the target port of the MonogDB instance


If `DATABASE_HOST` is a MongoDB cluster, this includes the comma separated list of cluster hosts along with the database name, the name of the replica set and any SSL connection.
For example: `host1.mongodb.net:27017,host2.mongodb.net:27017,hots3.mongodb.net:27017/<dbname>?ssl=true&replicaSet=<replicaSetname>&authSource=admin&retryWrites=true`.

To use ENV vars on command line:
* Windows -> set DATABASE_PORT=xxxxx
* Linux -> DATABASE_PORT=xxxxx

strapi as used by the SFC Admins, needs to allow for the maintenance of existing content types but the creation of new content types too. strapi `content type builder` is disable when running strapi in production mode (`strapi start`). There

To set ENV vars with pm2 `ecosystem.config.js` propery file:
```
module.exports = {
  apps : [{
    name: '....',
    cwd: '....',
    script: 'npm',
    args: [
      'run',
      'develop'
    ],
    env: {
      TOKEN_SECRET : '********',
      DATABASE_HOST : 'host1.mongodb.net:27017,host2.mongodb.net:27017,hots3.mongodb.net:27017/<dbname>?ssl=true&replicaSet=<replicaSetname>&authSource=admin&retryWrites=true',
      DATABASE_PORT : '27017',
      DATABASE_NAME : 'strapi',
      DATABASE_USERNAME : 'strapi',
      DATABASE_PASSWORD : '********',
    },
  }],
};
```

## API
Contains api/models for incoming transactiona; data:
* AppUsers
* Establishments

Contains api/models with REST calls on change for outgoing Reference Data:
* Qualifications

