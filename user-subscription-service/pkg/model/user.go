package model

import (
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	id       uint `gorm:"primaryKey"`
	name     string
	email    string
	password string
}

func (u *User) ID() uint {
	return u.id
}

func (u *User) Name() string {
	return u.name
}

func (u *User) Email() string {
	return u.email
}

func (u *User) SetName(name string) {
	u.name = name
}

func (u *User) SetEmail(email string) {
	u.email = email
}

func (u *User) SetPassword(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.password = string(hash)
	return nil
}

func (u *User) ComparePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.password), []byte(password))
	return err == nil
}
