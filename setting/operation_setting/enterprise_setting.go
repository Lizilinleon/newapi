package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

type EnterpriseSetting struct {
	BalanceEmailNotifyEnabled bool `json:"balance_email_notify_enabled"`
	BalanceWarningPercent     int  `json:"balance_warning_percent"`
}

var enterpriseSetting = EnterpriseSetting{
	BalanceEmailNotifyEnabled: false,
	BalanceWarningPercent:     20,
}

func init() {
	config.GlobalConfig.Register("enterprise_setting", &enterpriseSetting)
}
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																								
func GetEnterpriseSetting() *EnterpriseSetting {
	return &enterpriseSetting
}
