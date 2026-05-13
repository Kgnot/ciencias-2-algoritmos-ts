import {SchedulerApiServer} from "./api/server.js";

const port = parseInt(process.env.PORT || "3002", 10);
const server = new SchedulerApiServer(port);
server.start();
