export default {
  schema: './_lib/schema.js',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  },
};
