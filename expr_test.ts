import Q from "./mod.ts";
import { test, assertStrictEq } from "./test_deps.ts";

test("expr and", () => {
  const sql = Q.expr()
    .and("a=?", [123])
    .and({ b: 456 })
    .and({ c: { $in: [789] } })
    .build();
  assertStrictEq(sql, "(a=123 AND `b`=456 AND `c` IN (789))");
});

test("expr or", () => {
  const sql = Q.expr()
    .or("a=?", [123])
    .or({ b: 456 })
    .or({ c: { $in: [789] } })
    .build();
  assertStrictEq(sql, "(a=123 OR `b`=456 OR `c` IN (789))");
});

test("expr and & or", () => {
  const sql = Q.expr()
    .and("a=?", [123])
    .or({ b: 456 })
    .and({ c: { $in: [789] } })
    .or("d=:d", { d: 666 })
    .build();
  assertStrictEq(sql, "(a=123 OR `b`=456 AND `c` IN (789) OR d=666)");
});

test("expr in query", () => {
  const sql = Q.select("*")
    .from("test")
    .where(
      Q.expr()
        .and("a=?", [123])
        .or({ b: 456 })
        .and({ c: { $in: [789] } })
        .or("d=:d", { d: 666 }),
    )
    .and(Q.expr().format("x=? AND y=? AND z=?", ["a", "b", "c"]))
    .build();
  assertStrictEq(
    sql,
    "SELECT * FROM `test` WHERE (a=123 OR `b`=456 AND `c` IN (789) OR d=666) AND x='a' AND y='b' AND z='c'",
  );
});
