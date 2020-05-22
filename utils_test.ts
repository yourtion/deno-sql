import {
  sqlConditionStrings,
  sqlFormat,
  sqlFormatObject,
  sqlUpdateString,
} from "./utils.ts";
import {
  test,
  assertEquals,
  assertThrows,
  AssertionError,
} from "./test_deps.ts";

class TestQuery {
  build() {
    return "xxx";
  }
}
class TestQuery2 {
  build() {
    return 123;
  }
}

test("utils sqlConditionString - $lt and $lte", () => {
  assertEquals(sqlConditionStrings({ a: { $lt: 123, $lte: 456 } }), [
    "`a`<123",
    "`a`<=456",
  ]);
});

test("utils sqlConditionString - $gt and $gte", () => {
  assertEquals(sqlConditionStrings({ a: { $gt: 123, $gte: 456 } }), [
    "`a`>123",
    "`a`>=456",
  ]);
});

test("utils sqlConditionString - $eq", () => {
  assertEquals(sqlConditionStrings({ a: { $eq: "aaa" } }), ["`a`='aaa'"]);
});

test("utils sqlConditionString - $like", () => {
  assertEquals(sqlConditionStrings({ a: { $like: "xx%" } }), [
    "`a` LIKE 'xx%'",
  ]);
});

test("utils sqlConditionString - $notLike", () => {
  assertEquals(sqlConditionStrings({ a: { $notLike: "xx%" } }), [
    "`a` NOT LIKE 'xx%'",
  ]);
});

test("utils sqlConditionString - $in [1, 2, 3]", () => {
  assertEquals(sqlConditionStrings({ a: { $in: [1, 2, 3] } }), [
    "`a` IN (1, 2, 3)",
  ]);
});

test("utils sqlConditionString - $in object", () => {
  assertEquals(sqlConditionStrings({ a: { $in: new TestQuery() } }), [
    "`a` IN (xxx)",
  ]);
});

test("utils sqlConditionString - $in []", () => {
  assertEquals(sqlConditionStrings({ a: { $in: [] } }), [
    "0 /* empty list warn: `a` IN () */",
  ]);
});

test("utils sqlConditionString - $notIn [1, 2, 3", () => {
  assertEquals(sqlConditionStrings({ a: { $notIn: [1, 2, 3] } }), [
    "`a` NOT IN (1, 2, 3)",
  ]);
});

test("utils sqlConditionString - $notIn object", () => {
  assertEquals(sqlConditionStrings({ a: { $notIn: new TestQuery() } }), [
    "`a` NOT IN (xxx)",
  ]);
});

test("utils sqlConditionString - $notIn []", () => {
  assertEquals(sqlConditionStrings({ a: { $notIn: [] } }), [
    "1 /* empty list warn: `a` NOT IN () */",
  ]);
});

test("utils sqlConditionString - $xxx error", () => {
  assertThrows(
    () => sqlConditionStrings({ a: { $xxx: 1 } }),
    Error,
    "not supported",
  );
});

test("utils sqlConditionString - build() function", () => {
  assertThrows(
    () => sqlConditionStrings({ a: { $in: new TestQuery2() } }),
    AssertionError,
    "build() must returns a string",
  );
});

test("utils sqlConditionString - $in array", () => {
  assertThrows(
    () => sqlConditionStrings({ a: { $in: false } }),
    Error,
    "must be an array",
  );
});

test("utils sqlConditionString - build() return string", () => {
  assertThrows(
    () => sqlConditionStrings({ a: { $notIn: new TestQuery2() } }),
    AssertionError,
    "build() must returns a string",
  );
});

test("utils sqlConditionString - $notIn array", () => {
  assertThrows(
    () => sqlConditionStrings({ a: { $notIn: false } }),
    Error,
    "must be an array",
  );
});

test("utils sqlFormat - ? format", () => {
  assertEquals(
    sqlFormat("a=? AND ??=? AND ??? AND ??? AND d=?", [
      123,
      "b",
      456,
      new TestQuery(),
      "yyy",
      789,
    ]),
    "a=123 AND `b`=456 AND (xxx) AND yyy AND d=789",
  );
});

test("utils sqlFormat - number error", () => {
  assertThrows(
    () => sqlFormat("???", [123]),
    Error,
    "must be a string or QueryBuilder instance",
  );
});

test("utils sqlFormat - boolean error", () => {
  assertThrows(
    () => sqlFormat("???", [false]),
    Error,
    "must be a string or QueryBuilder instance",
  );
});

test("utils sqlFormat - object error", () => {
  assertThrows(
    () => sqlFormat("???", [new TestQuery2()]),
    AssertionError,
    "build() must returns a string",
  );
});

test("utils sqlFormat - :1 format", () => {
  assertEquals(
    sqlFormatObject("a=:1 AND ::2=:3 AND :::4 AND :::5 AND d=:6", {
      "1": 123,
      "2": "b",
      "3": 456,
      "4": new TestQuery(),
      "5": "yyy",
      "6": 789,
    }),
    "a=123 AND `b`=456 AND (xxx) AND yyy AND d=789",
  );
});

test("utils sqlFormat - object error", () => {
  assertThrows(
    () => sqlFormatObject(":::a", { a: 123 }),
    Error,
    "must be a string or QueryBuilder instance",
  );
});

test("utils sqlFormat - boolean error ", () => {
  assertThrows(
    () => sqlFormatObject(":::a", { a: false }),
    Error,
    "must be a string or QueryBuilder instance",
  );
});

test("utils sqlFormat - class error", () => {
  assertThrows(
    () => sqlFormatObject(":::a", { a: new TestQuery2() }),
    AssertionError,
    "build() must returns a string",
  );
});

test("utils sqlFormat - empty object", () => {
  assertEquals(sqlFormatObject(":a", {}), ":a");
});

test("utils sqlFormat - null info", () => {
  assertEquals(sqlFormatObject(":a"), ":a");
});

test("utils sqlUpdateString - $incr", () => {
  assertEquals(sqlUpdateString({ a: { $incr: 123 } }), "`a`=`a`+(123)");
});

test("utils sqlUpdateString - $decr", () => {
  assertEquals(sqlUpdateString({ a: { $decr: 123 } }), "`a`=`a`-(123)");
});

test("utils sqlUpdateString - $raw", () => {
  assertEquals(sqlUpdateString({ a: { $raw: "now()" } }), "`a`=now()");
});

test("utils sqlUpdateString - $xxx error", () => {
  assertThrows(
    () => sqlUpdateString({ a: { $xxx: 123 } }),
    Error,
    "does not supported",
  );
});
