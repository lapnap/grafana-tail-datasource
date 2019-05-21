package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"time"
)

func main() {

	speed := 250.0
	spread := 50.0

	walker := rand.Float64() * 100
	ticker := time.NewTicker(time.Duration(speed) * time.Millisecond)

	w := bufio.NewWriter(os.Stdout)
	fmt.Fprintf(w, "#name#time,value,min,max,date\n")

	for t := range ticker.C {
		delta := rand.Float64() - 0.5
		walker += delta

		ms := t.UnixNano() / (int64(time.Millisecond) / int64(time.Nanosecond))

		fmt.Fprintf(w, "%v", ms)
		fmt.Fprintf(w, ",%.4f", walker)
		fmt.Fprintf(w, ",%.4f", walker-((rand.Float64()*spread)+0.01)) // min
		fmt.Fprintf(w, ",%.4f", walker+((rand.Float64()*spread)+0.01)) // max
		fmt.Fprintf(w, ",%s\n", t.Format(time.RFC3339Nano))
		w.Flush() // Trigger "chunked" encoding and send a chunk...
	}
}
