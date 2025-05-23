"""Add confirmation number to Trip model

Revision ID: dc083cd36b12
Revises: c0c9913580e5
Create Date: 2025-01-20 21:38:07.102932

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dc083cd36b12'
down_revision = 'c0c9913580e5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('trips', schema=None) as batch_op:
        batch_op.add_column(sa.Column('confirmation_number', sa.String(length=9), nullable=False))
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(length=150),
               nullable=False)
        batch_op.create_unique_constraint(None, ['confirmation_number'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('trips', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='unique')
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(length=150),
               nullable=True)
        batch_op.drop_column('confirmation_number')

    # ### end Alembic commands ###
