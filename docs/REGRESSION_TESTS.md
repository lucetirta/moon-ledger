# Moon Ledger Regression Tests

## Purpose
This document is a reusable regression checklist for future development sessions. It describes expected user behaviors to verify after feature work or bug fixes.

It does not describe implementation details. It exists to ensure that product behavior remains stable while the codebase evolves.

## Subscription
- Create Personal Subscription
- Create Sharing Subscription
- Add Member
- Remove Member
- Edit Existing Member
- Edit Member Share
- Save
- Reopen
- Recalculate Member Shares
- Edit Total Cost
- Edit Maximum Members

## Debt
- Create Regular Debt
- Create Installment Debt
- Create Credit Card Installment
- Edit Debt
- Delete Debt
- Pay Debt
- Verify Debt History
- Verify Remaining Balance

## Receivables
- Create Receivable
- Edit Receivable
- Delete Receivable
- Collect Payment
- Verify Collection History

## Transactions
- Income
- Expense
- Transfer
- Pay Debt
- Collect Receivable
- Edit Transaction
- Delete Transaction

## Accounts
- Cash
- Bank
- Credit Card
- Opening Balance
- Transfers
- Credit Limit
- Available Credit

## Dashboard
- Net Worth
- Summary Cards
- Attention Items
- Recent Transactions

## Settings
- Categories
- Import
- Export
- Backup
- Restore
- Reset Demo Data

## Usage Guidance
- Use this checklist after meaningful feature work, bug fixes, or UX changes.
- Focus on the areas most likely to be affected by the change.
- If financial behavior changed, prioritize finance-related regressions first.
- If the visible UI changed, include runtime verification rather than relying only on source inspection.