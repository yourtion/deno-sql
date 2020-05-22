import { assert } from "./deps.ts";
import * as utils from "./utils.ts";
import { DataRow, AdvancedCondition } from "./common.ts";

export class Expression {
  protected _type: string = "";
  protected _data: string = "";

  /**
   * 格式化模板字符串
   * @param tpl
   * @param values
   */
  public format(tpl: string, values?: DataRow | any[]): string {
    assert(typeof tpl == "string", `first parameter must be a string`);
    if (!values) {
      return tpl;
    }
    assert(
      Array.isArray(values) || typeof values === "object",
      "second parameter must be an array or object",
    );
    if (Array.isArray(values)) {
      return utils.sqlFormat(tpl, values);
    }
    return utils.sqlFormatObject(tpl, values);
  }

  /**
   * 添加条件
   * @param connector
   * @param condition
   * @param values
   */
  protected combineCondition(
    connector: string,
    condition: string | AdvancedCondition,
    values?: DataRow | any[],
  ): this {
    const t = typeof condition;
    assert(
      this._type === "" || this._type === "condition",
      `cannot change expression type: ${this._type}`,
    );
    assert(condition, `missing condition`);
    assert(
      t === "string" || t === "object",
      `condition must be a string or object`,
    );
    if (typeof condition === "string") {
      this._data += ` ${connector} ${this.format(condition, values || [])}`;
    } else {
      const keys = utils.findKeysForUndefinedValue(condition);
      assert(
        keys.length < 1,
        `found undefined value for condition keys ${keys}; it may caused unexpected errors`,
      );
      this._data += ` ${connector} ${
        utils.sqlConditionStrings(
          condition as any,
        )
      }`;
    }
    this._type = "condition";
    return this;
  }

  /**
   * 查询条件 and
   * @param condition
   * @param values
   */
  public and(
    condition: string | AdvancedCondition,
    values?: DataRow | any[],
  ): this {
    return this.combineCondition("AND", condition, values);
  }

  /**
   * 查询条件 or
   * @param condition
   * @param values
   */
  public or(
    condition: string | AdvancedCondition,
    values?: DataRow | any[],
  ): this {
    return this.combineCondition("OR", condition, values);
  }

  /**
   * 生成表达式 SQL 语句
   */
  public build(): string {
    let str = this._data.trim();
    assert(str, `expression cannot be empty`);
    if (str.indexOf("AND ") === 0) str = str.slice(4);
    if (str.indexOf("OR ") === 0) str = str.slice(3);
    return "(" + str + ")";
  }
}
