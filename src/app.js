const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes");
const { httpLogger } = require("./config/logger");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.get("/health", (req, res) => {
  res.json({
    data: {
      status: "ok",
      service: "premios-oscar-api"
    }
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
