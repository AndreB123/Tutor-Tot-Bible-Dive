package model

import (
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       uint `gorm:"primaryKey"`
	Name     string
	Email    string
	Password string
}

func (u *User) SetPassword(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hash)
	return nil
}

func (u *User) ComparePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
