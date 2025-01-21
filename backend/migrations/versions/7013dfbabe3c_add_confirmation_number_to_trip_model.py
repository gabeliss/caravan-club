"""Add confirmation number to Trip model

Revision ID: 7013dfbabe3c
Revises: dc083cd36b12
Create Date: 2024-01-xx

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
import random
import string

def generate_confirmation_number():
    digits = ''.join(random.choices(string.digits, k=8))
    return f"C{digits}"

# revision identifiers, used by Alembic.
revision = '7013dfbabe3c'  # Keep your existing revision ID
down_revision = 'dc083cd36b12'  # Keep your existing down_revision
branch_labels = None
depends_on = None

def upgrade():
    # Add the column as nullable first
    op.add_column('trips', sa.Column('confirmation_number', sa.String(9), nullable=True))
    
    # Create a table representation for the update
    trips_table = table('trips',
        column('trip_id', sa.Integer),
        column('confirmation_number', sa.String(9))
    )
    
    # Get database connection
    connection = op.get_bind()
    
    # Get all trip IDs
    result = connection.execute(sa.text("SELECT trip_id FROM trips WHERE confirmation_number IS NULL"))
    
    # Update each trip with a unique confirmation number
    for row in result:
        confirmation_number = generate_confirmation_number()
        # Keep generating until we get a unique one
        while connection.execute(
            sa.text("SELECT 1 FROM trips WHERE confirmation_number = :conf"),
            {"conf": confirmation_number}
        ).scalar() is not None:
            confirmation_number = generate_confirmation_number()
            
        connection.execute(
            sa.text("UPDATE trips SET confirmation_number = :conf WHERE trip_id = :id"),
            {"conf": confirmation_number, "id": row[0]}
        )
    
    # Now make the column NOT NULL and add the unique constraint
    op.alter_column('trips', 'confirmation_number',
        existing_type=sa.String(9),
        nullable=False
    )
    op.create_unique_constraint('uq_trips_confirmation_number', 'trips', ['confirmation_number'])

def downgrade():
    op.drop_constraint('uq_trips_confirmation_number', 'trips', type_='unique')
    op.drop_column('trips', 'confirmation_number')
