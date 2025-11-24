package seeders

// SeedAll runs all seeders
func SeedAll() error {
	// Seed in order: roles -> menus -> permissions -> users -> accounts -> contacts
	if err := SeedRoles(); err != nil {
		return err
	}

	if err := SeedMenus(); err != nil {
		return err
	}

	// Update menu structure for existing menus (migration)
	if err := UpdateMenuStructure(); err != nil {
		return err
	}

	if err := SeedPermissions(); err != nil {
		return err
	}

	if err := SeedUsers(); err != nil {
		return err
	}

	// Seed accounts (requires users for assigned_to)
	if err := SeedAccounts(); err != nil {
		return err
	}

	// Seed contacts (requires accounts for account_id)
	if err := SeedContacts(); err != nil {
		return err
	}

	return nil
}

