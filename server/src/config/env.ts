import dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string) {
  const val = process.env[name] ?? fallback;
  if (!val) {
    throw new Error(`Missing env var ${name}`);
  }
  return val;
}

export const config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: required('MONGO_URI', 'mongodb://mongo:27017/tps_db'),
  JWT_SECRET: required('JWT_SECRET', 'dev_secret_change_me'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};


