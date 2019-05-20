import {TailDataSource} from './TailDataSource';
import {TailOptions} from './types';
import {
  DataSourceInstanceSettings,
  PluginMeta,
  DataQueryRequest,
  DataStreamState,
} from '@grafana/ui';

describe('TailDatasource', () => {
  const instanceSettings: DataSourceInstanceSettings<TailOptions> = {
    id: 1,
    type: 'x',
    name: 'xxx',
    url: 'hello',
    meta: {} as PluginMeta,
    jsonData: {},
  };

  describe('when querying', () => {
    test('should return the saved data with a query', () => {
      const ds = new TailDataSource(instanceSettings);
      const options = {
        targets: [{refId: 'Z'}],
      } as DataQueryRequest;

      const observer = (evt: DataStreamState) => {
        console.log('GOT', evt);
      };

      return ds.query(options, observer).then(rsp => {
        expect(rsp.data.length).toBe(1);

        const series = rsp.data[0];
        expect(series.refId).toBe('Z');
      });
    });
  });
});
