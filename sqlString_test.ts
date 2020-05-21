import SqlString from "./sqlString.ts";
import { test, assertStrictEq, assertThrows } from "./test_deps.ts";

test("SqlString escapeId - value is quoted", () => {
  assertStrictEq(SqlString.escapeId("id"), "`id`");
});

test("SqlString escapeId - value can be a number", () => {
  assertStrictEq(SqlString.escapeId(42), "`42`");
});

test("SqlString escapeId - value can be an object", () => {
  assertStrictEq(SqlString.escapeId({}), "`[object Object]`");
});

test("SqlString escapeId - value toString is called", () => {
  assertStrictEq(
    SqlString.escapeId({
      toString: () => {
        return "foo";
      },
    }),
    "`foo`",
  );
});

test("SqlString escapeId - value toString is quoted", () => {
  assertStrictEq(
    SqlString.escapeId({
      toString: () => {
        return "f`oo";
      },
    }),
    "`f``oo`",
  );
});

test("SqlString escapeId - value containing escapes is quoted", () => {
  assertStrictEq(SqlString.escapeId("i`d"), "`i``d`");
});

test("SqlString escapeId - value containing separator is quoted", () => {
  assertStrictEq(SqlString.escapeId("id1.id2"), "`id1`.`id2`");
});

test("SqlString escapeId - value containing separator and escapes is quoted", () => {
  assertStrictEq(SqlString.escapeId("id`1.i`d2"), "`id``1`.`i``d2`");
});

test("SqlString escapeId - value containing separator is fully escaped when forbidQualified", () => {
  assertStrictEq(SqlString.escapeId("id1.id2", true), "`id1.id2`");
});

test("SqlString escapeId - arrays are turned into lists", () => {
  assertStrictEq(SqlString.escapeId(["a", "b", "t.c"]), "`a`, `b`, `t`.`c`");
});

test("SqlString escapeId - nested arrays are flattened", () => {
  assertStrictEq(
    SqlString.escapeId(["a", ["b", ["t.c"]]]),
    "`a`, `b`, `t`.`c`",
  );
});

test("SqlString escape - undefined -> NULL", () => {
  assertStrictEq(SqlString.escape(undefined), "NULL");
});

test("SqlString escape - null -> NULL", () => {
  assertStrictEq(SqlString.escape(null), "NULL");
});

test("SqlString escape - booleans convert to strings", () => {
  assertStrictEq(SqlString.escape(false), "false");
  assertStrictEq(SqlString.escape(true), "true");
});

test("SqlString escape - numbers convert to strings", () => {
  assertStrictEq(SqlString.escape(5), "5");
});

test("SqlString escape - raw not escaped", () => {
  assertStrictEq(SqlString.escape(SqlString.raw("NOW()")), "NOW()");
});

test("SqlString escape - objects are turned into key value pairs", () => {
  assertStrictEq(SqlString.escape({ a: "b", c: "d" }), "`a` = 'b', `c` = 'd'");
});

test("SqlString escape - objects function properties are ignored", () => {
  assertStrictEq(SqlString.escape({ a: "b", c: () => {} }), "`a` = 'b'");
});

test("SqlString escape - object values toSqlString is called", () => {
  assertStrictEq(
    SqlString.escape({
      id: {
        toSqlString: () => {
          return "LAST_INSERT_ID()";
        },
      },
    }),
    "`id` = LAST_INSERT_ID()",
  );
});

test("SqlString escape - objects toSqlString is called", () => {
  assertStrictEq(
    SqlString.escape({
      toSqlString: () => {
        return "@foo_id";
      },
    }),
    "@foo_id",
  );
});

test("SqlString escape - objects toSqlString is not quoted", () => {
  assertStrictEq(
    SqlString.escape({
      toSqlString: () => {
        return "CURRENT_TIMESTAMP()";
      },
    }),
    "CURRENT_TIMESTAMP()",
  );
});

test("SqlString escape - nested objects are cast to strings", () => {
  assertStrictEq(
    SqlString.escape({ a: { nested: true } }),
    "`a` = '[object Object]'",
  );
});

test("SqlString escape - nested objects use toString", () => {
  assertStrictEq(
    SqlString.escape({
      a: {
        toString: () => {
          return "foo";
        },
      },
    }),
    "`a` = 'foo'",
  );
});

test("SqlString escape - nested objects use toString is quoted", () => {
  assertStrictEq(
    SqlString.escape({
      a: {
        toString: () => {
          return "f'oo";
        },
      },
    }),
    "`a` = 'f\\'oo'",
  );
});

test("SqlString escape - arrays are turned into lists", () => {
  assertStrictEq(SqlString.escape([1, 2, "c"]), "1, 2, 'c'");
});

test("SqlString escape - nested arrays are turned into grouped lists", () => {
  assertStrictEq(
    SqlString.escape([
      [1, 2, 3],
      [4, 5, 6],
      ["a", "b", { nested: true }],
    ]),
    "(1, 2, 3), (4, 5, 6), ('a', 'b', '[object Object]')",
  );
});

test("SqlString escape - nested objects inside arrays are cast to strings", () => {
  assertStrictEq(
    SqlString.escape([1, { nested: true }, 2]),
    "1, '[object Object]', 2",
  );
});

test("SqlString escape - nested objects inside arrays use toString", () => {
  assertStrictEq(
    SqlString.escape([
      1,
      {
        toString: () => {
          return "foo";
        },
      },
      2,
    ]),
    "1, 'foo', 2",
  );
});

test("SqlString escape - strings are quoted", () => {
  assertStrictEq(SqlString.escape("Super"), "'Super'");
});

test("SqlString escape - \\0 gets escaped", () => {
  assertStrictEq(SqlString.escape("Sup\0er"), "'Sup\\0er'");
  assertStrictEq(SqlString.escape("Super\0"), "'Super\\0'");
});

test("SqlString escape - \\b gets escaped", () => {
  assertStrictEq(SqlString.escape("Sup\ber"), "'Sup\\ber'");
  assertStrictEq(SqlString.escape("Super\b"), "'Super\\b'");
});

test("SqlString escape - \\n gets escaped", () => {
  assertStrictEq(SqlString.escape("Sup\ner"), "'Sup\\ner'");
  assertStrictEq(SqlString.escape("Super\n"), "'Super\\n'");
});

test("SqlString escape - \\r gets escaped", () => {
  assertStrictEq(SqlString.escape("Sup\rer"), "'Sup\\rer'");
  assertStrictEq(SqlString.escape("Super\r"), "'Super\\r'");
});

test("SqlString escape - \\t gets escaped", () => {
  assertStrictEq(SqlString.escape("Sup\ter"), "'Sup\\ter'");
  assertStrictEq(SqlString.escape("Super\t"), "'Super\\t'");
});

test("SqlString escape - \\ gets escaped", () => {
  assertStrictEq(SqlString.escape("Sup\\er"), "'Sup\\\\er'");
  assertStrictEq(SqlString.escape("Super\\"), "'Super\\\\'");
});

test("SqlString escape - \\u001a (ascii 26) gets replaced with \\Z", () => {
  assertStrictEq(SqlString.escape("Sup\u001aer"), "'Sup\\Zer'");
  assertStrictEq(SqlString.escape("Super\u001a"), "'Super\\Z'");
});

test("SqlString escape - single quotes get escaped", () => {
  assertStrictEq(SqlString.escape("Sup'er"), "'Sup\\'er'");
  assertStrictEq(SqlString.escape("Super'"), "'Super\\''");
});

test("SqlString escape - double quotes get escaped", () => {
  assertStrictEq(SqlString.escape('Sup"er'), "'Sup\\\"er'");
  assertStrictEq(SqlString.escape('Super"'), "'Super\\\"'");
});

test("SqlString escape - dates are converted to YYYY-MM-DD HH:II:SS.sss", () => {
  var expected = "2012-05-07 11:42:03.002";
  var date = new Date(2012, 4, 7, 11, 42, 3, 2);
  var string = SqlString.escape(date);

  assertStrictEq(string, "'" + expected + "'");
});

test('SqlString.escape - dates are converted to specified time zone "Z"', () => {
  var expected = "2012-05-07 11:42:03.002";
  var date = new Date(Date.UTC(2012, 4, 7, 11, 42, 3, 2));
  var string = SqlString.escape(date, false, "Z");

  assertStrictEq(string, "'" + expected + "'");
});

test('SqlString.escape - dates are converted to specified time zone "+01"', () => {
  var expected = "2012-05-07 12:42:03.002";
  var date = new Date(Date.UTC(2012, 4, 7, 11, 42, 3, 2));
  var string = SqlString.escape(date, false, "+01");

  assertStrictEq(string, "'" + expected + "'");
});

test('SqlString.escape - dates are converted to specified time zone "+0200"', () => {
  var expected = "2012-05-07 13:42:03.002";
  var date = new Date(Date.UTC(2012, 4, 7, 11, 42, 3, 2));
  var string = SqlString.escape(date, false, "+0200");

  assertStrictEq(string, "'" + expected + "'");
});

test('SqlString.escape - dates are converted to specified time zone "-05:00"', () => {
  var expected = "2012-05-07 06:42:03.002";
  var date = new Date(Date.UTC(2012, 4, 7, 11, 42, 3, 2));
  var string = SqlString.escape(date, false, "-05:00");

  assertStrictEq(string, "'" + expected + "'");
});

test("SqlString escape - dates are converted to UTC for unknown time zone", () => {
  var date = new Date(Date.UTC(2012, 4, 7, 11, 42, 3, 2));
  var expected = SqlString.escape(date, false, "Z");
  var string = SqlString.escape(date, false, "foo");

  assertStrictEq(string, expected);
});

test("SqlString escape - invalid dates are converted to null", () => {
  var date = new Date(NaN);
  var string = SqlString.escape(date);

  assertStrictEq(string, "NULL");
});

//   test('SqlString.escape - buffers are converted to hex', function() {
//     var buffer = new Buffer([0, 1, 254, 255]);
//     var string = SqlString.escape(buffer);

//     assertStrictEq(string, "X'0001feff'");
//   });

//   test('SqlString.escape - buffers object cannot inject SQL', function() {
//     var buffer = new Buffer([0, 1, 254, 255]);
//     buffer.toString = function() { return "00' OR '1'='1"; };
//     var string = SqlString.escape(buffer);

//     assertStrictEq(string, "X'00\\' OR \\'1\\'=\\'1'");
//   });

test("SqlString escape - NaN -> NaN", () => {
  assertStrictEq(SqlString.escape(NaN), "NaN");
});

test("SqlString escape - Infinity -> Infinity", () => {
  assertStrictEq(SqlString.escape(Infinity), "Infinity");
});

// test('SqlString.format', {
test("SqlString format - question marks are replaced with escaped array values", () => {
  var sql = SqlString.format("? and ?", ["a", "b"]);
  assertStrictEq(sql, "'a' and 'b'");
});

test("SqlString format - double quest marks are replaced with escaped id", () => {
  var sql = SqlString.format("SELECT * FROM ?? WHERE id = ?", ["table", 42]);
  assertStrictEq(sql, "SELECT * FROM `table` WHERE id = 42");
});

test("SqlString format - triple question marks are ignored", () => {
  var sql = SqlString.format("? or ??? and ?", ["foo", "bar", "fizz", "buzz"]);
  assertStrictEq(sql, "'foo' or ??? and 'bar'");
});

test("SqlString format - extra question marks are left untouched", () => {
  var sql = SqlString.format("? and ?", ["a"]);
  assertStrictEq(sql, "'a' and ?");
});

test("SqlString format - extra arguments are not used", () => {
  var sql = SqlString.format("? and ?", ["a", "b", "c"]);
  assertStrictEq(sql, "'a' and 'b'");
});

test("SqlString format - question marks within values do not cause issues", () => {
  var sql = SqlString.format("? and ?", ["hello?", "b"]);
  assertStrictEq(sql, "'hello?' and 'b'");
});

test("SqlString format - undefined is ignored", () => {
  var sql = SqlString.format("?", undefined, false);
  assertStrictEq(sql, "?");
});

test("SqlString format - objects is converted to values", () => {
  var sql = SqlString.format("?", { hello: "world" }, false);
  assertStrictEq(sql, "`hello` = 'world'");
});

test("SqlString format - objects is not converted to values", () => {
  var sql = SqlString.format("?", { hello: "world" }, true);
  assertStrictEq(sql, "'[object Object]'");

  var sql = SqlString.format(
    "?",
    {
      toString: () => {
        return "hello";
      },
    },
    true,
  );
  assertStrictEq(sql, "'hello'");

  var sql = SqlString.format(
    "?",
    {
      toSqlString: () => {
        return "@foo";
      },
    },
    true,
  );
  assertStrictEq(sql, "@foo");
});

test("SqlString format - sql is untouched if no values are provided", () => {
  var sql = SqlString.format("SELECT ??");
  assertStrictEq(sql, "SELECT ??");
});

test("SqlString format - sql is untouched if values are provided but there are no placeholders", () => {
  var sql = SqlString.format("SELECT COUNT(*) FROM table", ["a", "b"]);
  assertStrictEq(sql, "SELECT COUNT(*) FROM table");
});

test("SqlString raw - creates object", () => {
  assertStrictEq(typeof SqlString.raw("NOW()"), "object");
});

test("SqlString raw - rejects number", () => {
  assertThrows(() => {
    SqlString.raw(42 as any);
  });
});

// test("SqlString raw - rejects undefined", () =>{
//   assert.throws () =>{
//     SqlString.raw();
//   });
// });

test("SqlString raw - object has toSqlString", () => {
  assertStrictEq(typeof SqlString.raw("NOW()").toSqlString, "function");
});

test("SqlString raw - toSqlString returns sql as-is", () => {
  assertStrictEq(
    SqlString.raw("NOW() AS 'current_time'").toSqlString(),
    "NOW() AS 'current_time'",
  );
});
