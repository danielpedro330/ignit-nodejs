"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var dotenv_1 = require("dotenv");
var zod_1 = require("zod");
// Joi, Yup, Zod
// console.log(process.env.NODE_ENV)
// throw new Error()
if (process.env.NODE_ENV == 'test') {
    (0, dotenv_1.config)({ path: 'test.env' });
}
else {
    (0, dotenv_1.config)();
}
var envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('production'),
    DATABASE_URL: zod_1.z.string(),
    PORT: zod_1.z.number().default(3333),
});
var _env = envSchema.safeParse(process.env);
if (_env.success == false) {
    console.error('Invalid environment variables', _env.error.format());
    throw new Error('Invalid environment variables');
}
exports.env = _env.data;
