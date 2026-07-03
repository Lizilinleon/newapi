package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func setupUserAdminControllerTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	gin.SetMode(gin.TestMode)
	common.SetDatabaseTypes(common.DatabaseTypeSQLite, common.DatabaseTypeSQLite)
	common.RedisEnabled = false

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "_"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	require.NoError(t, err)
	model.DB = db
	model.LOG_DB = db
	require.NoError(t, db.AutoMigrate(&model.User{}))

	t.Cleanup(func() {
		sqlDB, err := db.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
	})

	return db
}

func seedAdminUser(t *testing.T, user model.User) {
	t.Helper()
	if user.Status == 0 {
		user.Status = common.UserStatusEnabled
	}
	if user.Group == "" {
		user.Group = "default"
	}
	if user.AffCode == "" {
		user.AffCode = fmt.Sprintf("aff-%d", user.Id)
	}
	require.NoError(t, model.DB.Create(&user).Error)
}

func TestAdminUserListHidesHigherRolesAndSensitiveFields(t *testing.T) {
	setupUserAdminControllerTestDB(t)
	seedAdminUser(t, model.User{Id: 1, Username: "root", Password: "root-password", Role: common.RoleRootUser, Email: "root@example.com", Setting: `{"webhook_secret":"secret"}`})
	seedAdminUser(t, model.User{Id: 2, Username: "admin", Password: "admin-password", Role: common.RoleAdminUser, Email: "admin@example.com"})
	seedAdminUser(t, model.User{Id: 3, Username: "member", Password: "member-password", Role: common.RoleCommonUser, Email: "member@example.com", Setting: `{"gotify_token":"secret"}`})

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/user/?p=1&page_size=20", nil)
	ctx.Set("role", common.RoleAdminUser)

	GetAllUsers(ctx)

	require.Equal(t, http.StatusOK, recorder.Code)
	body := recorder.Body.String()
	require.NotContains(t, body, "root@example.com")
	require.NotContains(t, body, "admin@example.com")
	require.NotContains(t, body, "password")
	require.NotContains(t, body, "webhook_secret")
	require.NotContains(t, body, "gotify_token")
	require.Contains(t, body, "member@example.com")

	var payload struct {
		Success bool `json:"success"`
		Data    struct {
			Total int `json:"total"`
			Items []struct {
				Username string `json:"username"`
				Role     int    `json:"role"`
			} `json:"items"`
		} `json:"data"`
	}
	require.NoError(t, json.Unmarshal(recorder.Body.Bytes(), &payload))
	require.True(t, payload.Success)
	require.Equal(t, 1, payload.Data.Total)
	require.Len(t, payload.Data.Items, 1)
	require.Equal(t, "member", payload.Data.Items[0].Username)
}

func TestRootUserListUsesSafeUserResponse(t *testing.T) {
	setupUserAdminControllerTestDB(t)
	seedAdminUser(t, model.User{Id: 1, Username: "root", Password: "root-password", Role: common.RoleRootUser, Email: "root@example.com", Setting: `{"webhook_secret":"secret"}`})

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/user/?p=1&page_size=20", nil)
	ctx.Set("role", common.RoleRootUser)

	GetAllUsers(ctx)

	require.Equal(t, http.StatusOK, recorder.Code)
	body := recorder.Body.String()
	require.Contains(t, body, "root@example.com")
	require.NotContains(t, body, "root-password")
	require.NotContains(t, body, "webhook_secret")
}
