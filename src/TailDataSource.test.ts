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
    test('should give error with no path defined', () => {
      const ds = new TailDataSource(instanceSettings);
      const options = {
        targets: [{refId: 'Z'}],
      } as DataQueryRequest;

      const observer = (evt: DataStreamState) => {
        console.log('GOT', evt);
      };

      // Missing path
      return ds
        .query(options, observer)
        .then(rsp => {
          expect(true).toBeFalsy(); // FAIL!
        })
        .catch(reason => {
          expect(reason).toBe("Missing Path");
        });
    });
  });
});
