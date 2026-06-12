package middleware

import (
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// DevAutoLogin injects a local root session for the dev build when no user
// session or API credential is present yet.
func DevAutoLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		if session.Get("id") != nil {
			c.Next()
			return
		}

		authorization := strings.TrimSpace(c.Request.Header.Get("Authorization"))
		if authorization != "" || strings.TrimSpace(c.Request.Header.Get("mj-api-secret")) != "" {
			c.Next()
			return
		}

		rootUser := model.GetRootUser()
		if rootUser == nil || rootUser.Id == 0 || rootUser.Status != common.UserStatusEnabled {
			c.Next()
			return
		}

		session.Set("id", rootUser.Id)
		session.Set("username", rootUser.Username)
		session.Set("role", rootUser.Role)
		session.Set("status", rootUser.Status)
		session.Set("group", rootUser.Group)
		if err := session.Save(); err != nil {
			common.SysLog("failed to save dev auto-login session: " + err.Error())
		}

		c.Next()
	}
}
