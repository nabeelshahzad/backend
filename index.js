const express = require("express");
const colors = require("colors");
const router = express.Router();
const dotenv = require("dotenv").config();
const swaggerUI = require("swagger-ui-express");
const crypto = require("crypto");
const httpException = require("http-exception");
const nodeMailer = require("nodemailer");
const swaggerJsDoc = require("swagger-jsdoc");
const connectDB = require("./config/db");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cors({ origin: "http://localhost:4200", credentials: true }));

app.use("/", require("./routes/users.routes"));
app.use("/activity", require("./routes/activity.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/category", require("./routes/category.routes"));
app.use("/donation", require("./routes/donation.routes"));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Esaale-Sawab API",
      version: "1.0.0",
      description: "Esaale Sawab API'S",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(specs));

app.listen(port, () =>
  console.log(`Your Application is running on port >> ${port} <<`)
);
