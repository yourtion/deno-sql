export * from "./query.ts";
export * from "./utils.ts";
export * from "./common.ts";
export * from "./expr.ts";

import { QueryBuilder } from "./query.ts";
export default QueryBuilder;

export interface IConnection {
  query(sql: string, params?: any[]): Promise<any>;
}

/**
 * 执行查询
 * @param conn MySQL连接实例
 * @param q 查询
 */
function query<T = any>(
  conn: IConnection,
  q: QueryBuilder | string
): Promise<T> {
  return conn.query(typeof q === "string" ? q : q.build());
}

const table = QueryBuilder.table;
const expr = QueryBuilder.expr;
export { table, expr, query };
