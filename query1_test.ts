import Q from "./mod.ts";
import {
  test,
  assertStrictEq,
  assertThrows,
  AssertionError,
} from "./test_deps.ts";

test("format - simple", () => {
  assertStrictEq(Q.table("test1").format('"a"'), '"a"');
});
test("format - ?", () => {
  assertStrictEq(Q.table("test1").format("a=?", [0]), "a=0");
});
test("format - :", () => {
  assertStrictEq(Q.table("test1").format("a=:v", { v: 0 }), "a=0");
});

test("select - with filed", () => {
  const sql = Q.table("test1").select("name", "age").build();
  // utils.debug(sql);
  assertStrictEq(sql, "SELECT `name`, `age` FROM `test1`");
});
test("select - where object", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
      b: 456,
    })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456",
  );
});
test("select - where object with params", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where("`a`=:a AND `b`=:b", {
      a: 123,
      b: 456,
    })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456",
  );
});
test("select - where and", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
    })
    .where({
      b: 456,
    })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456",
  );
});
test("select - where with array", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where("`a`=? AND `b`=?", [123, 456])
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456",
  );
});
test("select - limit", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
      b: 456,
    })
    .limit(10)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 LIMIT 10",
  );
});
test("select - skip", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
      b: 456,
    })
    .skip(10)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 LIMIT 10,18446744073709551615",
  );
});
test("select - skip and limit", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
      b: 456,
    })
    .skip(10)
    .limit(20)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 LIMIT 10,20",
  );
});
test("select - orderBy", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
      b: 456,
    })
    .offset(10)
    .limit(20)
    .orderBy("`a` DESC, `b` ASC")
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
  );
});
test("select - multi-orderBy", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
      b: 456,
    })
    .offset(10)
    .limit(20)
    .orderBy("`a` ?, `b` ?", ["DESC", "ASC"])
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
  );
});
test("select - and", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
    })
    .and({
      b: 456,
    })
    .offset(10)
    .limit(20)
    .orderBy("`a` ?, `b` ?", ["DESC", "ASC"])
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
  );
});
test("select - selectDistinct", () => {
  const sql = Q.table("test1")
    .selectDistinct("name", "age")
    .where({
      a: 123,
    })
    .and({
      b: 456,
    })
    .offset(10)
    .limit(20)
    .orderBy("`a` ?, `b` ?", ["DESC", "ASC"])
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT DISTINCT `name`, `age` FROM `test1` WHERE `a`=123 AND `b`=456 ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
  );
});

test("groupBy - filed", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
    })
    .offset(10)
    .limit(20)
    .groupBy("name")
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 GROUP BY `name` LIMIT 10,20",
  );
});
test("groupBy - having", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: 123,
    })
    .offset(10)
    .limit(20)
    .groupBy("a", "b")
    .having("COUNT(`a`)>?", [789])
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a`=123 GROUP BY `a`, `b` HAVING COUNT(`a`)>789 LIMIT 10,20",
  );
});

test("count - as", () => {
  const sql = Q.table("test1")
    .count("c")
    .where({
      a: 456,
      b: 789,
    })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT COUNT(*) AS `c` FROM `test1` WHERE `a`=456 AND `b`=789",
  );
});
test("count - limit", () => {
  const sql = Q.table("test1")
    .count("c")
    .where({
      a: 456,
      b: 789,
    })
    .limit(1)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT COUNT(*) AS `c` FROM `test1` WHERE `a`=456 AND `b`=789 LIMIT 1",
  );
});
test("count - count()", () => {
  const sql = Q.table("test1")
    .count()
    .where({
      a: 456,
      b: 789,
    })
    .limit(1)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT COUNT(*) AS `count` FROM `test1` WHERE `a`=456 AND `b`=789 LIMIT 1",
  );
});
test("count - DISTINCT", () => {
  const sql = Q.table("test1")
    .count("c", "DISTINCT `openid`")
    .where({
      a: 456,
      b: 789,
    })
    .limit(1)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT COUNT(DISTINCT `openid`) AS `c` FROM `test1` WHERE `a`=456 AND `b`=789 LIMIT 1",
  );
});

test("insert - object", () => {
  const sql = Q.table("test1")
    .insert({
      a: 123,
      b: 456,
    })
    .build();
  // utils.debug(sql);
  assertStrictEq(sql, "INSERT INTO `test1` (`a`, `b`) VALUES (123, 456)");
});
test("insert - array", () => {
  const sql = Q.table("test1")
    .insert([
      {
        a: 123,
        b: 456,
      },
      {
        a: 789,
        b: 110,
      },
    ])
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "INSERT INTO `test1` (`a`, `b`) VALUES (123, 456),\n(789, 110)",
  );
});

test("update - object", () => {
  const sql = Q.table("test1")
    .update({
      a: 123,
      b: 456,
    })
    .orderBy("a ASC")
    .build();
  // utils.debug(sql);
  assertStrictEq(sql, "UPDATE `test1` SET `a`=123, `b`=456 ORDER BY a ASC");
});
test("update - paramas array", () => {
  const sql = Q.table("test1").update("a=?, b=?", [123, 456]).build();
  // utils.debug(sql);
  assertStrictEq(sql, "UPDATE `test1` SET a=123, b=456");
});
test("update - paramas object", () => {
  const sql = Q.table("test1").update("a=:a, b=:b", { a: 123, b: 456 }).build();
  // utils.debug(sql);
  assertStrictEq(sql, "UPDATE `test1` SET a=123, b=456");
});
test("update - string", () => {
  const sql = Q.table("test1").update("`a`=123, b=456").build();
  // utils.debug(sql);
  assertStrictEq(sql, "UPDATE `test1` SET `a`=123, b=456");
});
test("update - limit", () => {
  const sql = Q.table("test1")
    .update({
      a: 123,
      b: 456,
    })
    .limit(12)
    .build();
  // utils.debug(sql);
  assertStrictEq(sql, "UPDATE `test1` SET `a`=123, `b`=456 LIMIT 12");
});
test("update - where", () => {
  const sql = Q.table("test1")
    .update({
      a: 123,
      b: 456,
    })
    .where({
      b: 777,
    })
    .limit(12)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "UPDATE `test1` SET `a`=123, `b`=456 WHERE `b`=777 LIMIT 12",
  );
});
test("update - set", () => {
  const sql = Q.table("test1")
    .update({
      a: 123,
    })
    .set({
      b: 456,
    })
    .where({
      b: 777,
    })
    .limit(12)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "UPDATE `test1` SET `a`=123, `b`=456 WHERE `b`=777 LIMIT 12",
  );
});
test("update - set", () => {
  const sql = Q.table("test1")
    .update()
    .set({
      a: 123,
      b: 456,
    })
    .where({
      b: 777,
    })
    .limit(12)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "UPDATE `test1` SET `a`=123, `b`=456 WHERE `b`=777 LIMIT 12",
  );
});
test("update - query type error", () => {
  assertThrows(
    () => {
      Q.table("test1").set({ a: 1 }).build();
    },
    AssertionError,
    "query type must be UPDATE, please call .update() before",
  );
});
test("update - connot be empty", () => {
  assertThrows(
    () => {
      Q.table("test1").update().build();
    },
    AssertionError,
    "update data connot be empty",
  );
});
test("update - empty object", () => {
  assertThrows(
    () => {
      Q.table("table")
        .update({})
        .where({
          a: 123,
        })
        .limit(456)
        .build();
    },
    AssertionError,
    "update data connot be empty",
  );
});
test("update - empty object and set", () => {
  const sql = Q.table("test1")
    .update({})
    .set({ a: 456 })
    .where({
      a: 123,
    })
    .limit(456)
    .build();
  // utils.debug(sql);
  assertStrictEq(sql, "UPDATE `test1` SET `a`=456 WHERE `a`=123 LIMIT 456");
});

test("insert or update - onDuplicateKeyUpdate", () => {
  const sql = Q.table("test1")
    .insert({ a: 123, b: 456 })
    .onDuplicateKeyUpdate()
    .set({ a: "xxx" })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "INSERT INTO `test1` (`a`, `b`) VALUES (123, 456) ON DUPLICATE KEY UPDATE `a`='xxx'",
  );
});
test("insert or update - onDuplicateKeyUpdate error", () => {
  assertThrows(
    () =>
      Q.table("test1")
        .insert([
          { a: 123, b: 456 },
          { a: 111, b: 222 },
        ])
        .onDuplicateKeyUpdate()
        .set({ a: "xxx" })
        .build(),
    AssertionError,
    "onDuplicateKeyUpdate() must inserted one row, but accutal is 2 rows",
  );
});
test("insert or update - onDuplicateKeyUpdate insert only", () => {
  assertThrows(
    () =>
      Q.table("test1")
        .select("*")
        .onDuplicateKeyUpdate()
        .set({ a: "xxx" })
        .build(),
    AssertionError,
    "onDuplicateKeyUpdate() must be called after insert()",
  );
});

test("delete - all", () => {
  const sql = Q.table("test1").delete().build();
  // utils.debug(sql);
  assertStrictEq(sql, "DELETE FROM `test1`");
});
test("delete - where", () => {
  const sql = Q.table("test1").delete().where("`a`=2").build();
  // utils.debug(sql);
  assertStrictEq(sql, "DELETE FROM `test1` WHERE `a`=2");
});
test("delete - limit", () => {
  const sql = Q.table("test1").delete().where("`a`=2").limit(1).build();
  // utils.debug(sql);
  assertStrictEq(sql, "DELETE FROM `test1` WHERE `a`=2 LIMIT 1");
});

test("sql - string build", () => {
  const sql = Q.table("test1")
    .sql(
      'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data`',
    )
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data`',
  );
});
test("sql - limit", () => {
  const sql = Q.table("test1")
    .sql(
      'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` :$limit',
    )
    .limit(10)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` LIMIT 10',
  );
});
test("sql - offset", () => {
  const sql = Q.table("test1")
    .sql(
      'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` :$limit',
    )
    .limit(10)
    .offset(5)
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` LIMIT 5,10',
  );
});
test("sql - order", () => {
  const sql = Q.table("test1")
    .sql(
      'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` :$orderBy :$limit',
    )
    .limit(10)
    .offset(5)
    .orderBy("`id` ASC")
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    'SELECT JSON_OBJECT("key1", 1, "key2", "abc", "key1", "def") as `data` ORDER BY `id` ASC LIMIT 5,10',
  );
});
test("sql - fields", () => {
  const sql = Q.table("test1")
    .sql("SELECT :$fields FROM `test1`")
    .fields("a", "b", "c")
    .limit(10)
    .offset(5)
    .orderBy("`id` ASC")
    .build();
  // utils.debug(sql);
  assertStrictEq(sql, "SELECT `a`, `b`, `c` FROM `test1`");
});

test("options - offset limit", () => {
  const sql = Q.table("test1")
    .select()
    .options({
      offset: 1,
      limit: 2,
      orderBy: "`id` DESC",
      groupBy: "`name`",
      fields: ["id", "name"],
    })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `id`, `name` FROM `test1` GROUP BY `name` ORDER BY `id` DESC LIMIT 1,2",
  );
});
test("options - skip limit", () => {
  const sql = Q.table("test1")
    .select()
    .options({
      skip: 1,
      limit: 2,
      orderBy: "`id` DESC",
      groupBy: "`name`",
      fields: ["id", "name"],
    })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `id`, `name` FROM `test1` GROUP BY `name` ORDER BY `id` DESC LIMIT 1,2",
  );
});

test("where(condition): condition for modify operation cannot be empty", () => {
  // SELECT 操作可以为空
  const sql = Q.table("test1").select("name", "age").where({}).build();
  // utils.debug(sql);
  assertStrictEq(sql, "SELECT `name`, `age` FROM `test1`");
});
test("where(condition): condition for modify operation cannot be empty", () => {
  const sql = Q.table("test1").select("name", "age").where("   ").build();
  // utils.debug(sql);
  assertStrictEq(sql, "SELECT `name`, `age` FROM `test1`");
});
// 其他操作不能为空
test("where(condition): condition for modify operation cannot be empty", () => {
  assertThrows(
    () => {
      const sql = Q.table("test1").update({ a: 123 }).where({}).build();
      //   utils.debug(sql);
    },
    AssertionError,
    "condition for modify operation cannot be empty",
  );
});
test("where(condition): condition for modify operation cannot be empty", () => {
  assertThrows(
    () => {
      const sql = Q.table("test1").delete().where("   ").build();
      //   utils.debug(sql);
    },
    AssertionError,
    "condition for modify operation cannot be empty",
  );
});

test("where(condition): condition key cannot be undefined", () => {
  assertThrows(
    () => {
      const sql = Q.table("test1")
        .update({ a: 123 })
        .where({ a: 123, b: undefined })
        .build();
      //   utils.debug(sql);
    },
    AssertionError,
    "found undefined value for condition keys b; it may caused unexpected errors",
  );
});
test("where(condition): condition key cannot be undefined", () => {
  assertThrows(
    () => {
      const sql = Q.table("test1")
        .select("name", "age")
        .where({ a: 123, b: 456, c: undefined, d: undefined })
        .build();
      //   utils.debug(sql);
    },
    AssertionError,
    "found undefined value for condition keys c,d; it may caused unexpected errors",
  );
});

test("where(condition): support for $in & $like", () => {
  const sql = Q.table("test1")
    .select("name", "age")
    .where({
      a: { $in: [1, 2, 3] },
      b: { $like: "%hello%" },
    })
    .offset(10)
    .limit(20)
    .orderBy("`a` DESC, `b` ASC")
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT `name`, `age` FROM `test1` WHERE `a` IN (1, 2, 3) AND `b` LIKE '%hello%' ORDER BY `a` DESC, `b` ASC LIMIT 10,20",
  );
});
test("where(condition): support for $in & $like", () => {
  assertThrows(
    () => {
      const sql = Q.table("test1")
        .update({ a: 123 })
        .where({ a: { $in: 123 } })
        .build();
      //   utils.debug(sql);
    },
    Error,
    "value for condition type $in in field a must be an array",
  );
});
test("where(condition): support for $in & $like", () => {
  assertThrows(
    () => {
      const sql = Q.table("test1")
        .update({ a: 123 })
        .where({ a: { $like: 123 } })
        .build();
      //   utils.debug(sql);
    },
    AssertionError,
    "value for condition type $like in a must be a string",
  );
});
test("where(condition): support for $in & $like", () => {
  const sql = Q.table("test1")
    .select()
    .where({
      a: { $eq: 1 },
      b: { $gt: 2 },
      c: { $gte: 3 },
      d: { $lt: 4 },
      e: { $lte: 5 },
      f: { $isNull: true },
      g: { $isNotNull: true },
      h: { $like: "a" },
      i: { $notLike: "b" },
      j: { $in: ["c"] },
      k: { $notIn: ["d"] },
      l: { $ne: "x" },
      m: { $raw: "CURRENT_TIMESTAMP" },
    })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "SELECT * FROM `test1` WHERE `a`=1 AND `b`>2 AND `c`>=3 AND `d`<4 AND `e`<=5 AND `f` IS NULL AND `g` IS NOT NULL AND `h` LIKE 'a' AND `i` NOT LIKE 'b' AND `j` IN ('c') AND `k` NOT IN ('d') AND `l`<>'x' AND `m`=CURRENT_TIMESTAMP",
  );
});

test("update(data): support for $incr", () => {
  const sql = Q.table("test1")
    .update({
      a: { $incr: 1 },
      b: { $decr: 2 },
      c: { $raw: "CURRENT_TIMESTAMP" },
    })
    .where({ a: 2 })
    .build();
  // utils.debug(sql);
  assertStrictEq(
    sql,
    "UPDATE `test1` SET `a`=`a`+(1), `b`=`b`-(2), `c`=CURRENT_TIMESTAMP WHERE `a`=2",
  );
});

test("build()", () => {
  assertThrows(() => Q.table("test1").build(), Error, 'invalid query type ""');
});
