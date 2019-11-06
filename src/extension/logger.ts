'use strict';
const { createLogger, format, transports } = require('winston');
require ('winston-daily-rotate-file');
import fs from 'fs';
import path from 'path';
import os from 'os'

const logDir = path.join(os.tmpdir(), 'DL-Toolkit-logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${path.join(logDir, `%DATE%-results.log`)}`,
    datePattern: 'YYYY-MM-DD'
  });

export const logger = createLogger({
    level: 'silly',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss:ms'
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: 'your-service-name' },
    transports: [
      dailyRotateFileTransport
    ]
  });
  

