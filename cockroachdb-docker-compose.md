# CockroachDB and Docker Compose

### This is the first in a series of tutorials on CockroachDB and Docker Compose

- Information on CockroachDB can be found [here](https://www.cockroachlabs.com/).
- Information on Docker Compose can be found [here](https://docs.docker.com/compose/)

1) Install Docker Desktop

Because we already have an official CockroachDB docker [image](https://hub.docker.com/r/cockroachdb/cockroach/tags), we will use that in our `docker-compose.yml` file. We recommend you use one of the current tags instead of `latest`.

2) create a `docker-compose.yml` file and enter the following:

```yml
version: '3.5'

services:

 crdb:
   image: cockroachdb/cockroach:v19.2.2
   ports:
     - "26257:26257"
     - "8090:8080"
   command: start-single-node --insecure
   volumes:
     - "${PWD}/cockroach-data/crdb:/cockroach/cockroach-data"
```

3) Start the docker-compose with:

```bash
docker-compose up
```
it will run crdb in the foreground. To run crdb in the background, pass `-d` flag to docker-compose.

```bash
docker-compose up -d
```
To view the current logs when run in the background

```bash
docker-compose logs
```

```bash
ttaching to crdb-compose_crdb_1
crdb_1  | *
crdb_1  | * WARNING: RUNNING IN INSECURE MODE!
crdb_1  | *
crdb_1  | * - Your cluster is open for any client that can access <all your IP addresses>.
crdb_1  | * - Any user, even root, can log in without providing a password.
crdb_1  | * - Any user, connecting as root, can read or write any data in your cluster.
crdb_1  | * - There is no network encryption nor authentication, and thus no confidentiality.
crdb_1  | *
crdb_1  | * Check out how to secure your cluster: https://www.cockroachlabs.com/docs/v19.2/secure-a-cluster.html
crdb_1  | *
crdb_1  | *
crdb_1  | * WARNING: neither --listen-addr nor --advertise-addr was specified.
crdb_1  | * The server will advertise "f93eaa8e1319" to other nodes, is this routable?
crdb_1  | *
crdb_1  | * Consider using:
crdb_1  | * - for local-only servers:  --listen-addr=localhost
crdb_1  | * - for multi-node clusters: --advertise-addr=<host/IP addr>
crdb_1  | *
crdb_1  | *
crdb_1  | *
crdb_1  | * INFO: Replication was disabled for this cluster.
crdb_1  | * When/if adding nodes in the future, update zone configurations to increase the replication factor.
crdb_1  | *
crdb_1  | CockroachDB node starting at 2019-12-20 17:11:29.7723213 +0000 UTC (took 0.7s)
crdb_1  | build:               CCL v19.2.2 @ 2019/12/11 01:33:43 (go1.12.12)
crdb_1  | webui:               http://f93eaa8e1319:8080
crdb_1  | sql:                 postgresql://root@f93eaa8e1319:26257?sslmode=disable
crdb_1  | RPC client flags:    /cockroach/cockroach <client cmd> --host=f93eaa8e1319:26257 --insecure
crdb_1  | logs:                /cockroach/cockroach-data/logs
crdb_1  | temp dir:            /cockroach/cockroach-data/cockroach-temp692438876
crdb_1  | external I/O path:   /cockroach/cockroach-data/extern
crdb_1  | store[0]:            path=/cockroach/cockroach-data
crdb_1  | status:              initialized new cluster
crdb_1  | clusterID:           db57d0eb-3df5-4c58-bd2f-6c426a038ed7
crdb_1  | nodeID:              1
```

4) Connect to crdb shell to interact with the database

Find ID of the container with

```bash
docker ps
```

```bash
CONTAINER ID        IMAGE                           COMMAND                  CREATED             STATUS              PORTS                                              NAMES
f93eaa8e1319        cockroachdb/cockroach:v19.2.2   "/cockroach/cockroac…"   52 seconds ago      Up 51 seconds       0.0.0.0:8080->8080/tcp, 0.0.0.0:26257->26257/tcp   crdb-compose_crdb_1
```
Copy the ID of the container and pass it to the `docker exec` command.

```bash
docker exec -ti f93eaa8e1319 ./cockroach sql --insecure
```

```bash
#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
# Server version: CockroachDB CCL v19.2.2 (x86_64-unknown-linux-gnu, built 2019/12/11 01:33:43, go1.12.12) (same version as client)
# Cluster ID: db57d0eb-3df5-4c58-bd2f-6c426a038ed7
#
# Enter \? for a brief introduction.
#
root@:26257/defaultdb>
```

5) Shut down your environment

```bash
docker-compose down
```

Now, let's talk about what the docker-compose file is actually doing. The main focus of this tutorial is on the `crdb` service and general intricacies of docker-compose are beyond the scope of this tutorial.

```yml
 crdb:
   image: cockroachdb/cockroach:v19.2.2
```

This line says this service is called crdb, you can name it any way you'd like and we're pulling the latest stable image from docker hub which is 19.2.2 at the time of writing.

```yml
   ports:
     - "26257:26257"
     - "8090:8080"
```

This line says map the container ports for crdb for the CLI, `26257` and admin-ui, `8080` on the host. When this docker-compose script is executing, you should be able to navigate to the admin-ui with http://localhost:8080 url. You used port 26257 when you connected with the `./cockroach sql --insecure` command.

The following line says to start a single node instance of crdb. CRDB is a multi-node database and `start-single-node` is a stop-gap for those times when you need to run a quick single-node instance. Read more [here](https://www.cockroachlabs.com/docs/stable/cockroach-start-single-node.html).

```yml
   command: start-single-node --insecure
```

Finally, the last line maps the host's current directory to your docker's mount point where crdb logs and data will reside. You should be able to browse those artifacts even after container terminates.

```yml
   volumes:
     - "${PWD}/cockroach-data/crdb:/cockroach/cockroach-data"
```

Hope you enjoyed this tutorial and will come back for part 2 when I publish it shortly.
