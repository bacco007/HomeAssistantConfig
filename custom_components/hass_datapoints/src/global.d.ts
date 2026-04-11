/**
 * Project-wide global type aliases.
 * Declared here so they are available in every TypeScript file without an import.
 */

/** A plain object whose values are not further typed. Alias for `Record<string, unknown>`. */
type RecordWithUnknownValues = Record<string, unknown>;

/** A plain object whose values are all numbers. Alias for `Record<string, number>`. */
type RecordWithNumericValues = Record<string, number>;

/** A plain object whose values are all strings. Alias for `Record<string, string>`. */
type RecordWithStringValues = Record<string, string>;

/** A value that may be absent (`null`). Alias for `T | null`. */
type Nullable<T> = T | null;

/** A cleanup / unsubscribe callback that has not yet been assigned, or a no-op teardown function. */
type NullableCleanup = Nullable<() => void>;
