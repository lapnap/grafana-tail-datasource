import {DataQuery, DataSourceJsonData} from '@grafana/ui';

export interface TailQuery extends DataQuery {
  path?: string;
}

export interface TailOptions extends DataSourceJsonData {
  // The datasource options
}
