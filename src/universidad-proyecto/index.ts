import {SchedulerApiServer} from "./api/server";

const port = parseInt(process.env.PORT || "3002", 10);
const server = new SchedulerApiServer(port);
server.start();
