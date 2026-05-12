import { SchedulerApiServer } from "./api/scheduler-api.js";

// Iniciar servidor de scheduling backend
const port = parseInt(process.env.PORT || "3002", 10);
const server = new SchedulerApiServer(port);
server.start();
