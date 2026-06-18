const promiseSchemaControlConfig = async () => {
  const schemaControlConfig = {
    host: 'localhost',
    port: '7821',
    database: 'superimportantdb',
    schema: 'public',
    username: "postgres",
    password: "a-secure-password"
  };
  return schemaControlConfig;
};

module.exports = {
  promiseConfig: promiseSchemaControlConfig,
};
