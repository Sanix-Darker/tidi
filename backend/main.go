package main

import (
	"github.com/gin-gonic/gin"

	"github.com/sanix-darker/tidi/backend/handler"
)

func main() {
	router := gin.Default()
	router.GET("/socket", handler.WebsocketHandler)
	router.Run(":1324")
}

// for workers on v2
// package main

// import (
// 	"github.com/gin-gonic/gin"

// 	"github.com/madeindra/golang-websocket/handler"
// )

// func worker(id int, jobs <-chan int, results chan<- int) {
// 	for j := range jobs {
// 		router := gin.Default()
// 		router.GET("/socket", handler.WebsocketHandler)
// 		router.Run(":1324")
// 		results <- j * 2
// 	}
// }

// func main() {
// 	// We set 3 jobs
// 	// and 2 workers
// 	const numJobs = 3
// 	jobs := make(chan int, numJobs)
// 	results := make(chan int, numJobs)

// 	for w := 1; w <= 2; w++ {
// 		go worker(w, jobs, results)
// 	}

// 	for j := 1; j <= numJobs; j++ {
// 		jobs <- j
// 	}
// 	close(jobs)

// 	for a := 1; a <= numJobs; a++ {
// 		<-results
// 	}
// }
