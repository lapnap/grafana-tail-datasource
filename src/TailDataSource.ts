// Types
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataStreamObserver,
  SeriesData,
  LoadingState,
} from '@grafana/ui';

import {TailQuery, TailOptions} from './types';
import {FileWorker} from './FileWorker';

export class TailDataSource extends DataSourceApi<TailQuery, TailOptions> {
  private options: TailOptions;

  constructor(instanceSettings: DataSourceInstanceSettings<TailOptions>) {
    super(instanceSettings);
    this.options = instanceSettings.jsonData;
  }

  getQueryDisplayText(query: TailQuery) {
    return `Tail: ${query.path}`;
  }

  query(
    options: DataQueryRequest<TailQuery>,
    observer: DataStreamObserver
  ): Promise<DataQueryResponse> {
    const {prefix} = this.options;

    const workers = options.targets.map(query => {
      const path = prefix ? prefix + query.path : query.path;
      return new FileWorker(path!, query, options, observer);
    });

    return new Promise(resolve => {
      let done = false;
      const timeoutId = setTimeout(() => {
        const series: SeriesData[] = [];
        for (const worker of workers) {
          worker.useStream = true;
          if (worker.state.series && worker.state.state === LoadingState.Done) {
            for (const s of worker.state.series) {
              series.push(s);
            }
          }
        }
        if (!done) {
          resolve({data: series});
        }
      }, 1000); // 1 second to finish, then start streaming

      return Promise.all(workers).then(states => {
        clearTimeout(timeoutId);

        done = true;
        const series: SeriesData[] = [];
        for (const state of states) {
          if (state.series) {
            for (const s of state.series) {
              series.push(s);
            }
          }
        }
        return {data: series};
      });
    });
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
