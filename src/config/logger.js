const pino = require("pino");
const pinoHttp = require("pino-http");
const env = require("./env");

const transport = env.nodeEnv === "development"
  ? pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname"
      }
    })
  : undefined
  ;

const logger = pino(
  {
    level: env.logLevel,
    base: {
      service: "premios-oscar-api"
    }
  },
  transport
);

const httpLogger = pinoHttp({
  logger,
  customSuccessMessage(req, res) {
    return `${req.method} ${req.originalUrl} completed with ${res.statusCode}`;
  },
  customErrorMessage(req, res, error) {
    return `${req.method} ${req.originalUrl} failed with ${res.statusCode || 500}: ${error.message}`;
  },
  customLogLevel(req, res, error) {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  }
});

module.exports = {
  logger,
  httpLogger
};
