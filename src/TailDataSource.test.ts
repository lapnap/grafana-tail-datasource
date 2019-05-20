import {TailDataSource} from './TailDataSource';
import {TailOptions} from './types';
import {readCSV, DataSourceInstanceSettings, PluginMeta, DataQueryRequest} from '@grafana/ui';

describe('InputDatasource', () => {
  const data = readCSV('a,b,c\n1,2,3\n4,5,6');
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

      return ds.query(options).then(rsp => {
        expect(rsp.data.length).toBe(1);

        const series = rsp.data[0];
        expect(series.refId).toBe('Z');
        expect(series.rows).toEqual(data[0].rows);
      });
    });
  });
});
