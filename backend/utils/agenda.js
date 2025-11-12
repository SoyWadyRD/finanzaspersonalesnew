const Agenda = require("agenda");
const mongoConnectionString = process.env.MONGO_URI; // tu URI de MongoDB

const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: "agendaJobs" },
  processEvery: "30 seconds", // cada cuánto revisa jobs pendientes
});

module.exports = agenda;
