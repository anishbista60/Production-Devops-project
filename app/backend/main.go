package main

import (
	"log"

	"github.com/anishbista60/production-devops-project/database"
	"github.com/anishbista60/production-devops-project/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	log.Println("Starting server...")
	router := gin.Default()
	router.Use(cors.Default())

	db := database.Connect()
	if db == nil {
		log.Fatal("Failed to connect to database")
	}
	defer db.Close()

	router.GET("/health", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			log.Println("Database health check failed:", err)
			c.JSON(500, gin.H{"status": "unhealthy", "error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"status": "healthy"})
	})

	router.GET("/todos", func(c *gin.Context) {
		log.Println("Fetching all todos")
		rows, err := db.Query("SELECT id, title, completed FROM todos")
		if err != nil {
			log.Println("Error fetching todos:", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		todos := []models.Todo{}
		for rows.Next() {
			var todo models.Todo
			if err := rows.Scan(&todo.ID, &todo.Title, &todo.Completed); err != nil {
				log.Println("Error scanning todo row:", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			todos = append(todos, todo)
		}
		log.Println("Successfully fetched todos")
		c.JSON(200, todos)
	})

	router.POST("/todos", func(c *gin.Context) {
		log.Println("Creating a new todo")
		var todo models.Todo
		if err := c.BindJSON(&todo); err != nil {
			log.Println("Invalid request payload:", err)
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		err := db.QueryRow(
			"INSERT INTO todos(title, completed) VALUES($1, $2) RETURNING id",
			todo.Title, todo.Completed).Scan(&todo.ID)

		if err != nil {
			log.Println("Error inserting todo:", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully created todo with ID:", todo.ID)
		c.JSON(200, todo)
	})

	router.PUT("/todos/:id", func(c *gin.Context) {
		id := c.Param("id")
		log.Println("Updating todo with ID:", id)
		var todo models.Todo
		if err := c.BindJSON(&todo); err != nil {
			log.Println("Invalid request payload:", err)
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		_, err := db.Exec(
			"UPDATE todos SET title=$1, completed=$2 WHERE id=$3",
			todo.Title, todo.Completed, id)

		if err != nil {
			log.Println("Error updating todo:", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully updated todo with ID:", id)
		c.JSON(200, todo)
	})

	router.DELETE("/todos/:id", func(c *gin.Context) {
		id := c.Param("id")
		log.Println("Deleting todo with ID:", id)

		_, err := db.Exec("DELETE FROM todos WHERE id=$1", id)
		if err != nil {
			log.Println("Error deleting todo:", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully deleted todo with ID:", id)
		c.JSON(200, gin.H{"message": "Todo deleted"})
	})

	log.Println("Server running on port 8080")
	router.Run(":8080")
}
