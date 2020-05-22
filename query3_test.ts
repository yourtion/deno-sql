import Q from "./mod.ts";
import {
  test,
  assertStrictEq,
} from "./test_deps.ts";

test("sub query1", () => {
  const sql = Q.select("*")
    .from("test1")
    .where("a=? AND b IN ???", [
      123,
      Q.select("id")
        .from("test2")
        .where({ id: { $lt: 10 } })
        .limit(100),
    ])
    .build();
  //   utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT * FROM `test1` WHERE a=123 AND b IN (SELECT `id` FROM `test2` WHERE `id`<10 LIMIT 100)",
  );
});
test("sub query2", () => {
  const sql = Q.select("*")
    .from("test1")
    .where("a=:a AND b IN :::b", {
      a: 123,
      b: Q.select("id")
        .from("test2")
        .where({ id: { $lt: 10 } })
        .limit(100),
    })
    .build();
  //   utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT * FROM `test1` WHERE a=123 AND b IN (SELECT `id` FROM `test2` WHERE `id`<10 LIMIT 100)",
  );
});
test("sub query3", () => {
  const sql = Q.select("*")
    .from("test1")
    .where({
      a: 123,
      b: {
        $in: Q.select("id")
          .from("test2")
          .where({ id: { $lt: 10 } })
          .limit(100),
      },
    })
    .build();
  //   utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT * FROM `test1` WHERE `a`=123 AND `b` IN (SELECT `id` FROM `test2` WHERE `id`<10 LIMIT 100)",
  );
});

test("select - $raw", () => {
  const sql = Q.select("*")
    .from("test1")
    .where({
      a: 123,
      $raw: "a > b",
    })
    .build();
  //   utils.debug(sql);
  assertStrictEq(sql, "SELECT * FROM `test1` WHERE a > b AND `a`=123");
});
test("select - $raw", () => {
  const sql = Q.select("*")
    .from("test1")
    .where({
      a: 123,
      $raw: "a > b",
    })
    .build();
  //   utils.debug(sql);
  assertStrictEq(sql, "SELECT * FROM `test1` WHERE a > b AND `a`=123");
});

test("clone", () => {
  const q = Q.select("*").from("test1").where({ a: 123 });

  const sql1 = q.clone().where({ b: 456 }).offset(10).limit(20).build();
  //   utils.debug(sql1);
  assertStrictEq(
    sql1,
    "SELECT * FROM `test1` WHERE `a`=123 AND `b`=456 LIMIT 10,20",
  );
  const sql2 = q.clone().where({ b: 789, c: 666 }).orderBy("a DESC").build();
  //   utils.debug(sql2);
  assertStrictEq(
    sql2,
    "SELECT * FROM `test1` WHERE `a`=123 AND `b`=789 AND `c`=666 ORDER BY a DESC",
  );
});

test("typings - select", () => {
  const a = 1;
  const b = "b";
  const sql = Q.select<{
    a: number;
    b: string;
    c: boolean;
  }>("*")
    .from("test1")
    .where({ a: { $eq: 2 }, b: { $lt: 3 } })
    .where({ [b]: { $eq: a } })
    .build();
  // utils.debug(sql);
  assertStrictEq(sql, "SELECT * FROM `test1` WHERE `a`=2 AND `b`<3 AND `b`=1");
});
test("typings - update", () => {
  const a = 1;
  const b = "b";
  const sql = Q.update<{
    a: number;
    b: string;
    c: boolean;
  }>()
    .table("test1")
    .where({ a: { $eq: 2 }, b: { $lt: 3 } })
    .set({ [b]: { $incr: a } })
    .build();
  // utils.debug(sql);
  assertStrictEq(sql, "UPDATE `test1` SET `b`=`b`+(1) WHERE `a`=2 AND `b`<3");
});
