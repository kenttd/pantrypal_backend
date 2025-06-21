import knexPackage from "knex";

const knex = knexPackage({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "pantrypal",
  },
});

export default knex;
