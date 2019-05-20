// Types
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
} from '@grafana/ui';

import {TailQuery, TailOptions} from './types';

export class TailDataSource extends DataSourceApi<TailQuery, TailOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<TailOptions>) {
    super(instanceSettings);
  }

  /**
   * Convert a query to a simple text string
   */
  getQueryDisplayText(query: TailQuery) {
    return `Get Data: ${query.path}`;
  }

  query(options: DataQueryRequest<TailQuery>): Promise<DataQueryResponse> {
    // if (!this.settings) {
    //   return Promise.reject('no settings');
    // }

    // const {url, jsonData} = this.settings;

    // console.log('FETCH', options, url, jsonData);

    return Promise.resolve({data: []});
  }

  testDatasource() {
    return new Promise((resolve, reject) => {
      resolve({
        status: 'success',
        message: 'Yes',
      });
    });
  }
}
