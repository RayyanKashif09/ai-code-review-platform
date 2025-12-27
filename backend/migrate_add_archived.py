"""
Migration script to add is_archived column to projects table
Run this once: python migrate_add_archived.py
"""

import os
import urllib.parse
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv()

# Database Configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '3306'))
DB_NAME = os.getenv('DB_NAME', 'logicguard')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

print(f"Connecting to MySQL database: {DB_NAME}@{DB_HOST}:{DB_PORT}")

try:
    # Connect to database
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

    cursor = connection.cursor()

    # Check if column already exists
    cursor.execute("""
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s
        AND TABLE_NAME = 'projects'
        AND COLUMN_NAME = 'is_archived'
    """, (DB_NAME,))

    result = cursor.fetchone()

    if result[0] > 0:
        print("Column 'is_archived' already exists in projects table. Skipping migration.")
    else:
        # Add the column
        print("Adding 'is_archived' column to projects table...")
        cursor.execute("""
            ALTER TABLE projects
            ADD COLUMN is_archived BOOLEAN DEFAULT FALSE AFTER language
        """)
        connection.commit()
        print("Successfully added 'is_archived' column!")

    cursor.close()
    connection.close()
    print("Migration completed successfully!")

except pymysql.err.OperationalError as e:
    print(f"Database connection error: {e}")
except Exception as e:
    print(f"Error: {e}")
