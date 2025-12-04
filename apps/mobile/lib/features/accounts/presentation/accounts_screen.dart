import 'package:flutter/material.dart';

import '../../../core/widgets/main_scaffold.dart';
import 'account_list_screen.dart';

class AccountsScreen extends StatelessWidget {
  const AccountsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 1,
      title: 'Accounts',
      body: const AccountListScreen(hideAppBar: true),
    );
  }
}

