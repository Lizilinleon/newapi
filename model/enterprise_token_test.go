package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/require"
)

func TestGetEnterpriseMemberTokensForViewerAllowsOwnerAndSelf(t *testing.T) {
	truncateTables(t)
	require.NoError(t, DB.Exec("DELETE FROM enterprise_members").Error)
	require.NoError(t, DB.Exec("DELETE FROM tokens").Error)

	member := EnterpriseMember{
		EnterpriseId: 30,
		OwnerUserId:  10,
		MemberUserId: 20,
		Role:         EnterpriseRoleMember,
		Status:       EnterpriseMemberStatusActive,
	}
	require.NoError(t, DB.Create(&member).Error)

	enterpriseToken := Token{
		UserId:         20,
		Name:           "enterprise-key",
		Key:            "enterprise-key",
		Status:         common.TokenStatusEnabled,
		ExpiredTime:    -1,
		UnlimitedQuota: true,
		EnterpriseId:   30,
	}
	require.NoError(t, DB.Create(&enterpriseToken).Error)
	require.NoError(t, DB.Create(&Token{
		UserId:         20,
		Name:           "personal-key",
		Key:            "personal-key",
		Status:         common.TokenStatusEnabled,
		ExpiredTime:    -1,
		UnlimitedQuota: true,
		EnterpriseId:   0,
	}).Error)
	require.NoError(t, DB.Create(&Token{
		UserId:         20,
		Name:           "other-enterprise-key",
		Key:            "other-enterprise-key",
		Status:         common.TokenStatusEnabled,
		ExpiredTime:    -1,
		UnlimitedQuota: true,
		EnterpriseId:   31,
	}).Error)

	ownerTokens, ownerTotal, err := GetEnterpriseMemberTokensForViewer(10, member.Id, 0, 10)
	require.NoError(t, err)
	require.EqualValues(t, 1, ownerTotal)
	require.Len(t, ownerTokens, 1)
	require.Equal(t, "enterprise-key", ownerTokens[0].Name)

	selfTokens, selfTotal, err := GetEnterpriseMemberTokensForViewer(20, member.Id, 0, 10)
	require.NoError(t, err)
	require.EqualValues(t, 1, selfTotal)
	require.Len(t, selfTokens, 1)
	require.Equal(t, "enterprise-key", selfTokens[0].Name)
}

func TestGetEnterpriseMemberTokensForViewerRejectsOutsider(t *testing.T) {
	truncateTables(t)
	require.NoError(t, DB.Exec("DELETE FROM enterprise_members").Error)

	member := EnterpriseMember{
		EnterpriseId: 30,
		OwnerUserId:  10,
		MemberUserId: 20,
		Role:         EnterpriseRoleMember,
		Status:       EnterpriseMemberStatusActive,
	}
	require.NoError(t, DB.Create(&member).Error)

	_, _, err := GetEnterpriseMemberTokensForViewer(99, member.Id, 0, 10)
	require.Error(t, err)
}

func TestUpdateEnterpriseMemberDisabledRefundsAllocationAndDisablesTokens(t *testing.T) {
	truncateTables(t)
	require.NoError(t, DB.Exec("DELETE FROM enterprise_accounts").Error)
	require.NoError(t, DB.Exec("DELETE FROM enterprise_members").Error)
	require.NoError(t, DB.Exec("DELETE FROM enterprise_quota_allocations").Error)
	require.NoError(t, DB.Exec("DELETE FROM tokens").Error)

	require.NoError(t, DB.Create(&User{Id: 10, Username: "owner", Status: common.UserStatusEnabled, AffCode: "owner-aff"}).Error)
	require.NoError(t, DB.Create(&User{Id: 20, Username: "member", Status: common.UserStatusEnabled, AffCode: "member-aff"}).Error)

	account := EnterpriseAccount{
		Id:          30,
		OwnerUserId: 10,
		Name:        "org",
		Quota:       100,
		Status:      EnterpriseStatusEnabled,
	}
	require.NoError(t, DB.Create(&account).Error)

	member := EnterpriseMember{
		EnterpriseId: 30,
		OwnerUserId:  10,
		MemberUserId: 20,
		Role:         EnterpriseRoleMember,
		Status:       EnterpriseMemberStatusActive,
	}
	require.NoError(t, DB.Create(&member).Error)
	require.NoError(t, DB.Create(&EnterpriseQuotaAllocation{
		EnterpriseId:   30,
		OwnerUserId:    10,
		MemberUserId:   20,
		AllocatedQuota: 70,
		RemainQuota:    40,
	}).Error)
	require.NoError(t, DB.Create(&Token{
		UserId:         20,
		Name:           "enterprise-key",
		Key:            "enterprise-key-disabled",
		Status:         common.TokenStatusEnabled,
		ExpiredTime:    -1,
		UnlimitedQuota: true,
		EnterpriseId:   30,
	}).Error)

	_, err := UpdateEnterpriseMember(10, member.Id, EnterpriseMemberStatusDisabled, "")
	require.NoError(t, err)

	var updatedAccount EnterpriseAccount
	require.NoError(t, DB.First(&updatedAccount, 30).Error)
	require.Equal(t, 140, updatedAccount.Quota)

	var updatedAllocation EnterpriseQuotaAllocation
	require.NoError(t, DB.Where("enterprise_id = ? AND member_user_id = ?", 30, 20).First(&updatedAllocation).Error)
	require.Zero(t, updatedAllocation.AllocatedQuota)
	require.Zero(t, updatedAllocation.RemainQuota)

	var updatedMember EnterpriseMember
	require.NoError(t, DB.First(&updatedMember, member.Id).Error)
	require.Equal(t, EnterpriseMemberStatusDisabled, updatedMember.Status)

	var updatedToken Token
	require.NoError(t, DB.Where("user_id = ? AND enterprise_id = ?", 20, 30).First(&updatedToken).Error)
	require.Equal(t, common.TokenStatusDisabled, updatedToken.Status)
}
