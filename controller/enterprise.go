package controller

import (
	"errors"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

type createEnterpriseMemberRequest struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	Group       string `json:"group"`
}

type updateEnterpriseMemberRequest struct {
	Status      int    `json:"status"`
	DisplayName string `json:"display_name"`
}

func GetEnterpriseSummary(c *gin.Context) {
	summary, err := model.GetEnterpriseSummary(c.GetInt("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, summary)
}

func CreateEnterpriseMember(c *gin.Context) {
	var req createEnterpriseMemberRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiError(c, errors.New("invalid request body"))
		return
	}
	req.Username = strings.TrimSpace(req.Username)
	req.DisplayName = strings.TrimSpace(req.DisplayName)
	req.Email = strings.TrimSpace(req.Email)
	req.Group = strings.TrimSpace(req.Group)

	member, err := model.CreateEnterpriseMember(c.GetInt("id"), model.EnterpriseCreateMemberInput{
		Username:    req.Username,
		Password:    req.Password,
		DisplayName: req.DisplayName,
		Email:       req.Email,
		Group:       req.Group,
	})
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, member)
}

func UpdateEnterpriseMember(c *gin.Context) {
	memberId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	var req updateEnterpriseMemberRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiError(c, errors.New("invalid request body"))
		return
	}
	member, err := model.UpdateEnterpriseMember(c.GetInt("id"), memberId, req.Status, req.DisplayName)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, member)
}

func DeleteEnterpriseMember(c *gin.Context) {
	memberId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.RemoveEnterpriseMember(c.GetInt("id"), memberId); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}

func GetEnterpriseMemberTokens(c *gin.Context) {
	memberId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo := common.GetPageQuery(c)
	tokens, total, err := model.GetEnterpriseMemberTokens(c.GetInt("id"), memberId, pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(buildMaskedTokenResponses(tokens))
	common.ApiSuccess(c, pageInfo)
}

func GetEnterpriseLogs(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	memberId, _ := strconv.Atoi(c.Query("member_id"))
	logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	tokenName := c.Query("token_name")
	modelName := c.Query("model_name")

	logs, total, err := model.GetEnterpriseLogs(
		c.GetInt("id"),
		memberId,
		logType,
		startTimestamp,
		endTimestamp,
		modelName,
		tokenName,
		pageInfo.GetStartIdx(),
		pageInfo.GetPageSize(),
	)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(logs)
	common.ApiSuccess(c, pageInfo)
}

func DevLoginEnterpriseMember(c *gin.Context) {
	memberId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}

	summary, err := model.GetEnterpriseSummary(c.GetInt("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if summary.Mode != model.EnterpriseRoleOwner {
		common.ApiError(c, errors.New("only enterprise owner can switch to member"))
		return
	}

	var target *model.EnterpriseMemberView
	for i := range summary.Members {
		if summary.Members[i].Id == memberId {
			target = &summary.Members[i]
			break
		}
	}
	if target == nil {
		common.ApiError(c, errors.New("enterprise member not found"))
		return
	}

	user, err := model.GetUserById(target.MemberUserId, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	data, err := switchDevSessionUser(c, user)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, data)
}

func DevReturnEnterpriseOwner(c *gin.Context) {
	summary, err := model.GetEnterpriseSummary(c.GetInt("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if summary.Owner == nil {
		common.ApiError(c, errors.New("enterprise owner not found"))
		return
	}

	user, err := model.GetUserById(summary.Owner.Id, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	data, err := switchDevSessionUser(c, user)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, data)
}

func switchDevSessionUser(c *gin.Context, user *model.User) (map[string]any, error) {
	if err := saveSessionUser(c, user); err != nil {
		return nil, err
	}
	model.UpdateUserLastLoginAt(user.Id)
	return map[string]any{
		"id":           user.Id,
		"username":     user.Username,
		"display_name": user.DisplayName,
		"role":         user.Role,
		"status":       user.Status,
		"group":        user.Group,
	}, nil
}
