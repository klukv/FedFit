package utils

import (
	"database/sql/driver"
	"fmt"
	"strings"
	"time"
)

type CustomDate struct {
	time.Time
}

const layout = "2006-01-02 15:04:05"

func (c *CustomDate) UnmarshalJSON(b []byte) (err error) {
	s := strings.Trim(string(b), `"`)

	if s == "null" {
		return
	}

	c.Time, err = time.Parse(layout, s)
	return
}

func (c CustomDate) MarshalJSON() ([]byte, error) {
	if c.Time.IsZero() {
		return nil, nil
	}
	return []byte(fmt.Sprintf(`"%s"`, c.Time.Format(layout))), nil
}

func (ct CustomDate) Value() (driver.Value, error) {
	if ct.Time.IsZero() {
		return nil, nil
	}
	return ct.Time, nil
}

func (ct *CustomDate) Scan(src interface{}) error {
	if src == nil {
		ct.Time = time.Time{}
		return nil
	}
	switch t := src.(type) {
	case time.Time:
		ct.Time = t
		return nil
	default:
		return fmt.Errorf("cannot scan %T into CustomTime", src)
	}
}
