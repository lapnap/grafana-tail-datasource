import {
  DataQueryRequest,
  DataStreamObserver,
  DataStreamState
} from '@grafana/ui';

import {
  DataFrame,
  LoadingState,
  CSVReader,
} from '@grafana/data';

import {TailQuery} from 'types';

export class FileWorker {
  controller = new AbortController();
  csv?: CSVReader;
  reader?: ReadableStreamReader<Uint8Array>;
  state: DataStreamState;
  useStream = true; // starts as false
  cancel = false;
  chunkCount = 0;
  last = Date.now();
  series: DataFrame;
  pending = '';
  maxRows: number;

  constructor(
    url: string,
    query: TailQuery,
    request: DataQueryRequest,
    private observer: DataStreamObserver
  ) {
    //this.csv = new CSVReader({callback: this});
    this.state = {
      key: query.refId,
      state: LoadingState.Loading,
      request,
      unsubscribe: this.unsubscribe,
    };
    // Just a stub
    this.series = {
      fields: [],
      rows: [],
    };

    this.maxRows = request.maxDataPoints * 2;

    fetch(
      new Request(url, {
        method: 'GET',
        signal: this.controller.signal,
      })
    ).then(r => {
      if (r.status !== 200) {
        this.state.error = {
          message: 'error loading url',
          status: r.status + '',
          statusText: r.statusText,
          refId: query.refId,
        };
        this.state.state = LoadingState.Error;
        if (this.useStream) {
          this.observer(this.state);
        }
      } else if (r.body) {
        this.state.state = LoadingState.Streaming;
        this.reader = r.body.getReader();
        this.reader
          .read()
          .then(this.processChunk)
          .then(() => {
            return this.state;
          });
      } else {
        this.state.error = {
          message: 'Missing Response Body',
          refId: query.refId,
        };
        this.state.state = LoadingState.Error;
      }
    });
  }

  unsubscribe = () => {
    const {state} = this.state;
    if (state === LoadingState.Loading || LoadingState.Streaming) {
      this.controller.abort();
    }
  };

  processChunk = (value: ReadableStreamReadResult<Uint8Array>): any => {
    if (!this.csv) {
      this.csv = new CSVReader({callback: this});
    }
    this.chunkCount++;
    this.last = Date.now();

    if (value.value) {
      const text = new TextDecoder().decode(value.value);
      // const idx = (value.done) ? text.length : text.lastIndexOf('\n')+1;
      // if(idx>0) {
      //   const isSplit = idx !== text.length;
      //   const process = isSplit ? text.substr(0,idx) : text;
      //   this.csv.readCSV(this.pending + process);
      //   this.pending = isSplit ? text.substr(idx) : '';
      // }
      // else {
      //   this.pending += text;
      // }
      this.csv.readCSV(text);
    }

    if (value.done && this.state.state !== LoadingState.Error) {
      this.state.state = LoadingState.Done;
    }

    // Clip the rows
    for (const s of this.state.series!) {
      const extra = this.maxRows - s.rows.length;
      if (extra < 0) {
        s.rows = s.rows.slice(extra * -1);
      }
    }

    if (this.useStream) {
      this.observer(this.state);
    }

    if (value.done) {
      return;
    }
    return this.reader!.read().then(this.processChunk);
  };

  onHeader = (series: DataFrame) => {
    series.refId = this.state.key;
    this.series = series;
    this.state.series = [series];
  };

  onRow = (row: any[]) => {
    if (!row || !row.length) {
      return; // skip
    }
    const series = this.series;
    if (row.length === 1 && row.length !== series.fields.length) {
      return; //skip;
    }

    if (!series.rows) {
      series.rows = [];
    }
    series.rows.push(row);
  };
}
