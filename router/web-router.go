package router

import (
	"embed"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// ThemeAssets holds the embedded frontend assets for both themes.
type ThemeAssets struct {
	DefaultBuildFS   embed.FS
	DefaultIndexPage []byte
	ClassicBuildFS   embed.FS
	ClassicIndexPage []byte
}

func legacyConsolePath(path string) string {
	switch {
	case path == "/console" || path == "/console/":
		return "/enterprise"
	case strings.HasPrefix(path, "/console/channel"):
		return "/channels"
	case strings.HasPrefix(path, "/console/token"):
		return "/keys"
	case strings.HasPrefix(path, "/console/topup"):
		return "/wallet"
	case strings.HasPrefix(path, "/console/log"):
		return "/usage-logs"
	case strings.HasPrefix(path, "/console/personal"):
		return "/profile"
	case strings.HasPrefix(path, "/console/user"):
		return "/users"
	case strings.HasPrefix(path, "/console/redemption"):
		return "/redemption-codes"
	case strings.HasPrefix(path, "/console/subscription"):
		return "/subscriptions"
	case strings.HasPrefix(path, "/console/models"):
		return "/models"
	case strings.HasPrefix(path, "/console/deployment"):
		return "/models/deployments"
	case strings.HasPrefix(path, "/console/playground"):
		return "/playground"
	case strings.HasPrefix(path, "/console/setting"):
		return "/system-settings"
	}
	return ""
}

func useClassicIndex(path string) bool {
	return common.GetTheme() == "classic" && (path == "" || path == "/")
}

func SetWebRouter(router *gin.Engine, assets ThemeAssets) {
	defaultFS := common.EmbedFolder(assets.DefaultBuildFS, "web/default/dist")
	classicFS := common.EmbedFolder(assets.ClassicBuildFS, "web/classic/dist")
	themeFS := common.NewThemeAwareFS(defaultFS, classicFS)

	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	router.Use(static.Serve("/", themeFS))
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		if strings.HasPrefix(c.Request.RequestURI, "/v1") || strings.HasPrefix(c.Request.RequestURI, "/api") || strings.HasPrefix(c.Request.RequestURI, "/assets") {
			controller.RelayNotFound(c)
			return
		}
		if target := legacyConsolePath(c.Request.URL.Path); target != "" {
			if c.Request.URL.RawQuery != "" {
				target += "?" + c.Request.URL.RawQuery
			}
			c.Redirect(http.StatusFound, target)
			return
		}
		c.Header("Cache-Control", "no-cache")
		if useClassicIndex(c.Request.URL.Path) {
			c.Data(http.StatusOK, "text/html; charset=utf-8", assets.ClassicIndexPage)
		} else {
			c.Data(http.StatusOK, "text/html; charset=utf-8", assets.DefaultIndexPage)
		}
	})
}
