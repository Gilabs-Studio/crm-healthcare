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

	// Seed categories (required for accounts)
	if err := SeedCategories(); err != nil {
		return err
	}

	// Seed product categories (required for products)
	if err := SeedProductCategories(); err != nil {
		return err
	}

	// Seed activity types (required for activities)
	if err := SeedActivityTypes(); err != nil {
		return err
	}

	// Seed products (requires product categories)
	if err := SeedProducts(); err != nil {
		return err
	}

	// Seed contact roles (required for contacts)
	if err := SeedContactRoles(); err != nil {
		return err
	}

	// Seed accounts (requires users for assigned_to and categories for category_id)
	if err := SeedAccounts(); err != nil {
		return err
	}

	// Seed contacts (requires accounts for account_id and contact_roles for role_id)
	if err := SeedContacts(); err != nil {
		return err
	}

	// Seed pipeline stages
	if err := SeedPipelineStages(); err != nil {
		return err
	}

	// Seed deals (requires users, accounts, contacts, pipeline stages)
	if err := SeedDeals(); err != nil {
		return err
	}

	// Seed tasks (requires users, accounts, contacts)
	if err := SeedTasks(); err != nil {
		return err
	}

	// Seed reminders (requires tasks)
	if err := SeedReminders(); err != nil {
		return err
	}

	// Seed notifications (requires reminders)
	if err := SeedNotifications(); err != nil {
		return err
	}

	// Seed visit reports (requires accounts, contacts, and users)
	if err := SeedVisitReports(); err != nil {
		return err
	}

	// Seed activities (requires accounts, contacts, users, and visit reports)
	if err := SeedActivities(); err != nil {
		return err
	}

	// Seed leads (requires users for assigned_to and created_by)
	if err := SeedLeads(); err != nil {
		return err
	}

	return nil
}

