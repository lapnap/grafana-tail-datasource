package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"sync"
)

var counter int

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Tail Backend Listening on port: 7777")
	if err := http.ListenAndServe(":7777", nil); err != nil {
		panic(err)
	}
}

func setupResponse(w *http.ResponseWriter, req *http.Request) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func handler(w http.ResponseWriter, r *http.Request) {
	setupResponse(&w, r)
	if (*r).Method == "OPTIONS" {
		return
	}
	counter = counter + 1
	id := counter

	flusher, ok := w.(http.Flusher)
	if !ok {
		panic("expected http.ResponseWriter to be an http.Flusher")
	}

	query := r.URL.Query()
	if query.Get("TEST") != "" {
		fmt.Fprintln(w, "OK")
		return
	}

	path := query.Get("path")
	if path == "" {
		http.Error(w, "Missing path parameter", http.StatusBadRequest)
		return
	}
	if !strings.HasPrefix(path, "/var/log/") {
		dir, _ := os.Getwd()
		if !strings.HasPrefix(path, dir) {
			// TODO: obviously more configurable
			http.Error(w, "Path must start with /var/log/ OR "+dir, http.StatusBadRequest)
			return
		}
	}

	fi, err := os.Stat(path)
	if err != nil {
		http.Error(w, "Path does not exist: "+path, http.StatusBadRequest)
		return
	}
	if fi.Mode().IsDir() {
		http.Error(w, "Path is a directory", http.StatusBadRequest)
		return
	}

	cmd := exec.Command("tail", "-f", path)
	if runtime.GOOS == "windows" {
		http.Error(w, "TODO, call powershell (windows not yet supported)", http.StatusInternalServerError)
		return
	}

	fmt.Printf("[%d] Tail: %s\n", id, path)

	// Started with:
	// https://github.com/kjk/go-cookbook/blob/master/advanced-exec/03-live-progress-and-capture-v1.go
	stdoutIn, _ := cmd.StdoutPipe()
	stderrIn, _ := cmd.StderrPipe()
	err = cmd.Start()
	if err != nil {
		log.Fatalf("cmd.Start() failed with '%s'\n", err)
		http.Error(w, "Error starting", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/plain") // or from file...

	// cmd.Wait() should be called only after we finish reading
	// from stdoutIn and stderrIn.
	// wg ensures that we finish
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		if copyToStream(w, stdoutIn, flusher) != nil {
			// http.Error(w, "Error reading stdoutIn", http.StatusInternalServerError)
		}
		wg.Done()
	}()

	if copyToStream(w, stderrIn, flusher) != nil {
		// http.Error(w, "Error reading stderrIn", http.StatusInternalServerError)
	}

	wg.Wait()

	err = cmd.Wait()
	if err != nil {
		log.Fatalf("cmd.Run() failed with %s\n", err)
		http.Error(w, "Failed", http.StatusInternalServerError)
		return
	}
	flusher.Flush()
}

func copyToStream(w io.Writer, r io.Reader, flusher http.Flusher) error {
	for {
		buf := make([]byte, 1024, 1024) // TOOD? reuse buffer?
		_, err := r.Read(buf[:])
		if err != nil {
			return err
		}

		_, err = w.Write(buf)
		flusher.Flush()

		if err != nil {
			return err
		}
	}
}
