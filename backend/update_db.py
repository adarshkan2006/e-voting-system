"""
Script to update the database schema
"""
import sqlite3

conn = sqlite3.connect('instance/evoting.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Existing tables:", tables)

# Check if password_reset_tokens table exists
table_names = [t[0] for t in tables]

# Add candidate_id to votes table if it doesn't exist
cursor.execute("PRAGMA table_info(votes)")
vote_columns = [col[1] for col in cursor.fetchall()]
print("Votes columns:", vote_columns)

if 'candidate_id' not in vote_columns:
    print("Adding candidate_id column to votes table...")
    try:
        cursor.execute("ALTER TABLE votes ADD COLUMN candidate_id INTEGER")
        conn.commit()
        print("Added candidate_id column successfully")
    except Exception as e:
        print(f"Error adding candidate_id: {e}")

# Create password_reset_tokens table if it doesn't exist
if 'password_reset_tokens' not in table_names:
    print("Creating password_reset_tokens table...")
    cursor.execute("""
        CREATE TABLE password_reset_tokens (
            id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            token VARCHAR(100) UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            used BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    conn.commit()
    print("Created password_reset_tokens table successfully")
else:
    print("password_reset_tokens table already exists")

conn.close()
print("Database update complete!")
