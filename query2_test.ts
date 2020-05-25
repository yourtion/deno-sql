import Q from "./mod.ts";
import { test, assertStrictEq } from "./test_deps.ts";

test("query static method - select", () => {
  const sql = Q.select("a", "b").from("hello").where({ a: 1 }).build();
  assertStrictEq(sql, "SELECT `a`, `b` FROM `hello` WHERE `a`=1");
});
test("query static method - fields", () => {
  const sql = Q.select()
    .fields("a", "b")
    .table("hello")
    .where({ a: 1 })
    .build();
  assertStrictEq(sql, "SELECT `a`, `b` FROM `hello` WHERE `a`=1");
});
test("query static method - insert", () => {
  const sql = Q.insert({ a: 123, b: 456 }).into("hello").build();
  assertStrictEq(sql, "INSERT INTO `hello` (`a`, `b`) VALUES (123, 456)");
});
test("query static method - insert into", () => {
  const sql = Q.insert([
    { a: 123, b: 456 },
    { a: 789, b: 111 },
  ])
    .into("hello")
    .build();
  assertStrictEq(
    sql,
    "INSERT INTO `hello` (`a`, `b`) VALUES (123, 456),\n(789, 111)",
  );
});
test("query static method - update", () => {
  const sql = Q.update()
    .table("abc")
    .set({ a: 123, b: 456 })
    .where({ c: 789 })
    .build();
  assertStrictEq(sql, "UPDATE `abc` SET `a`=123, `b`=456 WHERE `c`=789");
});
test("query static method - delete", () => {
  const sql = Q.delete().from("abc").where({ a: 666 }).limit(10).build();
  assertStrictEq(sql, "DELETE FROM `abc` WHERE `a`=666 LIMIT 10");
});

test("query leftJoin - on", () => {
  const sql = Q.select("*")
    .from("hello")
    .as("A")
    .leftJoin("world")
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.* FROM `hello` AS `A` LEFT JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query leftJoin - `A`.*, `B`.*", () => {
  const sql = Q.select("*")
    .from("hello")
    .as("A")
    .leftJoin("world", ["*"])
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.*, `B`.* FROM `hello` AS `A` LEFT JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query leftJoin - `B`.*", () => {
  const sql = Q.select()
    .from("hello")
    .as("A")
    .leftJoin("world", ["*"])
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `B`.* FROM `hello` AS `A` LEFT JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query leftJoin - with field", () => {
  const sql = Q.select("x", "y")
    .from("hello")
    .as("A")
    .leftJoin("world", ["z"])
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.`x`, `A`.`y`, `B`.`z` FROM `hello` AS `A` LEFT JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query leftJoin - without as", () => {
  const sql = Q.select("x", "y")
    .from("hello")
    .leftJoin("world", ["z"])
    .on("hello.id=world.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `hello`.`x`, `hello`.`y`, `world`.`z` FROM `hello` LEFT JOIN `world` ON hello.id=world.id WHERE 1 AND 2 LIMIT 2,3",
  );
});

test("query rightJoin - on", () => {
  const sql = Q.select("*")
    .from("hello")
    .as("A")
    .rightJoin("world", ["*"])
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.*, `B`.* FROM `hello` AS `A` RIGHT JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query rightJoin - as", () => {
  const sql = Q.select("x", "y")
    .from("hello")
    .as("A")
    .rightJoin("world", ["z"])
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.`x`, `A`.`y`, `B`.`z` FROM `hello` AS `A` RIGHT JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query rightJoin - without as", () => {
  const sql = Q.select("x", "y")
    .from("hello")
    .rightJoin("world", ["z"])
    .on("hello.id=world.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `hello`.`x`, `hello`.`y`, `world`.`z` FROM `hello` RIGHT JOIN `world` ON hello.id=world.id WHERE 1 AND 2 LIMIT 2,3",
  );
});

test("query join - `A`.*, `B`.*", () => {
  const sql = Q.select("*")
    .from("hello")
    .as("A")
    .join("world", ["*"])
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.*, `B`.* FROM `hello` AS `A` JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query join - as", () => {
  const sql = Q.select("x", "y")
    .from("hello")
    .as("A")
    .join("world", ["z"])
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.`x`, `A`.`y`, `B`.`z` FROM `hello` AS `A` JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query join - without as", () => {
  const sql = Q.select("x", "y")
    .from("hello")
    .join("world", ["z"])
    .on("hello.id=world.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `hello`.`x`, `hello`.`y`, `world`.`z` FROM `hello` JOIN `world` ON hello.id=world.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query join - as tow table", () => {
  const sql = Q.select("x", "y")
    .from("hello")
    .as("A")
    .leftJoin("world", ["z"])
    .as("B")
    .on("A.id=B.id")
    .leftJoin("world", ["k"])
    .as("C")
    .on("B.uid=C.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.`x`, `A`.`y`, `B`.`z`, `C`.`k` FROM `hello` AS `A` LEFT JOIN `world` AS `B` ON A.id=B.id LEFT JOIN `world` AS `C` ON B.uid=C.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
test("query join - count()", () => {
  const sql = Q.select("x", "y", "count(y) AS c1")
    .from("hello")
    .as("A")
    .join("world", ["z", "count(z) as c2"])
    .as("B")
    .on("A.id=B.id")
    .where("1")
    .and("2")
    .offset(2)
    .limit(3)
    .build();
  assertStrictEq(
    sql,
    "SELECT `A`.`x`, `A`.`y`, count(y) AS c1, `B`.`z`, count(z) as c2 FROM `hello` AS `A` JOIN `world` AS `B` ON A.id=B.id WHERE 1 AND 2 LIMIT 2,3",
  );
});
