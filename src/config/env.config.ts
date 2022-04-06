import * as Joi from 'joi';

/*
.env filepath setting
*/
let envFilePath: string;
switch (process.env.NODE_ENV) {
  case 'dev':
    envFilePath = '.env.dev';
    break;
  case 'test':
    envFilePath = '.env.test';
    break;
  case 'prod':
    envFilePath = '.env.prod';
    break;
  default:
    throw new Error(`NODE_ENV variable is invalid : ${process.env.NODE_ENV}`);
}

export default {
  isGlobal: true,
  envFilePath: envFilePath,
  ignoreEnvFile: process.env.NODE_ENV === 'prod',
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('dev', 'prod').required(),
    DB_HOST: Joi.string().required(),
    DB_POST: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  }),
};
