package main

import (
	"github.com/anishbista60/production-devops-project/database"
	"github.com/anishbista60/production-devops-project/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	router := gin.Default()
	router.Use(cors.Default())
	db := database.Connect()
	defer db.Close()

	router.GET("/todos", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, title, completed FROM todos")
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		todos := []models.Todo{}
		for rows.Next() {
			var todo models.Todo
			err := rows.Scan(&todo.ID, &todo.Title, &todo.Completed)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			todos = append(todos, todo)
		}
		c.JSON(200, todos)
	})

	router.POST("/todos", func(c *gin.Context) {
		var todo models.Todo
		if err := c.BindJSON(&todo); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		err := db.QueryRow(
			"INSERT INTO todos(title, completed) VALUES($1, $2) RETURNING id",
			todo.Title, todo.Completed).Scan(&todo.ID)

		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, todo)
	})

	router.PUT("/todos/:id", func(c *gin.Context) {
		id := c.Param("id")
		var todo models.Todo
		if err := c.BindJSON(&todo); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		_, err := db.Exec(
			"UPDATE todos SET title=$1, completed=$2 WHERE id=$3",
			todo.Title, todo.Completed, id)

		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, todo)
	})

	router.DELETE("/todos/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM todos WHERE id=$1", id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"message": "Todo deleted"})
	})

	router.Run(":8080")
}
