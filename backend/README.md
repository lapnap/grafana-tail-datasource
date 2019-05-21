You can run the test backend server using:

1. Run a process to generate a signal to the file:

```
cd backend
go run signal.go | tee signal-test.csv
```

This will write continuously to the log file and to the console

2. Run the simple backend server

```
cd backend
go run server.go
```

3. Test the backend with curl

```
curl --no-buffer 'http://localhost:7777/?path=/Users/ryan/workspace/grafana-plugins/grafana-tail-datasource/backend/signal-test.csv'
```

This should look the same as running:

```
tail -f /Users/ryan/workspace/grafana-plugins/grafana-tail-datasource/backend/signal-test.csv
```
