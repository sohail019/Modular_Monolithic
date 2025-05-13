import winston from "winston";

export const createLogger = (moduleName: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: {
      service: process.env.APP_NAME || "ModularMonolithApp",
      module: moduleName,
    },
    transports: [
      new winston.transports.Console(),
      // Add file transport for production environments
      ...(process.env.NODE_ENV === "production"
        ? [
            new winston.transports.File({
              filename: "logs/error.log",
              level: "error",
            }),
          ]
        : []),
    ],
  });
};
