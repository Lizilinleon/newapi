package controller

import (
	"errors"
	"fmt"
	"net/url"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/system_setting"
	"github.com/gin-gonic/gin"
)

type createEnterpriseMemberRequest struct {
	Identifier  string `json:"identifier"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
}

type createEnterpriseAccountRequest struct {
	Name string `json:"name"`
}

type updateEnterpriseMemberRequest struct {
	Status      int    `json:"status"`
	DisplayName string `json:"display_name"`
}

type allocateEnterpriseQuotaRequest struct {
	AllocatedQuota   int     `json:"allocated_quota"`
	WarningThreshold float64 `json:"warning_threshold"`
}

type adminEnterpriseQuotaRequest struct {
	Mode  string `json:"mode"`
	Quota int    `json:"quota"`
}

type transferEnterpriseQuotaRequest struct {
	Quota int `json:"quota"`
}

func GetEnterpriseSummary(c *gin.Context) {
	summary, err := model.GetEnterpriseSummary(c.GetInt("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, summary)
}

func CreateEnterpriseAccount(c *gin.Context) {
	var req createEnterpriseAccountRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiError(c, errors.New("invalid request body"))
		return
	}
	account, err := model.CreateEnterpriseAccount(c.GetInt("id"), strings.TrimSpace(req.Name))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, account)
}

func CreateEnterpriseMember(c *gin.Context) {
	var req createEnterpriseMemberRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiError(c, errors.New("invalid request body"))
		return
	}
	req.DisplayName = strings.TrimSpace(req.DisplayName)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if err := common.Validate.Var(req.Email, "required,email"); err != nil {
		common.ApiError(c, errors.New("valid email is required"))
		return
	}

	invitation, account, owner, err := model.CreateEnterpriseInvitation(c.GetInt("id"), req.Email, req.DisplayName)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	link := buildEnterpriseInvitationLink(c, invitation.Token)
	subject := fmt.Sprintf("%s enterprise invitation", common.SystemName)
	content := fmt.Sprintf("<p>Hello,</p>"+
		"<p>%s invited you to join the enterprise <strong>%s</strong>.</p>"+
		"<p>Open this link while signed in with <strong>%s</strong> to accept:</p>"+
		"<p><a href=\"%s\">Accept invitation</a></p>"+
		"<p>If the button does not work, copy this link into your browser:<br>%s</p>",
		owner.Username, account.Name, req.Email, link, link)
	if err := common.SendEmail(subject, req.Email, content); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"email": req.Email})
}

func buildEnterpriseInvitationLink(c *gin.Context, token string) string {
	base := strings.TrimRight(c.GetHeader("Origin"), "/")
	if base == "" {
		base = strings.TrimRight(system_setting.ServerAddress, "/")
	}
	if base == "" {
		scheme := c.GetHeader("X-Forwarded-Proto")
		if scheme == "" {
			scheme = "http"
			if c.Request.TLS != nil {
				scheme = "https"
			}
		}
		base = fmt.Sprintf("%s://%s", scheme, c.Request.Host)
	}
	return fmt.Sprintf("%s/enterprise?invite_token=%s", base, url.QueryEscape(token))
}

func AcceptEnterpriseInvitation(c *gin.Context) {
	var req struct {
		Token string `json:"token"`
	}
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiError(c, errors.New("invalid request body"))
		return
	}
	member, err := model.AcceptEnterpriseInvitation(c.GetInt("id"), req.Token)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	service.CheckAndSendEnterpriseBalanceNotify(member.EnterpriseId, nil)
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

func LeaveEnterprise(c *gin.Context) {
	if err := model.LeaveEnterpriseMembership(c.GetInt("id")); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}

func DissolveEnterprise(c *gin.Context) {
	if err := model.DetachEnterpriseOwner(c.GetInt("id")); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}

func TransferEnterpriseQuota(c *gin.Context) {
	var req transferEnterpriseQuotaRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiError(c, errors.New("invalid request body"))
		return
	}
	summary, err := model.TransferUserQuotaToEnterprise(c.GetInt("id"), req.Quota)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, summary)
}

func AllocateEnterpriseMemberQuota(c *gin.Context) {
	memberId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	var req allocateEnterpriseQuotaRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiError(c, errors.New("invalid request body"))
		return
	}
	member, err := model.AllocateEnterpriseMemberQuota(c.GetInt("id"), memberId, req.AllocatedQuota, req.WarningThreshold)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, member)
}

func GetEnterpriseMemberTokens(c *gin.Context) {
	memberId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo := common.GetPageQuery(c)
	status, _ := strconv.Atoi(c.Query("status"))
	tokens, total, err := model.SearchEnterpriseMemberTokensForViewer(
		c.GetInt("id"),
		memberId,
		c.Query("keyword"),
		c.Query("token"),
		status,
		pageInfo.GetStartIdx(),
		pageInfo.GetPageSize(),
	)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(buildMaskedTokenResponses(tokens))
	common.ApiSuccess(c, pageInfo)
}

func GetEnterpriseOwnerTokens(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	status, _ := strconv.Atoi(c.Query("status"))
	enterpriseId, _ := strconv.Atoi(c.Query("enterprise_id"))
	tokens, total, err := model.SearchEnterpriseOwnerTokens(
		c.GetInt("id"),
		enterpriseId,
		c.Query("keyword"),
		c.Query("token"),
		status,
		pageInfo.GetStartIdx(),
		pageInfo.GetPageSize(),
	)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(buildMaskedTokenResponses(tokens))
	common.ApiSuccess(c, pageInfo)
}

func CreateEnterpriseMemberToken(c *gin.Context) {
	memberId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	member, err := model.GetEnterpriseMemberByOwner(c.GetInt("id"), memberId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if member.Status != model.EnterpriseMemberStatusActive {
		common.ApiError(c, errors.New("enterprise member is not active"))
		return
	}
	token := model.Token{}
	if err := c.ShouldBindJSON(&token); err != nil {
		common.ApiError(c, err)
		return
	}
	if len(token.Name) > 50 {
		common.ApiError(c, errors.New("token name is too long"))
		return
	}
	if !token.UnlimitedQuota {
		if token.RemainQuota < 0 {
			common.ApiError(c, errors.New("token quota cannot be negative"))
			return
		}
		maxQuotaValue := int((1000000000 * common.QuotaPerUnit))
		if token.RemainQuota > maxQuotaValue {
			common.ApiError(c, fmt.Errorf("token quota exceeds max: %d", maxQuotaValue))
			return
		}
	}
	created, err := createTokenForUser(token, member.MemberUserId, member.EnterpriseId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, buildMaskedTokenResponse(created))
}

func GetEnterpriseLogs(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	memberId, _ := strconv.Atoi(c.Query("member_id"))
	logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	tokenName := c.Query("token_name")
	modelName := c.Query("model_name")
	keyword := c.Query("keyword")

	logs, total, err := model.GetEnterpriseLogsForViewer(
		c.GetInt("id"),
		memberId,
		logType,
		startTimestamp,
		endTimestamp,
		modelName,
		tokenName,
		keyword,
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

func AdminListEnterpriseAccounts(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	accounts, total, err := model.SearchEnterpriseAccounts(
		c.Query("keyword"),
		pageInfo.GetStartIdx(),
		pageInfo.GetPageSize(),
	)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(accounts)
	common.ApiSuccess(c, pageInfo)
}

func AdminGetEnterpriseAccount(c *gin.Context) {
	enterpriseId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	account, err := model.AdminGetEnterpriseAccountView(enterpriseId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, account)
}

func AdminListEnterpriseMembers(c *gin.Context) {
	enterpriseId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	members, totals, err := model.AdminListEnterpriseMembers(enterpriseId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{
		"items":  members,
		"totals": totals,
	})
}

func AdminGetEnterpriseLogs(c *gin.Context) {
	enterpriseId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo := common.GetPageQuery(c)
	logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	tokenName := c.Query("token_name")
	modelName := c.Query("model_name")
	keyword := c.Query("keyword")

	logs, total, err := model.AdminGetEnterpriseLogs(
		enterpriseId,
		logType,
		startTimestamp,
		endTimestamp,
		modelName,
		tokenName,
		keyword,
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

func AdminUpdateEnterpriseQuota(c *gin.Context) {
	enterpriseId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	var req adminEnterpriseQuotaRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		common.ApiError(c, errors.New("invalid request body"))
		return
	}
	if req.Quota < 0 {
		common.ApiError(c, errors.New("quota cannot be negative"))
		return
	}
	mode := strings.TrimSpace(req.Mode)
	if mode == "" {
		mode = "set"
	}
	var account *model.AdminEnterpriseAccountView
	switch mode {
	case "add":
		account, err = model.AdminAddEnterpriseQuota(enterpriseId, req.Quota)
	case "set":
		account, err = model.AdminSetEnterpriseQuota(enterpriseId, req.Quota)
	default:
		err = errors.New("invalid quota update mode")
	}
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, account)
}
