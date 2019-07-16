import { DataQuery, DataSourceJsonData } from '@grafana/ui';

export interface TailQuery extends DataQuery {
  path?: string;
  head?: string;
}

export interface TailOptions extends DataSourceJsonData {
  prefix?: string;
  head?: string;
}
