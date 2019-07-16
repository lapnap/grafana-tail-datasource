// Libraries
import React, { PureComponent, ChangeEvent } from 'react';

// Types
import { TailOptions } from './types';

import { DataSourcePluginOptionsEditorProps, DataSourceSettings, FormField } from '@grafana/ui';

type TailSettings = DataSourceSettings<TailOptions>;

interface Props extends DataSourcePluginOptionsEditorProps<TailSettings> {}

interface State {}

export class TailConfigEditor extends PureComponent<Props, State> {
  state = {};

  componentDidMount() {}

  onURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      url: event.target.value,
      access: 'direct', // HARDCODE For now!
    });
  };

  onPrefixChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      prefix: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onHeadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      head: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData } = options;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="URL"
            labelWidth={6}
            onChange={this.onURLChange}
            value={options.url}
            tooltip={'NOTE: hit directly via fetch, not proxy'}
            placeholder="Tail backend server URL"
          />
        </div>
        <div className="gf-form">
          <FormField
            label="Prefix"
            labelWidth={6}
            onChange={this.onPrefixChange}
            value={jsonData.prefix}
            tooltip={'force a prefix'}
            placeholder="/var/log/"
          />
        </div>
        <div className="gf-form">
          <FormField
            label="Header"
            labelWidth={6}
            onChange={this.onHeadChange}
            value={jsonData.head}
            tooltip={'header comment prefix'}
            placeholder="# or ;"
          />
        </div>
      </div>
    );
  }
}
