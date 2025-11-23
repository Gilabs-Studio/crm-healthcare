package seeders

// SeedAll runs all seeders
func SeedAll() error {
	// Seed in order: roles -> permissions -> menus -> users
	if err := SeedRoles(); err != nil {
		return err
	}

	if err := SeedMenus(); err != nil {
		return err
	}

	if err := SeedPermissions(); err != nil {
		return err
	}

	if err := SeedUsers(); err != nil {
		return err
	}

	return nil
}

