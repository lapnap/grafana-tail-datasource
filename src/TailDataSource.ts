// Types
import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings, DataStreamObserver } from '@grafana/ui';

import { TailQuery, TailOptions } from './types';
import { FileWorker } from './FileWorker';

export class TailDataSource extends DataSourceApi<TailQuery, TailOptions> {
  private base = '';

  constructor(private instanceSettings: DataSourceInstanceSettings<TailOptions>) {
    super(instanceSettings);

    this.base = instanceSettings.url + '?path=';
    if (instanceSettings.jsonData.prefix) {
      this.base += encodeURI(instanceSettings.jsonData.prefix);
    }
  }

  getQueryDisplayText(query: TailQuery) {
    return `Tail: ${query.path}`;
  }

  query(options: DataQueryRequest<TailQuery>, observer: DataStreamObserver): Promise<DataQueryResponse> {
    return new Promise((resolve, reject) => {
      const workers = options.targets.map(query => {
        if (!query.path) {
          reject('Missing Path');
          return;
        }
        let url = this.base + encodeURI(query.path);
        if (query.head) {
          url += '&head=' + encodeURIComponent(query.head);
        } else if (this.instanceSettings.jsonData.head) {
          url += '&head=' + encodeURIComponent(this.instanceSettings.jsonData.head);
        }
        console.log('QUERY', url, this);
        return new FileWorker(url, query, options, observer);
      });
      console.log('WORK:', workers);
      resolve({ data: [] });
    });

    // return new Promise(resolve => {
    //   let done = false;
    //   const timeoutId = setTimeout(() => {
    //     const series: SeriesData[] = [];
    //     for (const worker of workers) {
    //       worker.useStream = true;
    //       if (worker.state.series && worker.state.state === LoadingState.Done) {
    //         for (const s of worker.state.series) {
    //           series.push(s);
    //         }
    //       }
    //     }
    //     if (!done) {
    //       resolve({data: series});
    //     }
    //   }, 1000); // 1 second to finish, then start streaming

    //   return Promise.all(workers).then(states => {
    //     clearTimeout(timeoutId);

    //     done = true;
    //     const series: SeriesData[] = [];
    //     for (const state of states) {
    //       if (state.series) {
    //         for (const s of state.series) {
    //           series.push(s);
    //         }
    //       }
    //     }
    //     return {data: series};
    //   });
    // });
  }

  testDatasource() {
    const url = this.instanceSettings.url;
    if (!url || !url.startsWith('http')) {
      return Promise.resolve({
        status: 'error',
        message: 'Invalid URL',
      });
    }

    return fetch(url + '?TEST=YES', {
      method: 'GET',
    }).then(response => {
      console.log('RESPONSE', response);
      return {
        status: 'success',
        message: 'OK',
      };
    });
  }
}
