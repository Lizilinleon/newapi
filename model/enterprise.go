package model

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"gorm.io/gorm"
)

const (
	EnterpriseStatusEnabled  = 1
	EnterpriseStatusDisabled = 2

	EnterpriseMemberStatusActive   = 1
	EnterpriseMemberStatusDisabled = 2
	EnterpriseMemberStatusRemoved  = 3

	EnterpriseInvitationStatusPending  = 1
	EnterpriseInvitationStatusAccepted = 2
	EnterpriseInvitationStatusExpired  = 3

	EnterpriseRoleNone   = "none"
	EnterpriseRoleOwner  = "owner"
	EnterpriseRoleMember = "member"

	EnterpriseRelationStatusActive  = 1
	EnterpriseRelationStatusRemoved = 3
)

var (
	ErrEnterpriseMemberDisabled = errors.New("enterprise member is disabled")
	ErrEnterpriseDisabled       = errors.New("enterprise account is disabled")
)

type EnterpriseAccount struct {
	Id              int    `json:"id"`
	OwnerUserId     int    `json:"owner_user_id" gorm:"uniqueIndex"`
	CreatedByUserId int    `json:"created_by_user_id" gorm:"index;default:0"`
	Name            string `json:"name" gorm:"type:varchar(128);default:''"`
	Quota           int    `json:"quota" gorm:"type:int;default:0"`
	Status          int    `json:"status" gorm:"type:int;default:1;index"`
	CreatedAt       int64  `json:"created_at" gorm:"autoCreateTime;column:created_at"`
	UpdatedAt       int64  `json:"updated_at" gorm:"autoUpdateTime;column:updated_at"`
}

type EnterpriseAccountRelation struct {
	Id           int    `json:"id"`
	EnterpriseId int    `json:"enterprise_id" gorm:"index"`
	UserId       int    `json:"user_id" gorm:"index"`
	Role         string `json:"role" gorm:"type:varchar(32);default:'owner';index"`
	Status       int    `json:"status" gorm:"type:int;default:1;index"`
	CreatedAt    int64  `json:"created_at" gorm:"autoCreateTime;column:created_at"`
	UpdatedAt    int64  `json:"updated_at" gorm:"autoUpdateTime;column:updated_at"`
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

type EnterpriseQuotaAllocation struct {
	Id               int     `json:"id"`
	EnterpriseId     int     `json:"enterprise_id" gorm:"index"`
	OwnerUserId      int     `json:"owner_user_id" gorm:"index"`
	MemberUserId     int     `json:"member_user_id" gorm:"uniqueIndex:idx_enterprise_quota_member"`
	AllocatedQuota   int     `json:"allocated_quota" gorm:"type:int;default:0"`
	RemainQuota      int     `json:"remain_quota" gorm:"type:int;default:0"`
	WarningThreshold float64 `json:"warning_threshold" gorm:"default:0.2"`
	CreatedAt        int64   `json:"created_at" gorm:"autoCreateTime;column:created_at"`
	UpdatedAt        int64   `json:"updated_at" gorm:"autoUpdateTime;column:updated_at"`
}

type EnterpriseQuotaAllocationLog struct {
	Id                   int     `json:"id"`
	EnterpriseId         int     `json:"enterprise_id" gorm:"index"`
	OwnerUserId          int     `json:"owner_user_id" gorm:"index"`
	MemberUserId         int     `json:"member_user_id" gorm:"index"`
	OperatorUserId       int     `json:"operator_user_id" gorm:"index"`
	Delta                int     `json:"delta" gorm:"type:int;default:0"`
	OwnerQuotaBefore     int     `json:"owner_quota_before" gorm:"type:int;default:0"`
	OwnerQuotaAfter      int     `json:"owner_quota_after" gorm:"type:int;default:0"`
	MemberQuotaBefore    int     `json:"member_quota_before" gorm:"type:int;default:0"`
	MemberQuotaAfter     int     `json:"member_quota_after" gorm:"type:int;default:0"`
	AllocatedQuotaBefore int     `json:"allocated_quota_before" gorm:"type:int;default:0"`
	AllocatedQuotaAfter  int     `json:"allocated_quota_after" gorm:"type:int;default:0"`
	WarningThreshold     float64 `json:"warning_threshold" gorm:"default:0.2"`
	Mode                 string  `json:"mode" gorm:"type:varchar(32);default:'set'"`
	CreatedAt            int64   `json:"created_at" gorm:"autoCreateTime;column:created_at"`
}

type EnterpriseInvitation struct {
	Id           int    `json:"id"`
	EnterpriseId int    `json:"enterprise_id" gorm:"index"`
	OwnerUserId  int    `json:"owner_user_id" gorm:"index"`
	Email        string `json:"email" gorm:"type:varchar(128);index"`
	DisplayName  string `json:"display_name" gorm:"type:varchar(64);default:''"`
	Token        string `json:"token" gorm:"type:varchar(128);uniqueIndex"`
	Status       int    `json:"status" gorm:"type:int;default:1;index"`
	AcceptedBy   int    `json:"accepted_by" gorm:"type:int;default:0;index"`
	ExpiresAt    int64  `json:"expires_at" gorm:"index"`
	CreatedAt    int64  `json:"created_at" gorm:"autoCreateTime;column:created_at"`
	UpdatedAt    int64  `json:"updated_at" gorm:"autoUpdateTime;column:updated_at"`
}

type EnterpriseCreateMemberInput struct {
	Identifier  string
	Username    string
	DisplayName string
	Email       string
}

type EnterpriseMemberView struct {
	Id                    int     `json:"id"`
	EnterpriseId          int     `json:"enterprise_id"`
	OwnerUserId           int     `json:"owner_user_id"`
	MemberUserId          int     `json:"member_user_id"`
	Role                  string  `json:"role"`
	Status                int     `json:"status"`
	DisplayName           string  `json:"display_name"`
	CreatedAt             int64   `json:"created_at"`
	UpdatedAt             int64   `json:"updated_at"`
	Username              string  `json:"username"`
	Email                 string  `json:"email"`
	UserStatus            int     `json:"user_status"`
	Group                 string  `json:"group"`
	Quota                 int     `json:"quota"`
	UsedQuota             int     `json:"used_quota"`
	RequestCount          int     `json:"request_count"`
	TokenCount            int64   `json:"token_count"`
	AllocatedQuota        int     `json:"allocated_quota"`
	QuotaWarningThreshold float64 `json:"quota_warning_threshold"`
	EnterpriseUsed        int64   `json:"enterprise_used_quota"`
	EnterpriseReqs        int64   `json:"enterprise_request_count"`
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

type EnterpriseBalanceWarning struct {
	Enabled          bool    `json:"enabled"`
	EmailEnabled     bool    `json:"email_enabled"`
	ThresholdPercent int     `json:"threshold_percent"`
	RemainingPercent float64 `json:"remaining_percent"`
	OwnerQuota       int     `json:"owner_quota"`
	TotalQuota       int     `json:"total_quota"`
	IsLow            bool    `json:"is_low"`
}

type EnterpriseSummary struct {
	Mode           string                   `json:"mode"`
	Enterprise     *EnterpriseAccount       `json:"enterprise,omitempty"`
	Owner          *EnterpriseOwnerView     `json:"owner,omitempty"`
	Member         *EnterpriseMemberView    `json:"member,omitempty"`
	Members        []EnterpriseMemberView   `json:"members"`
	Totals         EnterpriseTotals         `json:"totals"`
	BalanceWarning EnterpriseBalanceWarning `json:"balance_warning"`
}

type AdminEnterpriseAccountView struct {
	Id                  int    `json:"id"`
	Name                string `json:"name"`
	Quota               int    `json:"quota"`
	Status              int    `json:"status"`
	CreatedAt           int64  `json:"created_at"`
	UpdatedAt           int64  `json:"updated_at"`
	CreatedByUserId     int    `json:"created_by_user_id"`
	CreatedByUsername   string `json:"created_by_username"`
	CreatedByEmail      string `json:"created_by_email"`
	ActiveOwnerUserId   int    `json:"active_owner_user_id"`
	ActiveOwnerUsername string `json:"active_owner_username"`
	ActiveOwnerEmail    string `json:"active_owner_email"`
	MemberCount         int64  `json:"member_count"`
	ActiveMemberCount   int64  `json:"active_member_count"`
	TokenCount          int64  `json:"token_count"`
	UsedQuota           int64  `json:"used_quota"`
	RequestCount        int64  `json:"request_count"`
	Detached            bool   `json:"detached"`
	LegacyOwnerUserId   int    `json:"legacy_owner_user_id"`
}

type EnterpriseBillingContext struct {
	EnterpriseId int
	OwnerUserId  int
	OwnerName    string
	OwnerEmail   string
	OwnerQuota   int
}

type EnterpriseBalanceAlertState struct {
	EnterpriseId      int
	EnterpriseName    string
	CreatedByUserId   int
	CreatedByEmail    string
	CreatedByUsername string
	OwnerQuota        int
	AllocatedQuota    int
	TotalQuota        int
	RemainingPercent  float64
	ThresholdPercent  int
	EmailEnabled      bool
	IsLow             bool
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
	if account, err := GetEnterpriseAccountByOwner(ownerUserId); err == nil {
		return account, nil
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
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
	legacyOwnerUserId, err := availableEnterpriseOwnerUserId(DB, ownerUserId)
	if err != nil {
		return nil, err
	}
	account := EnterpriseAccount{
		OwnerUserId:     legacyOwnerUserId,
		CreatedByUserId: ownerUserId,
		Name:            name,
		Status:          EnterpriseStatusEnabled,
	}
	if err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&account).Error; err != nil {
			return err
		}
		return ensureEnterpriseOwnerRelation(tx, account.Id, ownerUserId)
	}); err != nil {
		return nil, err
	}
	return &account, nil
}

func CreateEnterpriseAccount(ownerUserId int, name string) (*EnterpriseAccount, error) {
	if ownerUserId == 0 {
		return nil, errors.New("owner user id is empty")
	}
	owner, err := GetUserById(ownerUserId, false)
	if err != nil {
		return nil, err
	}
	accountName := strings.TrimSpace(name)
	if accountName == "" {
		accountName = strings.TrimSpace(owner.DisplayName)
	}
	if accountName == "" {
		accountName = owner.Username
	}

	if account, err := GetEnterpriseAccountByOwner(ownerUserId); err == nil {
		updates := map[string]interface{}{
			"name":               accountName,
			"status":             EnterpriseStatusEnabled,
			"created_by_user_id": account.CreatedByUserId,
		}
		if account.CreatedByUserId == 0 {
			updates["created_by_user_id"] = ownerUserId
		}
		if err := DB.Model(&EnterpriseAccount{}).Where("id = ?", account.Id).Updates(updates).Error; err != nil {
			return nil, err
		}
		account.Name = accountName
		account.Status = EnterpriseStatusEnabled
		if account.CreatedByUserId == 0 {
			account.CreatedByUserId = ownerUserId
		}
		return account, nil
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	legacyOwnerUserId, err := availableEnterpriseOwnerUserId(DB, ownerUserId)
	if err != nil {
		return nil, err
	}
	account := EnterpriseAccount{
		OwnerUserId:     legacyOwnerUserId,
		CreatedByUserId: ownerUserId,
		Name:            accountName,
		Status:          EnterpriseStatusEnabled,
	}
	if err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&account).Error; err != nil {
			return err
		}
		return ensureEnterpriseOwnerRelation(tx, account.Id, ownerUserId)
	}); err != nil {
		return nil, err
	}
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("created enterprise %s", accountName))
	return &account, nil
}

func GetActiveEnterpriseOwnerRelationByUser(userId int) (*EnterpriseAccountRelation, error) {
	if userId == 0 {
		return nil, errors.New("user id is empty")
	}
	var relation EnterpriseAccountRelation
	err := DB.Where("user_id = ? AND role = ? AND status = ?", userId, EnterpriseRoleOwner, EnterpriseRelationStatusActive).
		Order("id desc").First(&relation).Error
	if err != nil {
		return nil, err
	}
	return &relation, nil
}

func GetEnterpriseAccountByOwner(ownerUserId int) (*EnterpriseAccount, error) {
	if relation, err := GetActiveEnterpriseOwnerRelationByUser(ownerUserId); err == nil {
		var account EnterpriseAccount
		if err := DB.Where("id = ?", relation.EnterpriseId).First(&account).Error; err != nil {
			return nil, err
		}
		return &account, nil
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	var existingRelation EnterpriseAccountRelation
	err := DB.Where("user_id = ? AND role = ?", ownerUserId, EnterpriseRoleOwner).
		Order("id desc").First(&existingRelation).Error
	if err == nil {
		return nil, gorm.ErrRecordNotFound
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	var account EnterpriseAccount
	if err := DB.Where("owner_user_id = ?", ownerUserId).First(&account).Error; err != nil {
		return nil, err
	}
	if account.CreatedByUserId == 0 {
		_ = DB.Model(&EnterpriseAccount{}).Where("id = ?", account.Id).Update("created_by_user_id", ownerUserId).Error
		account.CreatedByUserId = ownerUserId
	}
	if err := ensureEnterpriseOwnerRelation(DB, account.Id, ownerUserId); err != nil {
		return nil, err
	}
	return &account, nil
}

func ensureEnterpriseOwnerRelation(tx *gorm.DB, accountId int, userId int) error {
	if accountId == 0 || userId == 0 {
		return errors.New("enterprise id or user id is empty")
	}
	var relation EnterpriseAccountRelation
	err := tx.Where("enterprise_id = ? AND user_id = ? AND role = ?", accountId, userId, EnterpriseRoleOwner).
		Order("id desc").First(&relation).Error
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return tx.Create(&EnterpriseAccountRelation{
			EnterpriseId: accountId,
			UserId:       userId,
			Role:         EnterpriseRoleOwner,
			Status:       EnterpriseRelationStatusActive,
		}).Error
	}
	if relation.Status != EnterpriseRelationStatusActive {
		return tx.Model(&EnterpriseAccountRelation{}).Where("id = ?", relation.Id).
			Update("status", EnterpriseRelationStatusActive).Error
	}
	return nil
}

func availableEnterpriseOwnerUserId(tx *gorm.DB, preferred int) (int, error) {
	candidate := preferred
	for {
		var count int64
		if err := tx.Model(&EnterpriseAccount{}).Where("owner_user_id = ?", candidate).Count(&count).Error; err != nil {
			return 0, err
		}
		if count == 0 {
			return candidate, nil
		}
		if candidate > 0 {
			candidate = -candidate
		} else {
			candidate--
		}
	}
}

func BackfillEnterpriseAccountRelations() error {
	var accounts []EnterpriseAccount
	if err := DB.Where("owner_user_id > 0").Find(&accounts).Error; err != nil {
		return err
	}
	for _, account := range accounts {
		account := account
		if err := DB.Transaction(func(tx *gorm.DB) error {
			if account.CreatedByUserId == 0 {
				if err := tx.Model(&EnterpriseAccount{}).Where("id = ?", account.Id).
					Update("created_by_user_id", account.OwnerUserId).Error; err != nil {
					return err
				}
			}
			var relationCount int64
			if err := tx.Model(&EnterpriseAccountRelation{}).
				Where("enterprise_id = ? AND user_id = ? AND role = ?", account.Id, account.OwnerUserId, EnterpriseRoleOwner).
				Count(&relationCount).Error; err != nil {
				return err
			}
			if relationCount > 0 {
				return nil
			}
			return ensureEnterpriseOwnerRelation(tx, account.Id, account.OwnerUserId)
		}); err != nil {
			return err
		}
	}
	return DisableDetachedEnterpriseTokens()
}

func DisableDetachedEnterpriseTokens() error {
	var accounts []EnterpriseAccount
	if err := DB.Select("id").Find(&accounts).Error; err != nil {
		return err
	}
	for _, account := range accounts {
		var activeOwnerCount int64
		if err := DB.Model(&EnterpriseAccountRelation{}).
			Where("enterprise_id = ? AND role = ? AND status = ?", account.Id, EnterpriseRoleOwner, EnterpriseRelationStatusActive).
			Count(&activeOwnerCount).Error; err != nil {
			return err
		}
		if activeOwnerCount > 0 {
			continue
		}
		if err := disableEnterpriseTokens(DB, account.Id, nil); err != nil {
			return err
		}
	}
	return nil
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
		OwnerQuota:   account.Quota,
	}, nil
}

func GetEnterpriseQuota(enterpriseId int) (int, error) {
	var quota int
	err := DB.Model(&EnterpriseAccount{}).Where("id = ?", enterpriseId).Select("quota").Find(&quota).Error
	return quota, err
}

func IncreaseEnterpriseQuota(enterpriseId int, quota int) error {
	if quota < 0 {
		return errors.New("quota cannot be negative")
	}
	return DB.Model(&EnterpriseAccount{}).Where("id = ?", enterpriseId).
		Update("quota", gorm.Expr("quota + ?", quota)).Error
}

func DecreaseEnterpriseQuota(enterpriseId int, quota int) error {
	if quota < 0 {
		return errors.New("quota cannot be negative")
	}
	return DB.Model(&EnterpriseAccount{}).Where("id = ? AND quota >= ?", enterpriseId, quota).
		Update("quota", gorm.Expr("quota - ?", quota)).Error
}

func GetEnterpriseMemberRemainQuota(memberUserId int, enterpriseId int) (int, error) {
	var allocation EnterpriseQuotaAllocation
	err := DB.Where("enterprise_id = ? AND member_user_id = ?", enterpriseId, memberUserId).
		First(&allocation).Error
	if err != nil {
		return 0, err
	}
	return allocation.RemainQuota, nil
}

func IncreaseEnterpriseMemberRemainQuota(memberUserId int, enterpriseId int, quota int) error {
	if quota < 0 {
		return errors.New("quota cannot be negative")
	}
	return DB.Model(&EnterpriseQuotaAllocation{}).
		Where("enterprise_id = ? AND member_user_id = ?", enterpriseId, memberUserId).
		Update("remain_quota", gorm.Expr("remain_quota + ?", quota)).Error
}

func DecreaseEnterpriseMemberRemainQuota(memberUserId int, enterpriseId int, quota int) error {
	if quota < 0 {
		return errors.New("quota cannot be negative")
	}
	res := DB.Model(&EnterpriseQuotaAllocation{}).
		Where("enterprise_id = ? AND member_user_id = ? AND remain_quota >= ?", enterpriseId, memberUserId, quota).
		Update("remain_quota", gorm.Expr("remain_quota - ?", quota))
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("enterprise member quota is not enough")
	}
	return nil
}

func AdminSetEnterpriseQuota(enterpriseId int, targetQuota int) (*AdminEnterpriseAccountView, error) {
	if enterpriseId == 0 {
		return nil, errors.New("enterprise id is empty")
	}
	if targetQuota < 0 {
		return nil, errors.New("enterprise quota cannot be negative")
	}
	var account EnterpriseAccount
	if err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("id = ?", enterpriseId).First(&account).Error; err != nil {
			return err
		}
		if err := tx.Model(&EnterpriseAccount{}).Where("id = ?", enterpriseId).
			Update("quota", targetQuota).Error; err != nil {
			return err
		}
		account.Quota = targetQuota
		return nil
	}); err != nil {
		return nil, err
	}
	view, err := buildAdminEnterpriseAccountView(account)
	if err != nil {
		return nil, err
	}
	return &view, nil
}

func AdminAddEnterpriseQuota(enterpriseId int, delta int) (*AdminEnterpriseAccountView, error) {
	if enterpriseId == 0 {
		return nil, errors.New("enterprise id is empty")
	}
	if delta < 0 {
		return nil, errors.New("enterprise quota delta cannot be negative")
	}
	var account EnterpriseAccount
	if err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("id = ?", enterpriseId).First(&account).Error; err != nil {
			return err
		}
		if err := tx.Model(&EnterpriseAccount{}).Where("id = ?", enterpriseId).
			Update("quota", gorm.Expr("quota + ?", delta)).Error; err != nil {
			return err
		}
		account.Quota += delta
		return nil
	}); err != nil {
		return nil, err
	}
	view, err := buildAdminEnterpriseAccountView(account)
	if err != nil {
		return nil, err
	}
	return &view, nil
}

func TransferUserQuotaToEnterprise(ownerUserId int, quota int) (*EnterpriseSummary, error) {
	if ownerUserId == 0 {
		return nil, errors.New("owner user id is empty")
	}
	if quota <= 0 {
		return nil, errors.New("transfer amount must be greater than zero")
	}
	account, err := GetEnterpriseAccountByOwner(ownerUserId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("please create an enterprise first")
		}
		return nil, err
	}
	if account.Status != EnterpriseStatusEnabled {
		return nil, ErrEnterpriseDisabled
	}
	if err := DB.Transaction(func(tx *gorm.DB) error {
		var owner User
		if err := tx.Where("id = ?", ownerUserId).First(&owner).Error; err != nil {
			return err
		}
		if owner.Status != common.UserStatusEnabled {
			return errors.New("enterprise owner is disabled")
		}
		res := tx.Model(&User{}).
			Where("id = ? AND quota >= ?", ownerUserId, quota).
			Update("quota", gorm.Expr("quota - ?", quota))
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return errors.New("personal balance is insufficient")
		}
		return tx.Model(&EnterpriseAccount{}).
			Where("id = ?", account.Id).
			Update("quota", gorm.Expr("quota + ?", quota)).Error
	}); err != nil {
		return nil, err
	}
	_ = InvalidateUserCache(ownerUserId)
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("transferred personal quota to enterprise %d: %d", account.Id, quota))
	return GetEnterpriseSummary(ownerUserId)
}

func GetEnterpriseBillingContextForToken(memberUserId int, enterpriseId int) (*EnterpriseBillingContext, error) {
	if enterpriseId == 0 {
		return nil, nil
	}
	member, err := GetEnterpriseMemberForUser(memberUserId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	if member.EnterpriseId != enterpriseId {
		return nil, ErrEnterpriseDisabled
	}
	if member.Status == EnterpriseMemberStatusDisabled {
		return nil, ErrEnterpriseMemberDisabled
	}
	if member.Status != EnterpriseMemberStatusActive {
		return nil, nil
	}
	return GetEnterpriseBillingContext(memberUserId)
}

func CreateEnterpriseMember(ownerUserId int, input EnterpriseCreateMemberInput) (*EnterpriseMemberView, error) {
	if ownerUserId == 0 {
		return nil, errors.New("owner user id is empty")
	}
	identifier := strings.TrimSpace(input.Identifier)
	if identifier == "" {
		identifier = strings.TrimSpace(input.Username)
	}
	if identifier == "" {
		return nil, errors.New("username or email is required")
	}

	if _, err := GetEnterpriseAccountByOwner(ownerUserId); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("please create an enterprise first")
		}
		return nil, err
	}
	owner, err := GetUserById(ownerUserId, false)
	if err != nil {
		return nil, err
	}
	user, err := getEnterpriseInviteUser(identifier, strings.TrimSpace(input.Email))
	if err != nil {
		return nil, err
	}
	if user.Id == owner.Id {
		return nil, errors.New("owner cannot be invited as a member")
	}
	if user.Status != common.UserStatusEnabled {
		return nil, errors.New("user is not enabled")
	}
	return createEnterpriseMemberForUser(ownerUserId, &user, input.DisplayName)
}

func createEnterpriseMemberForUser(ownerUserId int, user *User, inputDisplayName string) (*EnterpriseMemberView, error) {
	if ownerUserId == 0 {
		return nil, errors.New("owner user id is empty")
	}
	if user == nil || user.Id == 0 {
		return nil, errors.New("user is required")
	}
	account, err := GetEnterpriseAccountByOwner(ownerUserId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("please create an enterprise first")
		}
		return nil, err
	}
	owner, err := GetUserById(ownerUserId, false)
	if err != nil {
		return nil, err
	}
	if user.Id == owner.Id {
		return nil, errors.New("owner cannot be invited as a member")
	}
	if user.Status != common.UserStatusEnabled {
		return nil, errors.New("user is not enabled")
	}
	displayName := strings.TrimSpace(inputDisplayName)
	if displayName == "" {
		displayName = user.DisplayName
	}
	if displayName == "" {
		displayName = user.Username
	}
	if activeMember, err := GetEnterpriseMemberForUser(user.Id); err == nil && activeMember.Status != EnterpriseMemberStatusRemoved {
		if activeMember.OwnerUserId == ownerUserId {
			return nil, errors.New("user is already a member of this enterprise")
		}
		return nil, errors.New("user is already a member of another enterprise")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	var reusableMember EnterpriseMember
	err = DB.Where("owner_user_id = ? AND member_user_id = ? AND status = ?", ownerUserId, user.Id, EnterpriseMemberStatusRemoved).
		Order("id desc").First(&reusableMember).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	if reusableMember.Id != 0 {
		member := reusableMember
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
		RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("re-invited enterprise member %s", user.Username))
		return buildEnterpriseMemberView(member, user, nil, 0, nil), nil
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
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("invited enterprise member %s", user.Username))
	return buildEnterpriseMemberView(member, user, nil, 0, nil), nil
}

func getEnterpriseInviteUser(identifier string, email string) (User, error) {
	var user User
	identifier = strings.TrimSpace(identifier)
	email = strings.TrimSpace(email)
	if identifier == "" && email == "" {
		return user, errors.New("username or email is required")
	}
	query := DB.Where("LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)", identifier, identifier)
	if email != "" {
		query = query.Or("LOWER(email) = LOWER(?)", email)
	}
	err := query.First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return user, errors.New("user does not exist, ask the member to register first")
		}
		return user, err
	}
	return user, nil
}

func CreateEnterpriseInvitation(ownerUserId int, email string, displayName string) (*EnterpriseInvitation, *EnterpriseAccount, *User, error) {
	if ownerUserId == 0 {
		return nil, nil, nil, errors.New("owner user id is empty")
	}
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return nil, nil, nil, errors.New("email is required")
	}
	account, err := GetEnterpriseAccountByOwner(ownerUserId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, nil, errors.New("please create an enterprise first")
		}
		return nil, nil, nil, err
	}
	owner, err := GetUserById(ownerUserId, false)
	if err != nil {
		return nil, nil, nil, err
	}
	if strings.EqualFold(owner.Email, email) {
		return nil, nil, nil, errors.New("owner cannot invite themselves")
	}
	token, err := common.GenerateKey()
	if err != nil {
		return nil, nil, nil, err
	}
	invitation := EnterpriseInvitation{
		EnterpriseId: account.Id,
		OwnerUserId:  ownerUserId,
		Email:        email,
		DisplayName:  strings.TrimSpace(displayName),
		Token:        token,
		Status:       EnterpriseInvitationStatusPending,
		ExpiresAt:    time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	if err := DB.Create(&invitation).Error; err != nil {
		return nil, nil, nil, err
	}
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("sent enterprise invitation to %s", email))
	return &invitation, account, owner, nil
}

func AcceptEnterpriseInvitation(userId int, token string) (*EnterpriseMemberView, error) {
	if userId == 0 {
		return nil, errors.New("user id is empty")
	}
	token = strings.TrimSpace(token)
	if token == "" {
		return nil, errors.New("invitation token is required")
	}
	var invitation EnterpriseInvitation
	if err := DB.Where("token = ?", token).First(&invitation).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invitation not found")
		}
		return nil, err
	}
	if invitation.Status != EnterpriseInvitationStatusPending {
		return nil, errors.New("invitation is no longer available")
	}
	if invitation.ExpiresAt > 0 && invitation.ExpiresAt < common.GetTimestamp() {
		_ = DB.Model(&EnterpriseInvitation{}).Where("id = ?", invitation.Id).Update("status", EnterpriseInvitationStatusExpired).Error
		return nil, errors.New("invitation has expired")
	}
	user, err := GetUserById(userId, false)
	if err != nil {
		return nil, err
	}
	if !strings.EqualFold(user.Email, invitation.Email) {
		return nil, errors.New("please sign in with the invited email account")
	}
	member, err := createEnterpriseMemberForUser(invitation.OwnerUserId, user, invitation.DisplayName)
	if err != nil {
		return nil, err
	}
	if err := DB.Model(&EnterpriseInvitation{}).Where("id = ? AND status = ?", invitation.Id, EnterpriseInvitationStatusPending).
		Updates(map[string]interface{}{
			"status":      EnterpriseInvitationStatusAccepted,
			"accepted_by": userId,
		}).Error; err != nil {
		return nil, err
	}
	RecordLog(invitation.OwnerUserId, LogTypeManage, fmt.Sprintf("accepted enterprise invitation by %s", user.Username))
	return member, nil
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

	shouldDisable := status == EnterpriseMemberStatusDisabled && member.Status != EnterpriseMemberStatusDisabled
	if shouldDisable {
		if err := DB.Transaction(func(tx *gorm.DB) error {
			var allocation EnterpriseQuotaAllocation
			err := tx.Where("enterprise_id = ? AND member_user_id = ?", member.EnterpriseId, member.MemberUserId).
				First(&allocation).Error
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

			refundQuota := 0
			if allocation.Id != 0 {
				refundQuota = allocation.RemainQuota
			}
			if refundQuota > 0 {
				if err := tx.Model(&EnterpriseAccount{}).Where("id = ?", member.EnterpriseId).
					Update("quota", gorm.Expr("quota + ?", refundQuota)).Error; err != nil {
					return err
				}
			}
			if allocation.Id != 0 {
				if err := tx.Model(&EnterpriseQuotaAllocation{}).Where("id = ?", allocation.Id).
					Updates(map[string]interface{}{
						"allocated_quota": 0,
						"remain_quota":    0,
					}).Error; err != nil {
					return err
				}
			}
			if err := tx.Model(&EnterpriseMember{}).Where("id = ? AND owner_user_id = ?", memberId, ownerUserId).
				Updates(updates).Error; err != nil {
				return err
			}
			if err := disableEnterpriseTokens(tx, member.EnterpriseId, []int{member.MemberUserId}); err != nil {
				return err
			}
			return nil
		}); err != nil {
			return nil, err
		}
	} else if len(updates) > 0 {
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
		_ = InvalidateUserCache(ownerUserId)
		_ = InvalidateUserCache(member.MemberUserId)
		_ = InvalidateUserTokensCache(member.MemberUserId)
	}
	user, err := GetUserById(member.MemberUserId, false)
	if err != nil {
		return nil, err
	}
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("updated enterprise member %s", user.Username))
	return buildEnterpriseMemberView(*member, user, nil, 0, nil), nil
}

func RemoveEnterpriseMember(ownerUserId int, memberId int) error {
	if ownerUserId == 0 || memberId == 0 {
		return errors.New("owner user id or member id is empty")
	}
	member, err := getEnterpriseMemberByOwner(ownerUserId, memberId)
	if err != nil {
		return err
	}
	if member.Status == EnterpriseMemberStatusRemoved {
		return nil
	}
	var memberUser User
	var allocation EnterpriseQuotaAllocation
	if err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("id = ?", member.MemberUserId).First(&memberUser).Error; err != nil {
			return err
		}
		err := tx.Where("enterprise_id = ? AND member_user_id = ?", member.EnterpriseId, member.MemberUserId).
			First(&allocation).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		refundQuota := 0
		if allocation.Id != 0 {
			refundQuota = allocation.RemainQuota
		}
		if refundQuota > 0 {
			if err := tx.Model(&EnterpriseAccount{}).Where("id = ?", member.EnterpriseId).
				Update("quota", gorm.Expr("quota + ?", refundQuota)).Error; err != nil {
				return err
			}
		}
		if allocation.Id != 0 {
			if err := tx.Model(&EnterpriseQuotaAllocation{}).Where("id = ?", allocation.Id).
				Updates(map[string]interface{}{
					"allocated_quota": 0,
					"remain_quota":    0,
				}).Error; err != nil {
				return err
			}
		}
		if err := tx.Model(&EnterpriseMember{}).
			Where("id = ? AND owner_user_id = ?", memberId, ownerUserId).
			Update("status", EnterpriseMemberStatusRemoved).Error; err != nil {
			return err
		}
		if err := disableEnterpriseTokens(tx, member.EnterpriseId, []int{member.MemberUserId}); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return err
	}
	_ = InvalidateUserCache(ownerUserId)
	_ = InvalidateUserCache(member.MemberUserId)
	_ = InvalidateUserTokensCache(member.MemberUserId)
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("removed enterprise member %d and refunded remaining quota", member.MemberUserId))
	return nil
}

func LeaveEnterpriseMembership(userId int) error {
	if userId == 0 {
		return errors.New("user id is empty")
	}
	member, err := GetEnterpriseMemberForUser(userId)
	if err != nil {
		return err
	}
	var allocation EnterpriseQuotaAllocation
	err = DB.Where("enterprise_id = ? AND member_user_id = ?", member.EnterpriseId, userId).First(&allocation).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	if allocation.Id != 0 && allocation.RemainQuota > 0 {
		return errors.New("member still has remaining balance, please contact an administrator")
	}
	if err := DB.Transaction(func(tx *gorm.DB) error {
		if allocation.Id != 0 {
			if err := tx.Model(&EnterpriseQuotaAllocation{}).Where("id = ?", allocation.Id).
				Updates(map[string]interface{}{
					"allocated_quota": 0,
					"remain_quota":    0,
				}).Error; err != nil {
				return err
			}
		}
		if err := tx.Model(&EnterpriseMember{}).
			Where("id = ? AND member_user_id = ? AND status <> ?", member.Id, userId, EnterpriseMemberStatusRemoved).
			Update("status", EnterpriseMemberStatusRemoved).Error; err != nil {
			return err
		}
		return disableEnterpriseTokens(tx, member.EnterpriseId, []int{userId})
	}); err != nil {
		return err
	}
	_ = InvalidateUserTokensCache(userId)
	RecordLog(userId, LogTypeManage, fmt.Sprintf("left enterprise %d", member.EnterpriseId))
	return nil
}

func DetachEnterpriseOwner(userId int) error {
	if userId == 0 {
		return errors.New("user id is empty")
	}
	relation, err := GetActiveEnterpriseOwnerRelationByUser(userId)
	if err != nil {
		return err
	}
	var account EnterpriseAccount
	if err := DB.Where("id = ?", relation.EnterpriseId).First(&account).Error; err != nil {
		return err
	}
	if account.Quota > 0 {
		return errors.New("enterprise still has remaining balance, please contact an administrator")
	}
	var members []EnterpriseMember
	if err := DB.Where("enterprise_id = ? AND status <> ?", relation.EnterpriseId, EnterpriseMemberStatusRemoved).
		Find(&members).Error; err != nil {
		return err
	}
	memberUserIds := make([]int, 0, len(members))
	for _, member := range members {
		memberUserIds = append(memberUserIds, member.MemberUserId)
	}
	if len(memberUserIds) > 0 {
		var memberBalanceCount int64
		if err := DB.Model(&EnterpriseQuotaAllocation{}).
			Where("enterprise_id = ? AND member_user_id IN ? AND remain_quota > 0", relation.EnterpriseId, memberUserIds).
			Count(&memberBalanceCount).Error; err != nil {
			return err
		}
		if memberBalanceCount > 0 {
			return errors.New("enterprise members still have remaining balance, please contact an administrator")
		}
	}
	if err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&EnterpriseAccountRelation{}).
			Where("id = ? AND user_id = ? AND status = ?", relation.Id, userId, EnterpriseRelationStatusActive).
			Update("status", EnterpriseRelationStatusRemoved).Error; err != nil {
			return err
		}
		if err := tx.Model(&EnterpriseMember{}).
			Where("enterprise_id = ? AND status <> ?", relation.EnterpriseId, EnterpriseMemberStatusRemoved).
			Update("status", EnterpriseMemberStatusRemoved).Error; err != nil {
			return err
		}
		if len(memberUserIds) > 0 {
			if err := tx.Model(&EnterpriseQuotaAllocation{}).
				Where("enterprise_id = ? AND member_user_id IN ?", relation.EnterpriseId, memberUserIds).
				Updates(map[string]interface{}{
					"allocated_quota": 0,
					"remain_quota":    0,
				}).Error; err != nil {
				return err
			}
		}
		if err := tx.Model(&EnterpriseInvitation{}).
			Where("enterprise_id = ? AND status = ?", relation.EnterpriseId, EnterpriseInvitationStatusPending).
			Update("status", EnterpriseInvitationStatusExpired).Error; err != nil {
			return err
		}
		if err := disableEnterpriseTokens(tx, relation.EnterpriseId, nil); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return err
	}
	_ = InvalidateUserTokensCache(userId)
	for _, memberUserId := range memberUserIds {
		_ = InvalidateUserTokensCache(memberUserId)
	}
	RecordLog(userId, LogTypeManage, fmt.Sprintf("detached enterprise %d", relation.EnterpriseId))
	return nil
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

func disableEnterpriseTokens(tx *gorm.DB, enterpriseId int, memberUserIds []int) error {
	if enterpriseId == 0 {
		return nil
	}
	buildQuery := func() *gorm.DB {
		query := tx.Model(&Token{}).
			Where("enterprise_id = ? AND status = ?", enterpriseId, common.TokenStatusEnabled)
		if len(memberUserIds) > 0 {
			query = query.Where("user_id IN ?", memberUserIds)
		}
		return query
	}
	var tokens []Token
	if err := buildQuery().Select(commonKeyCol).Find(&tokens).Error; err != nil {
		return err
	}
	if err := buildQuery().Update("status", common.TokenStatusDisabled).Error; err != nil {
		return err
	}
	for _, token := range tokens {
		if token.Key != "" {
			_ = cacheDeleteToken(token.Key)
		}
	}
	return nil
}

func getEnterpriseMemberByOwner(ownerUserId int, memberId int) (*EnterpriseMember, error) {
	var member EnterpriseMember
	err := DB.Where("id = ? AND owner_user_id = ?", memberId, ownerUserId).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func GetEnterpriseMemberByOwner(ownerUserId int, memberId int) (*EnterpriseMember, error) {
	return getEnterpriseMemberByOwner(ownerUserId, memberId)
}

func ListEnterpriseMembers(ownerUserId int) ([]EnterpriseMemberView, EnterpriseTotals, error) {
	var totals EnterpriseTotals
	if ownerUserId == 0 {
		return nil, totals, errors.New("owner user id is empty")
	}
	account, err := GetEnterpriseAccountByOwner(ownerUserId)
	if err != nil {
		return nil, totals, err
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
	usageByUser := getEnterpriseUsageByUser(userIds, account.Id)
	tokenCountByUser := getTokenCountByUser(userIds, account.Id)
	allocationByUser := getEnterpriseAllocationByUser(userIds, account.Id)

	views := make([]EnterpriseMemberView, 0, len(members))
	for _, member := range members {
		usage := usageByUser[member.MemberUserId]
		tokenCount := tokenCountByUser[member.MemberUserId]
		totals.UsedQuota += usage.Quota
		totals.RequestCount += usage.RequestCount
		totals.TokenCount += tokenCount
		allocation := allocationByUser[member.MemberUserId]
		views = append(views, *buildEnterpriseMemberView(member, usersById[member.MemberUserId], &usage, tokenCount, &allocation))
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

	if account, err := GetEnterpriseAccountByOwner(userId); err == nil {
		members, totals, err := ListEnterpriseMembers(userId)
		if err != nil {
			return nil, err
		}
		return &EnterpriseSummary{
			Mode:           EnterpriseRoleOwner,
			Enterprise:     account,
			Owner:          enterpriseOwnerViewFromUser(user),
			Members:        members,
			Totals:         totals,
			BalanceWarning: buildEnterpriseBalanceWarning(account.Id, nil),
		}, nil
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
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
		usageByUser := getEnterpriseUsageByUser([]int{userId}, account.Id)
		tokenCountByUser := getTokenCountByUser([]int{userId}, account.Id)
		allocationByUser := getEnterpriseAllocationByUser([]int{userId}, account.Id)
		usage := usageByUser[userId]
		tokenCount := tokenCountByUser[userId]
		allocation := allocationByUser[userId]
		return &EnterpriseSummary{
			Mode:       EnterpriseRoleMember,
			Enterprise: account,
			Owner:      enterpriseOwnerViewFromUser(owner),
			Member:     buildEnterpriseMemberView(*member, user, &usage, tokenCount, &allocation),
			Members:    []EnterpriseMemberView{},
			Totals: EnterpriseTotals{
				MemberCount:  1,
				ActiveCount:  boolToInt(member.Status == EnterpriseMemberStatusActive),
				TokenCount:   tokenCount,
				UsedQuota:    usage.Quota,
				RequestCount: usage.RequestCount,
			},
			BalanceWarning: buildEnterpriseBalanceWarning(account.Id, nil),
		}, nil
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	return &EnterpriseSummary{
		Mode:           EnterpriseRoleNone,
		Owner:          enterpriseOwnerViewFromUser(user),
		Members:        []EnterpriseMemberView{},
		Totals:         EnterpriseTotals{},
		BalanceWarning: buildEnterpriseBalanceWarning(0, &user.Quota),
	}, nil
}

func buildEnterpriseBalanceWarning(enterpriseId int, ownerQuotaOverride *int) EnterpriseBalanceWarning {
	state, err := GetEnterpriseBalanceAlertState(enterpriseId, ownerQuotaOverride)
	if err != nil {
		setting := operation_setting.GetEnterpriseSetting()
		return EnterpriseBalanceWarning{
			Enabled:          setting.BalanceWarningPercent > 0,
			EmailEnabled:     setting.BalanceEmailNotifyEnabled,
			ThresholdPercent: setting.BalanceWarningPercent,
		}
	}
	return EnterpriseBalanceWarning{
		Enabled:          state.ThresholdPercent > 0,
		EmailEnabled:     state.EmailEnabled,
		ThresholdPercent: state.ThresholdPercent,
		RemainingPercent: state.RemainingPercent,
		OwnerQuota:       state.OwnerQuota,
		TotalQuota:       state.TotalQuota,
		IsLow:            state.IsLow,
	}
}

func GetEnterpriseBalanceAlertState(enterpriseId int, ownerQuotaOverride *int) (*EnterpriseBalanceAlertState, error) {
	setting := operation_setting.GetEnterpriseSetting()
	threshold := setting.BalanceWarningPercent
	if threshold < 0 {
		threshold = 0
	}
	if threshold > 100 {
		threshold = 100
	}
	state := &EnterpriseBalanceAlertState{
		EnterpriseId:     enterpriseId,
		ThresholdPercent: threshold,
		EmailEnabled:     setting.BalanceEmailNotifyEnabled,
	}
	if enterpriseId == 0 {
		if ownerQuotaOverride != nil {
			state.OwnerQuota = *ownerQuotaOverride
			state.TotalQuota = *ownerQuotaOverride
			if state.TotalQuota > 0 {
				state.RemainingPercent = 100
			}
		}
		return state, nil
	}

	var account EnterpriseAccount
	if err := DB.Where("id = ?", enterpriseId).First(&account).Error; err != nil {
		return nil, err
	}
	state.EnterpriseName = account.Name

	ownerUserId := account.CreatedByUserId
	var relation EnterpriseAccountRelation
	if err := DB.Where("enterprise_id = ? AND role = ? AND status = ?", enterpriseId, EnterpriseRoleOwner, EnterpriseRelationStatusActive).
		Order("id desc").First(&relation).Error; err == nil {
		ownerUserId = relation.UserId
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if ownerUserId == 0 && account.OwnerUserId > 0 {
		ownerUserId = account.OwnerUserId
	}

	creatorUserId := account.CreatedByUserId
	if creatorUserId == 0 {
		creatorUserId = ownerUserId
	}
	var creator User
	if creatorUserId != 0 {
		if err := DB.Select("id", "username", "email").Where("id = ?", creatorUserId).First(&creator).Error; err == nil {
			state.CreatedByUserId = creator.Id
			state.CreatedByUsername = creator.Username
			state.CreatedByEmail = creator.Email
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}

	if ownerQuotaOverride != nil {
		state.OwnerQuota = *ownerQuotaOverride
	} else {
		state.OwnerQuota = account.Quota
	}

	var allocatedTotal int64
	err := DB.Table("enterprise_quota_allocations").
		Joins("JOIN enterprise_members ON enterprise_members.member_user_id = enterprise_quota_allocations.member_user_id AND enterprise_members.enterprise_id = enterprise_quota_allocations.enterprise_id").
		Where("enterprise_quota_allocations.enterprise_id = ? AND enterprise_members.status <> ?", enterpriseId, EnterpriseMemberStatusRemoved).
		Select("COALESCE(SUM(enterprise_quota_allocations.allocated_quota), 0)").
		Scan(&allocatedTotal).Error
	if err != nil {
		return nil, err
	}
	state.AllocatedQuota = int(allocatedTotal)
	state.TotalQuota = state.OwnerQuota + state.AllocatedQuota
	if state.TotalQuota > 0 {
		state.RemainingPercent = float64(state.OwnerQuota) / float64(state.TotalQuota) * 100
	}
	state.IsLow = threshold > 0 && state.TotalQuota > 0 && state.RemainingPercent < float64(threshold)
	return state, nil
}

func AllocateEnterpriseMemberQuota(ownerUserId int, memberId int, targetQuota int, warningThreshold float64) (*EnterpriseMemberView, error) {
	if ownerUserId == 0 || memberId == 0 {
		return nil, errors.New("owner user id or member id is empty")
	}
	if targetQuota < 0 {
		return nil, errors.New("allocated quota cannot be negative")
	}
	if warningThreshold < 0 {
		warningThreshold = 0
	}
	if warningThreshold > 1 {
		warningThreshold = 1
	}

	member, err := getEnterpriseMemberByOwner(ownerUserId, memberId)
	if err != nil {
		return nil, err
	}
	if member.Status == EnterpriseMemberStatusRemoved {
		return nil, errors.New("enterprise member not found")
	}
	if member.Status != EnterpriseMemberStatusActive {
		return nil, errors.New("enterprise member is not active")
	}

	var resultMember EnterpriseMember
	var resultUser User
	var resultAllocation EnterpriseQuotaAllocation
	if err := DB.Transaction(func(tx *gorm.DB) error {
		var account EnterpriseAccount
		if err := tx.Where("id = ?", member.EnterpriseId).First(&account).Error; err != nil {
			return err
		}
		var owner User
		if err := tx.Where("id = ?", ownerUserId).First(&owner).Error; err != nil {
			return err
		}
		if owner.Status != common.UserStatusEnabled {
			return errors.New("enterprise owner is disabled")
		}
		var memberUser User
		if err := tx.Where("id = ?", member.MemberUserId).First(&memberUser).Error; err != nil {
			return err
		}
		if memberUser.Status != common.UserStatusEnabled {
			return errors.New("enterprise member user is disabled")
		}

		var allocation EnterpriseQuotaAllocation
		err := tx.Where("member_user_id = ?", member.MemberUserId).First(&allocation).Error
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			allocation = EnterpriseQuotaAllocation{
				EnterpriseId:     member.EnterpriseId,
				OwnerUserId:      ownerUserId,
				MemberUserId:     member.MemberUserId,
				AllocatedQuota:   0,
				WarningThreshold: 0.2,
			}
		}

		delta := targetQuota - allocation.RemainQuota
		if delta > 0 {
			res := tx.Model(&EnterpriseAccount{}).
				Where("id = ? AND quota >= ?", account.Id, delta).
				Update("quota", gorm.Expr("quota - ?", delta))
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return errors.New("insufficient enterprise balance")
			}
		} else if delta < 0 {
			returnAmount := -delta
			if err := tx.Model(&EnterpriseAccount{}).Where("id = ?", account.Id).
				Update("quota", gorm.Expr("quota + ?", returnAmount)).Error; err != nil {
				return err
			}
		}

		allocatedBefore := allocation.AllocatedQuota
		allocation.EnterpriseId = member.EnterpriseId
		allocation.OwnerUserId = ownerUserId
		allocation.MemberUserId = member.MemberUserId
		allocation.AllocatedQuota = targetQuota
		allocation.RemainQuota = targetQuota
		allocation.WarningThreshold = warningThreshold
		if allocation.Id == 0 {
			if err := tx.Create(&allocation).Error; err != nil {
				return err
			}
		} else if err := tx.Save(&allocation).Error; err != nil {
			return err
		}

		if err := tx.Create(&EnterpriseQuotaAllocationLog{
			EnterpriseId:         member.EnterpriseId,
			OwnerUserId:          ownerUserId,
			MemberUserId:         member.MemberUserId,
			OperatorUserId:       ownerUserId,
			Delta:                delta,
			OwnerQuotaBefore:     account.Quota,
			OwnerQuotaAfter:      account.Quota - delta,
			MemberQuotaBefore:    allocation.RemainQuota - delta,
			MemberQuotaAfter:     targetQuota,
			AllocatedQuotaBefore: allocatedBefore,
			AllocatedQuotaAfter:  targetQuota,
			WarningThreshold:     warningThreshold,
			Mode:                 "set",
		}).Error; err != nil {
			return err
		}

		if err := tx.Where("id = ?", member.Id).First(&resultMember).Error; err != nil {
			return err
		}
		if err := tx.Where("id = ?", member.MemberUserId).First(&resultUser).Error; err != nil {
			return err
		}
		resultAllocation = allocation
		return nil
	}); err != nil {
		return nil, err
	}

	_ = InvalidateUserCache(ownerUserId)
	_ = InvalidateUserCache(resultUser.Id)
	RecordLog(ownerUserId, LogTypeManage, fmt.Sprintf("allocated enterprise member quota to %s: %d", resultUser.Username, targetQuota))
	return buildEnterpriseMemberView(resultMember, &resultUser, nil, 0, &resultAllocation), nil
}

func getParentAllocatedQuota(tx *gorm.DB, userId int) int {
	if userId == 0 {
		return 0
	}
	var member EnterpriseMember
	if err := tx.Where("member_user_id = ? AND status <> ?", userId, EnterpriseMemberStatusRemoved).
		Order("id desc").First(&member).Error; err != nil || member.Status != EnterpriseMemberStatusActive {
		return 0
	}
	var allocation EnterpriseQuotaAllocation
	if err := tx.Where("member_user_id = ?", userId).First(&allocation).Error; err != nil {
		return 0
	}
	if allocation.AllocatedQuota < 0 {
		return 0
	}
	return allocation.AllocatedQuota
}

func GetEnterpriseMemberTokens(ownerUserId int, memberId int, startIdx int, num int) ([]*Token, int64, error) {
	member, err := getEnterpriseMemberByOwner(ownerUserId, memberId)
	if err != nil {
		return nil, 0, err
	}
	var total int64
	if err := DB.Model(&Token{}).Where("user_id = ? AND enterprise_id = ?", member.MemberUserId, member.EnterpriseId).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var tokens []*Token
	err = DB.Where("user_id = ? AND enterprise_id = ?", member.MemberUserId, member.EnterpriseId).Order("id desc").Limit(num).Offset(startIdx).Find(&tokens).Error
	return tokens, total, err
}

func GetEnterpriseMemberTokensForViewer(viewerUserId int, memberId int, startIdx int, num int) ([]*Token, int64, error) {
	return SearchEnterpriseMemberTokensForViewer(viewerUserId, memberId, "", "", 0, startIdx, num)
}

func SearchEnterpriseMemberTokensForViewer(viewerUserId int, memberId int, keyword string, token string, status int, startIdx int, num int) ([]*Token, int64, error) {
	member, err := getEnterpriseMemberByOwner(viewerUserId, memberId)
	if err != nil {
		var selfMember EnterpriseMember
		selfErr := DB.Where("id = ? AND member_user_id = ? AND status <> ?", memberId, viewerUserId, EnterpriseMemberStatusRemoved).
			First(&selfMember).Error
		if selfErr != nil {
			return nil, 0, err
		}
		member = &selfMember
	}
	if num <= 0 || num > searchHardLimit {
		num = searchHardLimit
	}
	if startIdx < 0 {
		startIdx = 0
	}
	if token != "" {
		token = strings.TrimPrefix(token, "sk-")
	}
	query := DB.Model(&Token{}).Where("user_id = ? AND enterprise_id = ?", member.MemberUserId, member.EnterpriseId)
	if keyword != "" {
		keywordPattern, err := sanitizeLikePattern(keyword)
		if err != nil {
			return nil, 0, err
		}
		query = query.Where("name LIKE ? ESCAPE '!'", keywordPattern)
	}
	if token != "" {
		tokenPattern, err := sanitizeLikePattern(token)
		if err != nil {
			return nil, 0, err
		}
		query = query.Where(commonKeyCol+" LIKE ? ESCAPE '!'", tokenPattern)
	}
	if status > 0 {
		query = query.Where("status = ?", status)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var tokens []*Token
	err = query.Order("id desc").Limit(num).Offset(startIdx).Find(&tokens).Error
	return tokens, total, err
}

func GetEnterpriseLogs(ownerUserId int, memberId int, logType int, startTimestamp int64, endTimestamp int64, modelName string, tokenName string, keyword string, startIdx int, num int) ([]*Log, int64, error) {
	account, err := GetEnterpriseAccountByOwner(ownerUserId)
	if err != nil {
		return nil, 0, err
	}
	memberUserIds, err := enterpriseVisibleMemberUserIds(ownerUserId, memberId)
	if err != nil {
		return nil, 0, err
	}
	if len(memberUserIds) == 0 {
		return []*Log{}, 0, nil
	}

	tx := LOG_DB.Where("logs.user_id IN ? AND logs.enterprise_id = ?", memberUserIds, account.Id)
	if logType != LogTypeUnknown {
		tx = tx.Where("logs.type = ?", logType)
	}
	if tx, err = applyExplicitLogTextFilter(tx, "logs.model_name", modelName); err != nil {
		return nil, 0, err
	}
	if tokenName != "" {
		tx = tx.Where("logs.token_name = ?", tokenName)
	}
	if keyword != "" {
		pattern, err := sanitizeLikePattern("%" + keyword + "%")
		if err != nil {
			return nil, 0, err
		}
		tx = tx.Where(
			"(logs.username LIKE ? ESCAPE '!' OR logs.model_name LIKE ? ESCAPE '!' OR logs.token_name LIKE ? ESCAPE '!' OR logs.request_id LIKE ? ESCAPE '!' OR logs.upstream_request_id LIKE ? ESCAPE '!')",
			pattern,
			pattern,
			pattern,
			pattern,
			pattern,
		)
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

func GetEnterpriseLogsForViewer(viewerUserId int, memberId int, logType int, startTimestamp int64, endTimestamp int64, modelName string, tokenName string, keyword string, startIdx int, num int) ([]*Log, int64, error) {
	account, err := GetEnterpriseAccountByOwner(viewerUserId)
	if err == nil {
		memberUserIds, err := enterpriseVisibleMemberUserIds(viewerUserId, memberId)
		if err != nil {
			return nil, 0, err
		}
		return queryEnterpriseLogs(account.Id, memberUserIds, logType, startTimestamp, endTimestamp, modelName, tokenName, keyword, startIdx, num)
	}

	member, memberErr := GetEnterpriseMemberForUser(viewerUserId)
	if memberErr != nil {
		return nil, 0, err
	}
	if memberId != 0 && member.Id != memberId {
		return nil, 0, gorm.ErrRecordNotFound
	}
	return queryEnterpriseLogs(member.EnterpriseId, []int{viewerUserId}, logType, startTimestamp, endTimestamp, modelName, tokenName, keyword, startIdx, num)
}

func queryEnterpriseLogs(enterpriseId int, memberUserIds []int, logType int, startTimestamp int64, endTimestamp int64, modelName string, tokenName string, keyword string, startIdx int, num int) ([]*Log, int64, error) {
	if len(memberUserIds) == 0 {
		return []*Log{}, 0, nil
	}

	tx := LOG_DB.Where("logs.user_id IN ? AND logs.enterprise_id = ?", memberUserIds, enterpriseId)
	if logType != LogTypeUnknown {
		tx = tx.Where("logs.type = ?", logType)
	}
	var err error
	if tx, err = applyExplicitLogTextFilter(tx, "logs.model_name", modelName); err != nil {
		return nil, 0, err
	}
	if tokenName != "" {
		tx = tx.Where("logs.token_name = ?", tokenName)
	}
	if keyword != "" {
		pattern, err := sanitizeLikePattern("%" + keyword + "%")
		if err != nil {
			return nil, 0, err
		}
		tx = tx.Where(
			"(logs.username LIKE ? ESCAPE '!' OR logs.model_name LIKE ? ESCAPE '!' OR logs.token_name LIKE ? ESCAPE '!' OR logs.request_id LIKE ? ESCAPE '!' OR logs.upstream_request_id LIKE ? ESCAPE '!')",
			pattern,
			pattern,
			pattern,
			pattern,
			pattern,
		)
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

func getEnterpriseUsageByUser(userIds []int, enterpriseId int) map[int]enterpriseUsageRow {
	result := make(map[int]enterpriseUsageRow, len(userIds))
	if len(userIds) == 0 {
		return result
	}
	var rows []enterpriseUsageRow
	err := LOG_DB.Model(&Log{}).
		Select("user_id, COALESCE(SUM(quota), 0) AS quota, COUNT(*) AS request_count").
		Where("type = ? AND user_id IN ? AND enterprise_id = ?", LogTypeConsume, userIds, enterpriseId).
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

func getTokenCountByUser(userIds []int, enterpriseId int) map[int]int64 {
	result := make(map[int]int64, len(userIds))
	if len(userIds) == 0 {
		return result
	}
	var rows []enterpriseTokenCountRow
	err := DB.Model(&Token{}).
		Select("user_id, COUNT(*) AS count").
		Where("user_id IN ? AND enterprise_id = ?", userIds, enterpriseId).
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

func getEnterpriseAllocationByUser(userIds []int, enterpriseId int) map[int]EnterpriseQuotaAllocation {
	result := make(map[int]EnterpriseQuotaAllocation, len(userIds))
	if len(userIds) == 0 {
		return result
	}
	var allocations []EnterpriseQuotaAllocation
	if err := DB.Where("enterprise_id = ? AND member_user_id IN ?", enterpriseId, userIds).Find(&allocations).Error; err != nil {
		common.SysLog("failed to load enterprise quota allocation: " + err.Error())
		return result
	}
	for _, allocation := range allocations {
		result[allocation.MemberUserId] = allocation
	}
	return result
}

func buildEnterpriseMemberView(member EnterpriseMember, user *User, usage *enterpriseUsageRow, tokenCount int64, allocation *EnterpriseQuotaAllocation) *EnterpriseMemberView {
	view := &EnterpriseMemberView{
		Id:                    member.Id,
		EnterpriseId:          member.EnterpriseId,
		OwnerUserId:           member.OwnerUserId,
		MemberUserId:          member.MemberUserId,
		Role:                  member.Role,
		Status:                member.Status,
		DisplayName:           member.DisplayName,
		CreatedAt:             member.CreatedAt,
		UpdatedAt:             member.UpdatedAt,
		TokenCount:            tokenCount,
		QuotaWarningThreshold: 0.2,
	}
	if allocation != nil && allocation.Id != 0 {
		view.AllocatedQuota = allocation.AllocatedQuota
		view.Quota = allocation.RemainQuota
		view.QuotaWarningThreshold = allocation.WarningThreshold
	}
	if user != nil {
		view.Username = user.Username
		view.Email = user.Email
		view.UserStatus = user.Status
		view.Group = user.Group
		view.UsedQuota = user.UsedQuota
		view.RequestCount = user.RequestCount
	}
	if usage != nil {
		view.EnterpriseUsed = usage.Quota
		view.EnterpriseReqs = usage.RequestCount
	}
	return view
}

func SearchEnterpriseAccounts(keyword string, startIdx int, num int) ([]AdminEnterpriseAccountView, int64, error) {
	keyword = strings.TrimSpace(keyword)
	buildQuery := func() (*gorm.DB, error) {
		query := DB.Model(&EnterpriseAccount{})
		if keyword == "" {
			return query, nil
		}
		pattern := "%" + escapeEnterpriseLike(keyword) + "%"
		matchedUserIds, err := enterpriseSearchUserIds(pattern)
		if err != nil {
			return nil, err
		}
		matchedEnterpriseIds, err := enterpriseSearchRelationEnterpriseIds(matchedUserIds)
		if err != nil {
			return nil, err
		}
		query = query.Where("LOWER(name) LIKE LOWER(?) ESCAPE '!'", pattern)
		if len(matchedUserIds) > 0 {
			query = query.Or("created_by_user_id IN ? OR owner_user_id IN ?", matchedUserIds, matchedUserIds)
		}
		if len(matchedEnterpriseIds) > 0 {
			query = query.Or("id IN ?", matchedEnterpriseIds)
		}
		return query, nil
	}

	countQuery, err := buildQuery()
	if err != nil {
		return nil, 0, err
	}

	var total int64
	if err := countQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if total == 0 {
		return []AdminEnterpriseAccountView{}, 0, nil
	}

	var accounts []EnterpriseAccount
	listQuery, err := buildQuery()
	if err != nil {
		return nil, 0, err
	}
	if err := listQuery.Order("id desc").Limit(num).Offset(startIdx).Find(&accounts).Error; err != nil {
		return nil, 0, err
	}
	views := make([]AdminEnterpriseAccountView, 0, len(accounts))
	for _, account := range accounts {
		view, err := buildAdminEnterpriseAccountView(account)
		if err != nil {
			return nil, 0, err
		}
		views = append(views, view)
	}
	return views, total, nil
}

func AdminGetEnterpriseAccountView(enterpriseId int) (*AdminEnterpriseAccountView, error) {
	if enterpriseId == 0 {
		return nil, errors.New("enterprise id is empty")
	}
	var account EnterpriseAccount
	if err := DB.Where("id = ?", enterpriseId).First(&account).Error; err != nil {
		return nil, err
	}
	view, err := buildAdminEnterpriseAccountView(account)
	if err != nil {
		return nil, err
	}
	return &view, nil
}

func AdminListEnterpriseMembers(enterpriseId int) ([]EnterpriseMemberView, EnterpriseTotals, error) {
	var totals EnterpriseTotals
	if enterpriseId == 0 {
		return nil, totals, errors.New("enterprise id is empty")
	}
	var account EnterpriseAccount
	if err := DB.Where("id = ?", enterpriseId).First(&account).Error; err != nil {
		return nil, totals, err
	}
	var members []EnterpriseMember
	if err := DB.Where("enterprise_id = ? AND status <> ?", enterpriseId, EnterpriseMemberStatusRemoved).
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
	usageByUser := getEnterpriseUsageByUser(userIds, account.Id)
	tokenCountByUser := getTokenCountByUser(userIds, account.Id)
	allocationByUser := getEnterpriseAllocationByUser(userIds, account.Id)

	views := make([]EnterpriseMemberView, 0, len(members))
	for _, member := range members {
		usage := usageByUser[member.MemberUserId]
		tokenCount := tokenCountByUser[member.MemberUserId]
		totals.UsedQuota += usage.Quota
		totals.RequestCount += usage.RequestCount
		totals.TokenCount += tokenCount
		allocation := allocationByUser[member.MemberUserId]
		views = append(views, *buildEnterpriseMemberView(member, usersById[member.MemberUserId], &usage, tokenCount, &allocation))
	}
	return views, totals, nil
}

func AdminGetEnterpriseLogs(enterpriseId int, logType int, startTimestamp int64, endTimestamp int64, modelName string, tokenName string, keyword string, startIdx int, num int) ([]*Log, int64, error) {
	if enterpriseId == 0 {
		return nil, 0, errors.New("enterprise id is empty")
	}
	var account EnterpriseAccount
	if err := DB.Select("id").Where("id = ?", enterpriseId).First(&account).Error; err != nil {
		return nil, 0, err
	}
	tx := LOG_DB.Where("logs.enterprise_id = ?", enterpriseId)
	if logType != LogTypeUnknown {
		tx = tx.Where("logs.type = ?", logType)
	}
	var err error
	if tx, err = applyExplicitLogTextFilter(tx, "logs.model_name", modelName); err != nil {
		return nil, 0, err
	}
	if tokenName != "" {
		tx = tx.Where("logs.token_name = ?", tokenName)
	}
	if keyword != "" {
		pattern, err := sanitizeLikePattern("%" + keyword + "%")
		if err != nil {
			return nil, 0, err
		}
		tx = tx.Where(
			"(logs.username LIKE ? ESCAPE '!' OR logs.model_name LIKE ? ESCAPE '!' OR logs.token_name LIKE ? ESCAPE '!' OR logs.request_id LIKE ? ESCAPE '!' OR logs.upstream_request_id LIKE ? ESCAPE '!')",
			pattern,
			pattern,
			pattern,
			pattern,
			pattern,
		)
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

func escapeEnterpriseLike(input string) string {
	input = strings.ReplaceAll(input, "!", "!!")
	input = strings.ReplaceAll(input, "%", "!%")
	input = strings.ReplaceAll(input, "_", "!_")
	return input
}

func enterpriseSearchUserIds(pattern string) ([]int, error) {
	var users []User
	if err := DB.Select("id").
		Where("LOWER(username) LIKE LOWER(?) ESCAPE '!' OR LOWER(email) LIKE LOWER(?) ESCAPE '!' OR LOWER(display_name) LIKE LOWER(?) ESCAPE '!'", pattern, pattern, pattern).
		Limit(1000).
		Find(&users).Error; err != nil {
		return nil, err
	}
	ids := make([]int, 0, len(users))
	for _, user := range users {
		ids = append(ids, user.Id)
	}
	return ids, nil
}

func enterpriseSearchRelationEnterpriseIds(userIds []int) ([]int, error) {
	if len(userIds) == 0 {
		return nil, nil
	}
	var relations []EnterpriseAccountRelation
	if err := DB.Select("enterprise_id").
		Where("user_id IN ? AND role = ? AND status = ?", userIds, EnterpriseRoleOwner, EnterpriseRelationStatusActive).
		Find(&relations).Error; err != nil {
		return nil, err
	}
	ids := make([]int, 0, len(relations))
	seen := make(map[int]bool, len(relations))
	for _, relation := range relations {
		if relation.EnterpriseId != 0 && !seen[relation.EnterpriseId] {
			ids = append(ids, relation.EnterpriseId)
			seen[relation.EnterpriseId] = true
		}
	}
	return ids, nil
}

func buildAdminEnterpriseAccountView(account EnterpriseAccount) (AdminEnterpriseAccountView, error) {
	view := AdminEnterpriseAccountView{
		Id:                account.Id,
		Name:              account.Name,
		Quota:             account.Quota,
		Status:            account.Status,
		CreatedAt:         account.CreatedAt,
		UpdatedAt:         account.UpdatedAt,
		CreatedByUserId:   account.CreatedByUserId,
		LegacyOwnerUserId: account.OwnerUserId,
		Detached:          true,
	}
	if view.CreatedByUserId == 0 {
		view.CreatedByUserId = account.OwnerUserId
	}
	if view.CreatedByUserId != 0 {
		if user, err := GetUserById(view.CreatedByUserId, false); err == nil {
			view.CreatedByUsername = user.Username
			view.CreatedByEmail = user.Email
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return view, err
		}
	}

	var relation EnterpriseAccountRelation
	err := DB.Where("enterprise_id = ? AND role = ? AND status = ?", account.Id, EnterpriseRoleOwner, EnterpriseRelationStatusActive).
		Order("id desc").First(&relation).Error
	if err == nil {
		view.Detached = false
		view.ActiveOwnerUserId = relation.UserId
		if user, err := GetUserById(relation.UserId, false); err == nil {
			view.ActiveOwnerUsername = user.Username
			view.ActiveOwnerEmail = user.Email
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return view, err
		}
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return view, err
	}

	if err := DB.Model(&EnterpriseMember{}).
		Where("enterprise_id = ? AND status <> ?", account.Id, EnterpriseMemberStatusRemoved).
		Count(&view.MemberCount).Error; err != nil {
		return view, err
	}
	if err := DB.Model(&EnterpriseMember{}).
		Where("enterprise_id = ? AND status = ?", account.Id, EnterpriseMemberStatusActive).
		Count(&view.ActiveMemberCount).Error; err != nil {
		return view, err
	}
	if err := DB.Model(&Token{}).Where("enterprise_id = ?", account.Id).Count(&view.TokenCount).Error; err != nil {
		return view, err
	}
	var usage enterpriseUsageRow
	if err := LOG_DB.Model(&Log{}).
		Select("COALESCE(SUM(quota), 0) AS quota, COUNT(*) AS request_count").
		Where("enterprise_id = ? AND type = ?", account.Id, LogTypeConsume).
		Scan(&usage).Error; err != nil {
		return view, err
	}
	view.UsedQuota = usage.Quota
	view.RequestCount = usage.RequestCount
	return view, nil
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}
