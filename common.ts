export interface QueryOptionsParams {
  /**
   * 跳过的行数
   */
  skip?: number;
  /**
   * 跳过的行数
   */
  offset?: number;
  /**
   * 返回的行数
   */
  limit?: number;
  /**
   * 排序方向
   */
  orderBy?: string;
  /**
   * 分组
   */
  groupBy?: string;
  /**
   * 返回字段列表
   */
  fields?: string[];
}

export type BaseFieldType = number | string | boolean | Date | null;

export type AdvancedCondition = Record<
  string | number | symbol,
  AdvancedConditionField
>;

export type RawCondition = { $raw?: string };

export type AdvancedConditionField =
  | BaseFieldType
  | {
    /** x IN y */
    $in?: any[];
    /** x NOT IN y */
    $notIn?: any[];
    /** x LIKE y */
    $like?: string;
    /** x NOT LIKE y */
    $notLike?: string;
    /** x = y */
    $eq?: any;
    /** x <> y */
    $ne?: any;
    /** x < y */
    $lt?: any;
    /** x <= y */
    $lte?: any;
    /** x > y */
    $gt?: any;
    /** x >= y */
    $gte?: any;
    /** x IS NULL */
    $isNull?: true;
    /** x IS NOT NULL */
    $isNotNull?: true;
    /** x = y (y不做任何转义) */
    $raw?: string;
  };

export type AdvancedUpdate = Record<
  string | number | symbol,
  AdvancedUpdateField
>;

export type AdvancedUpdateField =
  | BaseFieldType
  | {
    /** x = x + y */
    $incr?: number;
    /** x = x - y */
    $decr?: number;
    /** x = y (y不做任何转义) */
    $raw?: string;
  };

export type DataRow = Record<string, any>;
