package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func getDevRootUser() *model.User {
	rootUser := model.GetRootUser()
	if rootUser == nil || rootUser.Id == 0 || rootUser.Status != common.UserStatusEnabled {
		return nil
	}
	return rootUser
}

func saveSessionUser(c *gin.Context, user *model.User) error {
	session := sessions.Default(c)
	session.Set("id", user.Id)
	session.Set("username", user.Username)
	session.Set("role", user.Role)
	session.Set("status", user.Status)
	session.Set("group", user.Group)
	return session.Save()
}

func tryRespondWithDevRootLogin(c *gin.Context) bool {
	rootUser := getDevRootUser()
	if rootUser == nil {
		return false
	}

	model.UpdateUserLastLoginAt(rootUser.Id)
	if err := saveSessionUser(c, rootUser); err != nil {
		common.ApiError(c, err)
		return true
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "",
		"success": true,
		"data": map[string]any{
			"id":           rootUser.Id,
			"username":     rootUser.Username,
			"display_name": rootUser.DisplayName,
			"role":         rootUser.Role,
			"status":       rootUser.Status,
			"group":        rootUser.Group,
		},
	})
	return true
}

func keepDevRootSession(c *gin.Context) bool {
	rootUser := getDevRootUser()
	if rootUser == nil {
		return false
	}

	if err := saveSessionUser(c, rootUser); err != nil {
		common.ApiError(c, err)
		return true
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "",
		"success": true,
	})
	return true
}
