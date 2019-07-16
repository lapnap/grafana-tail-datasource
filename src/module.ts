import { DataSourcePlugin } from '@grafana/ui';

import { TailDataSource } from './TailDataSource';
import { TailQueryEditor } from './TailQueryEditor';
import { TailConfigEditor } from './TailConfigEditor';
import { TailOptions, TailQuery } from './types';

export const plugin = new DataSourcePlugin<TailDataSource, TailQuery, TailOptions>(TailDataSource)
  .setConfigEditor(TailConfigEditor)
  .setQueryEditor(TailQueryEditor);
