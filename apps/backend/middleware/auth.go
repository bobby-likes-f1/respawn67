package middleware

import (
	"net/http"
	"respawn67/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthRequired validates the JWT token from the Authorization header
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "authorization header is required",
			})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "authorization header must be: Bearer <token>",
			})
			c.Abort()
			return
		}

		userID, err := utils.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "invalid or expired token",
			})
			c.Abort()
			return
		}

		// Set user ID in context so route handlers can access it
		c.Set("userID", userID)
		c.Next()
	}
}
