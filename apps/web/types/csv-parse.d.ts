declare module 'csv-parse/sync' {
  export function parse(
    input: string | Buffer,
    options?: {
      columns?: boolean | string[] | ((record: string[]) => string[]);
      skip_empty_lines?: boolean;
      trim?: boolean;
      delimiter?: string;
      from?: number;
      to?: number;
      skip_lines_with_error?: boolean;
      skip_records_with_error?: boolean;
      relax_column_count?: boolean;
      relax_quotes?: boolean;
      cast?: boolean;
      cast_date?: boolean;
      comment?: string;
      escape?: string;
      ltrim?: boolean;
      rtrim?: boolean;
      record_delimiter?: string | string[];
      quote?: string;
      [key: string]: any;
    }
  ): any[];
}