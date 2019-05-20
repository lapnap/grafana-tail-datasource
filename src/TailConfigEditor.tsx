// Libraries
import React, {PureComponent} from 'react';

// Types
import {TailOptions} from './types';

import {DataSourcePluginOptionsEditorProps, DataSourceSettings} from '@grafana/ui';

type TailSettings = DataSourceSettings<TailOptions>;

interface Props extends DataSourcePluginOptionsEditorProps<TailSettings> {}

interface State {}

export class TailConfigEditor extends PureComponent<Props, State> {
  state = {};

  componentDidMount() {}

  render() {
    return <div>TODO... field editor...</div>;
  }
}
