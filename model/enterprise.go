package model

import (
	"errors"
	"fmt"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"gorm.io/gorm"
)

const (
	EnterpriseStatusEnabled  = 1
	EnterpriseStatusDisabled = 2

	EnterpriseMemberStatusActive   = 1
	EnterpriseMemberStatusDisabled = 2
	EnterpriseMemberStatusRemoved  = 3

	EnterpriseRoleOwner  = "owner"
	EnterpriseRoleMember = "member"
)

var (
	ErrEnterpriseMemberDisabled = errors.New("enterprise member is disabled")
	ErrEnterpriseDisabled       = errors.New("enterprise account is disabled")
)

type EnterpriseAccount struct {
	Id          int    `json:"id"`
	OwnerUserId int    `json:"owner_user_id" gorm:"uniqueIndex"`
	Name        string `json:"name" gorm:"type:varchar(128);default:''"`
	Status      int    `json:"status" gorm:"type:int;default:1;index"`
	CreatedAt   int64  `json:"created_at" gorm:"autoCreateTime;column:created_at"`
	UpdatedAt   int64  `json:"updated_at" gorm:"autoUpdateTime;column:updated_at"`
}

type EnterpriseMember struct {
	Id           int    `json:"id"`
	EnterpriseId int    `json:"enterprise_id" gorm:"index"`
	OwnerUserId  int    `json:"owner_user_id" gorm:"index"`
	MemberUserId int    `json:"member_user_id" gorm:"index"`
	Role         string `json:"role" gorm:"type:varchar(32);default:'member'"`
	Status       int    `json:"status" gorm:"type:int;default:1;index"`
	DisplayName  string `json:"display_name" gorm:"type:varchar(64);default:''"`
	CreatedAt    int64  `json:"created_at" gorm:"autoCreateTime;column:created_at"`
	UpdatedAt    int64  `json:"updated_at" gorm:"autoUpdateTime;column:updated_at"`
}

type EnterpriseCreateMemberInput struct {
	Username    string
	Password    string
	DisplayName string
	Email       string
	Group       string
}

type EnterpriseMemberView struct {
	Id             int    `json:"id"`
	EnterpriseId   int    `json:"enterprise_id"`
	OwnerUserId    int    `json:"owner_user_id"`
	MemberUserId   int    `json:"member_user_id"`
	Role           string `json:"role"`
	Status         int    `json:"status"`
	DisplayName    string `json:"display_name"`
	CreatedAt      int64  `json:"created_at"`
	UpdatedAt      int64  `json:"updated_at"`
	Username       string `json:"username"`
	Email          string `json:"email"`
	UserStatus     int    `json:"user_status"`
	Group          string `json:"group"`
	Quota          int    `json:"quota"`
	UsedQuota      int    `json:"used_quota"`
	RequestCount   int    `json:"request_count"`
	TokenCount     int64  `json:"token_count"`
	EnterpriseUsed int64  `json:"enterprise_used_quota"`
	EnterpriseReqs int64  `json:"enterprise_request_count"`
}

type EnterpriseOwnerView struct {
	Id          int    `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	Quota       int    `json:"quota"`
	UsedQuota   int    `json:"used_quota"`
	Status      int    `json:"status"`
}

type EnterpriseTotals struct {
	MemberCount  int   `json:"member_count"`
	ActiveCount  int   `json:"active_count"`
	TokenCount   int64 `json:"token_count"`
	UsedQuota    int64 `json:"used_quota"`
	RequestCount int64 `json:"request_count"`
}

type EnterpriseSummary struct {
	Mode       string                 `json:"mode"`
	Enterprise *EnterpriseAccount     `json:"enterprise,omitempty"`
	Owner      *EnterpriseOwnerView   `json:"owner,omitempty"`
	Member     *EnterpriseMemberView  `json:"member,omitempty"`
	Members    []EnterpriseMemberView `json:"members"`
	Totals     EnterpriseTotals       `json:"totals"`
}

type EnterpriseBillingContext struct {
	EnterpriseId int
	OwnerUserId  int
	OwnerName    string
	OwnerEmail   string
	OwnerQuota   int
}

type enterpriseUsageRow struct {
	UserId       int   `gorm:"column:user_id"`
	Quota        int64 `gorm:"column:quota"`
	RequestCount int64 `gorm:"column:request_count"`
}

type enterpriseTokenCountRow struct {
	UserId int   `gorm:"column:user_id"`
	Count  int64 `gorm:"column:count"`
}

func enterpriseOwnerViewFromUser(user *User) *EnterpriseOwnerView {
	if user == nil {
		return nil
	}
	return &EnterpriseOwnerView{
		Id:          user.Id,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		Email:       user.Email,
		Quota:       user.Quota,
		UsedQuota:   user.UsedQuota,
		Status:      user.Status,
	}
}

func GetOrCreateEnterpriseAccount(ownerUserId int) (*EnterpriseAccount, error) {
	if ownerUserId == 0 {
		return nil, errors.New("owner user id is empty")
	}
	var account EnterpriseAccount
	err := DB.Where("owner_user_id = ?", ownerUserId).First(&account).Error
	if err == nil {
		return &account, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	owner, err := GetUserById(ownerUserId, false)
	if err != nil {
		return nil, err
	}
	name := strings.TrimSpace(owner.DisplayName)
	if name == "" {
		name = owner.Username
	}
	account = EnterpriseAccount{
		OwnerUserId: ownerUserId,
		Name:        name,
		Status:      EnterpriseStatusEnabled,
	}
	if err := DB.Create(&account).Error; err != nil {
		return nil, err
	}
	return &account, nil
}

func GetEnterpriseAccountByOwner(ownerUserId int) (*EnterpriseAccount, error) {
	var account EnterpriseAccount
	if err := DB.Where("owner_user_id = ?", ownerUserId).First(&account).Error; err != nil {
		return nil, err
	}
	return &account, nil
}

func GetEnterpriseMemberForUser(userId int) (*EnterpriseMember, error) {
	if userId == 0 {
		return nil, errors.New("user id is empty")
	}
	var member EnterpriseMember
	err := DB.Where("member_user_id = ? AND status <> ?", userId, EnterpriseMemberStatusRemoved).
		Order("id desc").First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func GetEnterpriseBillingContext(memberUserId int) (*EnterpriseBillingContext, error) {
	member, err := GetEnterpriseMemberForUser(memberUserId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	if member.Status == EnterpriseMemberStatusDisabled {
		return nil, ErrEnterpriseMemberDisabled
	}
	if member.Status != EnterpriseMemberStatusActive {
		return nil, nil
	}
	account, err := GetEnterpriseAccountByOwner(member.OwnerUserId)
	if err != nil {
		return nil, err
	}
	if account.Status != EnterpriseStatusEnabled {
		return nil, ErrEnterpriseDisabled
	}
	owner, err := GetUserById(member.OwnerUserId, false)
	if err != nil {
		return nil, err
	}
	if owner.Status != common.UserStatusEnabled {
		return nil, ErrEnterpriseDisabled
	}
	return &EnterpriseBillingContext{
		EnterpriseId: account.Id,
		OwnerUserId:  owner.Id,
		OwnerName:    owner.Username,
		OwnerEmail:   owner.Email,
		OwnerQuota:   owner.Quota,
	}, nil
}

func CreateEnterpriseMember(ownerUserId int, input EnterpriseCreateMemberInput) (*EnterpriseMemberView, error) {
	if ownerUserId == 0 {
		return nil, errors.New("owner user id is empty")
	}
	username := strings.TrimSpace(input.Username)
	password := strings.TrimSpace(input.Password)
	email := strings.TrimSpace(input.Email)
	if username == "" || password == "" {
		return nil, errors.New("username and password are required")
	}
	if len(username) > UserNameMaxLength {
		return nil, fmt.Errorf("username length must be less than or equal to %d", UserNameMaxLength)
	}
	if len(password) < 8 || len(password) > 20 {
		return nil, errors.New("password length must be between 8 and 20 characters")
	}
	if existing, err := GetEnterpriseMemberForUser(ownerUserId); err == nil && existing.Status != EnterpriseMemberStatusRemoved {
		return nil, errors.New("enterprise member cannot create sub members")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	reusableMember, reusableUser, err := getReusableRemovedEnterpriseMember(ownerUserId, username, email)
	if err != nil {
		return nil, err
	}
	if reusableMember == nil {
		if exists, err := CheckUserExistOrDeleted(username, email); err != nil {
			return nil, err
		} else if exists {
			return nil, errors.New("user already exists")
		}
	}

	account, err := GetOrCreateEnterpriseAccount(ownerUserId)
	if err != nil {
		return nil, err
	}
	owner, err := GetUserById(ownerUserId, false)
	if err != nil {
		return nil, err
	}
	displayName := strings.TrimSpace(input.DisplayName)
	if displayName == "" {
		displayName = username
	}
	group := strings.TrimSpace(input.Group)
	if group == "" {
		group = owner.Group
	}
	hashedPassword, err := common.Password2Hash(password)
	if err != nil {
		return nil, err
	}

	user := User{
		Username:    username,
		Password:    hashedPassword,
		DisplayName: displayName,
		Email:       email,
		Role:        common.RoleCommonUser,
		Status:      common.UserStatusEnabled,
		Group:       group,
		Quota:       0,
		AffCode:     common.GetRandomString(4),
	}
	user.SetSetting(dto.UserSetting{
		SidebarModules: generateDefaultSidebarConfigForRole(common.RoleCommonUser),
	})

	if reusableMember != nil && reusableUser != nil {
		user = *reusableUser
		user.Password = hashedPassword
		user.DisplayName = displayName
		user.Email = email
		user.Role = common.RoleCommonUser
		user.Status = common.UserStatusEnabled
		user.Group = group
		user.SetSetting(dto.UserSetting{
			SidebarModules: generateDefaultSidebarConfigForRole(common.RoleCommonUser),
		})
		member := *reusableMember
		member.EnterpriseId = account.Id
		member.OwnerUserId = ownerUserId
		member.Role = EnterpriseRoleMember
		member.Status = EnterpriseMemberStatusActive
		member.DisplayName = displayName

		tx := DB.Begin()
		if tx.Error != nil {
			return nil, tx.Error
		}
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()
		if err := tx.Model(&User{}).Where("id = ?", user.Id).Updates(map[string]interface{}{
			"password":     user.Password,
			"display_name": user.DisplayName,
			"email":        user.Email,
			"role":         user.Role,
			"status":       user.Status,
			"group":        user.Group,
			"setting":      user.Setting,
		}).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := tx.Model(&EnterpriseMember{}).Where("id = ? AND owner_user_id = ?", member.Id, ownerUserId).Updates(map[string]interface{}{
			"enterprise_id": account.Id,
			"role":          EnterpriseRoleMember,
			"status":        EnterpriseMemberStatusActive,
			"display_name":  displayName,
		}).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := tx.Commit().Error; err != nil {
			return nil, err
		}
		_ = InvalidateUserTokensCache(user.Id)
		RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("reactivated enterprise member %s", username))
		return buildEnterpriseMemberView(member, &user, nil, 0), nil
	}

	tx := DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	member := EnterpriseMember{
		EnterpriseId: account.Id,
		OwnerUserId:  ownerUserId,
		MemberUserId: user.Id,
		Role:         EnterpriseRoleMember,
		Status:       EnterpriseMemberStatusActive,
		DisplayName:  displayName,
	}
	if err := tx.Create(&member).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("created enterprise member %s", username))
	return buildEnterpriseMemberView(member, &user, nil, 0), nil
}

func UpdateEnterpriseMember(ownerUserId int, memberId int, status int, displayName string) (*EnterpriseMemberView, error) {
	if ownerUserId == 0 || memberId == 0 {
		return nil, errors.New("owner user id or member id is empty")
	}
	member, err := getEnterpriseMemberByOwner(ownerUserId, memberId)
	if err != nil {
		return nil, err
	}
	updates := map[string]interface{}{}
	if status != 0 {
		switch status {
		case EnterpriseMemberStatusActive, EnterpriseMemberStatusDisabled, EnterpriseMemberStatusRemoved:
			updates["status"] = status
		default:
			return nil, errors.New("invalid member status")
		}
	}
	if strings.TrimSpace(displayName) != "" {
		updates["display_name"] = strings.TrimSpace(displayName)
	}
	if len(updates) > 0 {
		if err := DB.Model(&EnterpriseMember{}).Where("id = ? AND owner_user_id = ?", memberId, ownerUserId).
			Updates(updates).Error; err != nil {
			return nil, err
		}
	}
	member, err = getEnterpriseMemberByOwner(ownerUserId, memberId)
	if err != nil {
		return nil, err
	}
	if status == EnterpriseMemberStatusDisabled {
		_ = InvalidateUserTokensCache(member.MemberUserId)
	}
	user, err := GetUserById(member.MemberUserId, false)
	if err != nil {
		return nil, err
	}
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("updated enterprise member %s", user.Username))
	return buildEnterpriseMemberView(*member, user, nil, 0), nil
}

func RemoveEnterpriseMember(ownerUserId int, memberId int) error {
	_, err := UpdateEnterpriseMember(ownerUserId, memberId, EnterpriseMemberStatusRemoved, "")
	return err
}

func getReusableRemovedEnterpriseMember(ownerUserId int, username string, email string) (*EnterpriseMember, *User, error) {
	var user User
	err := DB.Unscoped().Where("username = ?", username).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, nil
		}
		return nil, nil, err
	}
	if user.DeletedAt.Valid {
		return nil, &user, nil
	}
	if email != "" && email != user.Email {
		var count int64
		if err := DB.Unscoped().Model(&User{}).Where("email = ? AND id <> ?", email, user.Id).Count(&count).Error; err != nil {
			return nil, nil, err
		}
		if count > 0 {
			return nil, &user, nil
		}
	}
	if activeMember, err := GetEnterpriseMemberForUser(user.Id); err == nil && activeMember.Status != EnterpriseMemberStatusRemoved {
		return nil, &user, nil
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil, err
	}

	var member EnterpriseMember
	err = DB.Where("owner_user_id = ? AND member_user_id = ? AND status = ?", ownerUserId, user.Id, EnterpriseMemberStatusRemoved).
		Order("id desc").First(&member).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &user, nil
		}
		return nil, nil, err
	}
	return &member, &user, nil
}

func getEnterpriseMemberByOwner(ownerUserId int, memberId int) (*EnterpriseMember, error) {
	var member EnterpriseMember
	err := DB.Where("id = ? AND owner_user_id = ?", memberId, ownerUserId).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func ListEnterpriseMembers(ownerUserId int) ([]EnterpriseMemberView, EnterpriseTotals, error) {
	var totals EnterpriseTotals
	if ownerUserId == 0 {
		return nil, totals, errors.New("owner user id is empty")
	}
	var members []EnterpriseMember
	if err := DB.Where("owner_user_id = ? AND status <> ?", ownerUserId, EnterpriseMemberStatusRemoved).
		Order("id desc").Find(&members).Error; err != nil {
		return nil, totals, err
	}
	if len(members) == 0 {
		return []EnterpriseMemberView{}, totals, nil
	}
	userIds := make([]int, 0, len(members))
	for _, member := range members {
		userIds = append(userIds, member.MemberUserId)
		if member.Status == EnterpriseMemberStatusActive {
			totals.ActiveCount++
		}
	}
	totals.MemberCount = len(members)

	usersById, err := getUsersByIds(userIds)
	if err != nil {
		return nil, totals, err
	}
	usageByUser := getEnterpriseUsageByUser(userIds)
	tokenCountByUser := getTokenCountByUser(userIds)

	views := make([]EnterpriseMemberView, 0, len(members))
	for _, member := range members {
		usage := usageByUser[member.MemberUserId]
		tokenCount := tokenCountByUser[member.MemberUserId]
		totals.UsedQuota += usage.Quota
		totals.RequestCount += usage.RequestCount
		totals.TokenCount += tokenCount
		views = append(views, *buildEnterpriseMemberView(member, usersById[member.MemberUserId], &usage, tokenCount))
	}
	return views, totals, nil
}

func GetEnterpriseSummary(userId int) (*EnterpriseSummary, error) {
	if userId == 0 {
		return nil, errors.New("user id is empty")
	}
	user, err := GetUserById(userId, false)
	if err != nil {
		return nil, err
	}
	if member, err := GetEnterpriseMemberForUser(userId); err == nil && member.Status != EnterpriseMemberStatusRemoved {
		account, err := GetEnterpriseAccountByOwner(member.OwnerUserId)
		if err != nil {
			return nil, err
		}
		owner, err := GetUserById(member.OwnerUserId, false)
		if err != nil {
			return nil, err
		}
		usageByUser := getEnterpriseUsageByUser([]int{userId})
		tokenCountByUser := getTokenCountByUser([]int{userId})
		usage := usageByUser[userId]
		tokenCount := tokenCountByUser[userId]
		return &EnterpriseSummary{
			Mode:       EnterpriseRoleMember,
			Enterprise: account,
			Owner:      enterpriseOwnerViewFromUser(owner),
			Member:     buildEnterpriseMemberView(*member, user, &usage, tokenCount),
			Members:    []EnterpriseMemberView{},
			Totals: EnterpriseTotals{
				MemberCount:  1,
				ActiveCount:  boolToInt(member.Status == EnterpriseMemberStatusActive),
				TokenCount:   tokenCount,
				UsedQuota:    usage.Quota,
				RequestCount: usage.RequestCount,
			},
		}, nil
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	account, err := GetOrCreateEnterpriseAccount(userId)
	if err != nil {
		return nil, err
	}
	members, totals, err := ListEnterpriseMembers(userId)
	if err != nil {
		return nil, err
	}
	return &EnterpriseSummary{
		Mode:       EnterpriseRoleOwner,
		Enterprise: account,
		Owner:      enterpriseOwnerViewFromUser(user),
		Members:    members,
		Totals:     totals,
	}, nil
}

func GetEnterpriseMemberTokens(ownerUserId int, memberId int, startIdx int, num int) ([]*Token, int64, error) {
	member, err := getEnterpriseMemberByOwner(ownerUserId, memberId)
	if err != nil {
		return nil, 0, err
	}
	var total int64
	if err := DB.Model(&Token{}).Where("user_id = ?", member.MemberUserId).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var tokens []*Token
	err = DB.Where("user_id = ?", member.MemberUserId).Order("id desc").Limit(num).Offset(startIdx).Find(&tokens).Error
	return tokens, total, err
}

func GetEnterpriseLogs(ownerUserId int, memberId int, logType int, startTimestamp int64, endTimestamp int64, modelName string, tokenName string, startIdx int, num int) ([]*Log, int64, error) {
	memberUserIds, err := enterpriseVisibleMemberUserIds(ownerUserId, memberId)
	if err != nil {
		return nil, 0, err
	}
	if len(memberUserIds) == 0 {
		return []*Log{}, 0, nil
	}

	tx := LOG_DB.Where("logs.user_id IN ?", memberUserIds)
	if logType != LogTypeUnknown {
		tx = tx.Where("logs.type = ?", logType)
	}
	if tx, err = applyExplicitLogTextFilter(tx, "logs.model_name", modelName); err != nil {
		return nil, 0, err
	}
	if tokenName != "" {
		tx = tx.Where("logs.token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("logs.created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("logs.created_at <= ?", endTimestamp)
	}

	var total int64
	if err := tx.Model(&Log{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var logs []*Log
	if err := tx.Order("logs.id desc").Limit(num).Offset(startIdx).Find(&logs).Error; err != nil {
		return nil, 0, err
	}
	formatUserLogs(logs, startIdx)
	return logs, total, nil
}

func enterpriseVisibleMemberUserIds(ownerUserId int, memberId int) ([]int, error) {
	query := DB.Model(&EnterpriseMember{}).Where("owner_user_id = ? AND status <> ?", ownerUserId, EnterpriseMemberStatusRemoved)
	if memberId != 0 {
		query = query.Where("id = ?", memberId)
	}
	var members []EnterpriseMember
	if err := query.Find(&members).Error; err != nil {
		return nil, err
	}
	ids := make([]int, 0, len(members))
	for _, member := range members {
		ids = append(ids, member.MemberUserId)
	}
	return ids, nil
}

func getUsersByIds(userIds []int) (map[int]*User, error) {
	users := make([]User, 0, len(userIds))
	if len(userIds) == 0 {
		return map[int]*User{}, nil
	}
	if err := DB.Where("id IN ?", userIds).Find(&users).Error; err != nil {
		return nil, err
	}
	result := make(map[int]*User, len(users))
	for i := range users {
		result[users[i].Id] = &users[i]
	}
	return result, nil
}

func getEnterpriseUsageByUser(userIds []int) map[int]enterpriseUsageRow {
	result := make(map[int]enterpriseUsageRow, len(userIds))
	if len(userIds) == 0 {
		return result
	}
	var rows []enterpriseUsageRow
	err := LOG_DB.Model(&Log{}).
		Select("user_id, COALESCE(SUM(quota), 0) AS quota, COUNT(*) AS request_count").
		Where("type = ? AND user_id IN ?", LogTypeConsume, userIds).
		Group("user_id").
		Scan(&rows).Error
	if err != nil {
		common.SysLog("failed to load enterprise usage: " + err.Error())
		return result
	}
	for _, row := range rows {
		result[row.UserId] = row
	}
	return result
}

func getTokenCountByUser(userIds []int) map[int]int64 {
	result := make(map[int]int64, len(userIds))
	if len(userIds) == 0 {
		return result
	}
	var rows []enterpriseTokenCountRow
	err := DB.Model(&Token{}).
		Select("user_id, COUNT(*) AS count").
		Where("user_id IN ?", userIds).
		Group("user_id").
		Scan(&rows).Error
	if err != nil {
		common.SysLog("failed to load enterprise token count: " + err.Error())
		return result
	}
	for _, row := range rows {
		result[row.UserId] = row.Count
	}
	return result
}

func buildEnterpriseMemberView(member EnterpriseMember, user *User, usage *enterpriseUsageRow, tokenCount int64) *EnterpriseMemberView {
	view := &EnterpriseMemberView{
		Id:           member.Id,
		EnterpriseId: member.EnterpriseId,
		OwnerUserId:  member.OwnerUserId,
		MemberUserId: member.MemberUserId,
		Role:         member.Role,
		Status:       member.Status,
		DisplayName:  member.DisplayName,
		CreatedAt:    member.CreatedAt,
		UpdatedAt:    member.UpdatedAt,
		TokenCount:   tokenCount,
	}
	if user != nil {
		view.Username = user.Username
		view.Email = user.Email
		view.UserStatus = user.Status
		view.Group = user.Group
		view.Quota = user.Quota
		view.UsedQuota = user.UsedQuota
		view.RequestCount = user.RequestCount
	}
	if usage != nil {
		view.EnterpriseUsed = usage.Quota
		view.EnterpriseReqs = usage.RequestCount
	}
	return view
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}
