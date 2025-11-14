# Database Backup & Restore

This feature allows superadmins to backup and restore the PostgreSQL database.

## How It Works

This implementation uses the **`pg` Node.js library** to directly connect to your Neon PostgreSQL database, so you **don't need to install PostgreSQL client tools** (`pg_dump` or `psql`).

The backup/restore operations work entirely through Node.js, making it platform-independent and easier to deploy.

## Features

### Backup
- Click "Create Backup" button to download a full database backup
- Backup includes all tables, schemas, and data
- Downloads as a `.sql` file with timestamp
- Records backup history in the `BackupHistory` table

### Restore
- Click "Restore Database" button
- Select a `.sql` backup file
- Confirms before overwriting current database
- ⚠️ **Warning**: This will replace ALL current data

## Security

- Only users with `SUPERADMIN` role can access these features
- All backup/restore actions are logged in the database
- Backup files are generated dynamically and downloaded directly (no server storage)

## Troubleshooting

### Connection issues
- Verify your `DATABASE_URL` in `.env` is correct
- Neon databases require SSL connections (already configured)
- Check firewall settings if connection times out

### Large database issues
- Increase the `maxBuffer` in the API routes if needed
- Consider using Neon's built-in backup features for very large databases
