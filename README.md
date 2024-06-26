# core-status

### Local development Environment

1. Clone 5 repositories

   ```
   git clone git@github.com:globalid/messaging-legacy-core.git
   git clone git@github.com:globalid/messaging-transport.git
   git clone git@github.com:globalid/core-keystore.git
   git clone git@github.com:globalid/core-contacts.git
   git clone git@github.com:globalid/core-identity-namespace.git
   ```

1. Clone sample docker file as Dockerfile, disable this line https://github.com/globalid/github-actions/blob/main/get-dockerfile/docker/node16#L16 Add 2 parameters to the 2. Line of the file.

   ```
   ARG NPM_TOKEN
   COPY .npmrc .npmrc
   ```

1. Copy your local ~/.npmrc files under cloned repo’s root directory
   ```
   cp ~/.npmrc messaging-legacy-core/
   cp ~/.npmrc messaging-transport/
   cp ~/.npmrc core-keystore/
   cp ~/.npmrc core-contacts/
   cp ~/.npmrc core-identity-namespace/
   ```
1. Copy Dockefile to

   ```
    cp Dockerfile messaging-legacy-core/
    cp Dockerfile messaging-transport/
    cp Dockerfile core-keystore/
    cp Dockerfile core-contacts/
    cp Dockerfile core-identity-namespace/
   ```

1. Add your github user and access token & login to the private docker registry

   ```
   export USERNAME=ufuksak
   export CR_PAT=ghp_*******
   echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
   ```

1. Set NPM_TOKEN environment variable

   ```
   export NPM_TOKEN=npm_************************
   ```

1. Build Docker local images for each 5 repos

   ```
   cd messaging-legacy-core && docker build -t messaging-legacy-core --build-arg NPM_TOKEN=${NPM_TOKEN} . && cd ../
   cd messaging-transport && docker build -t messaging-transport --build-arg NPM_TOKEN=${NPM_TOKEN} . && cd ../
   cd core-keystore && docker build -t keystore --build-arg NPM_TOKEN=${NPM_TOKEN} . && cd ../
   cd core-contacts && docker build -t contacts --build-arg NPM_TOKEN=${NPM_TOKEN} . && cd ../
   cd core-identity-namespace && docker build -t identity-namespace-service --build-arg NPM_TOKEN=${NPM_TOKEN} . && cd ../
   ```

1. Run the containers, see the working containers,

   ```
   docker-compose up
   ```

   ->

   ```
   Starting temp-status-db_contacts_1 ...
   temp-status-db_hydra_1 is up-to-date
   rabbitmq is up-to-date
   Starting cockroach_node_1          ...
   cockroach_node_2 is up-to-date
   Starting temp-status-db_messaging-transport-service_1 ...
   temp-status-db_postgres_1 is up-to-date
   temp-status-db_redis_1 is up-to-date
   Starting temp-status-db_contacts_1                    ... done
   Starting cockroach_node_1                             ... done
   Starting temp-status-db_messaging-transport-service_1 ... done
   Starting temp-status-db_messaging-service_1           ... done
   Starting temp-status-db_identity_1                    ... done
   Starting temp-status-db_keystore_1                    ... done
   ```

1. git submodule init && git submodule update &&  cd ./globalid-crypto-library && npm i


1. Troubleshooting,
   if any failures are seen like this, try to kill working processes(check the process-> ps -ef|grep tomcat -> sudo kill -9 <PID>)
   ERROR: for cockroach_node_1 Cannot start service cockroach_node_1: driver failed programming external connectivity on endpoint cockroach_node_1 (fb748ce3c296b9f43f7b2de6eaa3c6ceb1e4a637db0a5da3802ce728f09e7b0d): Error starting userland proxy: listen tcp4 0.0.0.0:8080: bind: address already in use

### pubnub - typeorm Entity Listeners and Subscribers

https://github.com/typeorm/typeorm/blob/master/docs/listeners-and-subscribers.md

### running integration and unit tests command

```
yarn jest --runInBand
```

### JWT
```
npm run tools:jwt --scope 'scopes' // optional  --scope argument can be defined ‘keys.manage status.manage’ by default
```

Full doc:

https://global-id.atlassian.net/wiki/spaces/~6234ca1c50cceb00707b7551/pages/2679210017/Status-core+JWT+invoke

### A sample UT & IT output

```
Test Suites: 6 passed, 6 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        3.964s
Ran all test suites.
Done in 4.80s.
```

### Run Worker IT

1. Run all containers from main docker-compose
```
docker-compose up
```
2. install the node modules on the root directory.
```
npm i
```
3. install node modules on globalid-crypto-library
```
cd globalid-crypto-library && npm i && cd ../
```
4. Run the core-status app
```
npm run start
```
5. Run the worker tests
```
npm run test:worker   
```
