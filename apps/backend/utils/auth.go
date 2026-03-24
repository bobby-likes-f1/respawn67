package utils

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// RequireAuth checks the Authorization header for a valid JWT token.
// Sets userID in context if valid. Returns false and sends 401 if not.
func RequireAuth(c *gin.Context) bool {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "authorization header is required",
		})
		return false
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "authorization header must be: Bearer <token>",
		})
		return false
	}

	userID, err := ValidateToken(parts[1])
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "invalid or expired token",
		})
		return false
	}

	c.Set("userID", userID)
	return true
}

// CheckOwnership validates the JWT token and checks that the logged-in user
// matches the user ID in the URL param. Returns false and sends 401/403 if not.
func CheckOwnership(c *gin.Context, paramName string) bool {
	if !RequireAuth(c) {
		return false
	}

	tokenUserID, _ := c.Get("userID")

	idStr := c.Param(paramName)
	urlUserID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid user id",
		})
		return false
	}

	if uint(urlUserID) != tokenUserID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "you cannot access unauthorized data",
		})
		return false
	}

	return true
}
