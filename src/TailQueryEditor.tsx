// Libraries
import React, {PureComponent} from 'react';

// Types
import {TailDataSource} from './TailDataSource';
import {TailQuery, TailOptions} from './types';

import {FormLabel, QueryEditorProps} from '@grafana/ui';

type Props = QueryEditorProps<TailDataSource, TailQuery, TailOptions>;

interface State {}

export class TailQueryEditor extends PureComponent<Props, State> {
  state = {
    text: '',
  };

  onComponentDidMount() {}

  render() {
    const {query} = this.props;

    return (
      <div>
        <div className="gf-form">
          <FormLabel width={4}>Path</FormLabel>
          {query.path}
        </div>
      </div>
    );
  }
}
