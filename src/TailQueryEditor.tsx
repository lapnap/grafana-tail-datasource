// Libraries
import React, { PureComponent, ChangeEvent } from 'react';

// Types
import { TailDataSource } from './TailDataSource';
import { TailQuery, TailOptions } from './types';

import { QueryEditorProps, FormField } from '@grafana/ui';

type Props = QueryEditorProps<TailDataSource, TailQuery, TailOptions>;

interface State {}

export class TailQueryEditor extends PureComponent<Props, State> {
  onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, path: event.target.value });
  };

  render() {
    const { query } = this.props;

    return (
      <div className="gf-form">
        <FormField
          label="Path"
          labelWidth={6}
          onChange={this.onPathChange}
          value={query.path}
          tooltip={'The HTTP request path'}
          placeholder="/var/log/path.log"
        />
      </div>
    );
  }
}
