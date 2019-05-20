You can run the test backend server using:

```
cd public/app/plugins/datasource/streaming/method/fetch/
go run server.go
```

You can see the output with:

```
curl --no-buffer 'http://localhost:7777/?path=/var/log/ryan.txt'
```
