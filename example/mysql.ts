import { Client } from "https://deno.land/x/mysql/mod.ts";
import { table, query } from "https://raw.githubusercontent.com/yourtion/deno-sql/master/mod.ts";

// CREATE DATABASE `test` DEFAULT CHARACTER SET = `utf8mb4` DEFAULT COLLATE = `utf8mb4_general_ci`;
// CREATE TABLE `test`.`test` (`id` serial,`a` int,`b` int, PRIMARY KEY (id));
// INSERT INTO `test`.`test` (`a`, `b`) VALUES ('123', '23');
// INSERT INTO `test`.`test` (`a`, `b`) VALUES ('1', '2');
// INSERT INTO `test`.`test` (`a`, `b`) VALUES ('3', '4');
// INSERT INTO `test`.`test` (`a`, `b`) VALUES ('14', '5');

const client = await new Client().connect({
  hostname: "127.0.0.1",
  username: "root",
  db: "test",
  password: "123456",
});

const sql = table("test")
  .select("a", "b")
  .where({ a: 1 })
  .and("b=?", [2])
  .orderBy("b DESC")
  .offset(0)
  .limit(1)
  .build();
// SELECT `a`, `b` FROM `test` WHERE `a`=1 AND `b`=2 ORDER BY b DESC LIMIT 10,5
console.log(sql);

const data = await client.query(sql);
console.log(data);

const data2 = await query(
  client,
  table("test").select("*").limit(1),
)
console.log(data2);
// deno run --allow-net mysql.ts
