"""Initial migration with updated models

Revision ID: 3228e470a0e5
Revises: 
Create Date: 2024-12-14 14:44:09.885068

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3228e470a0e5'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('first_name', sa.String(length=100), nullable=False),
    sa.Column('last_name', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=150), nullable=False),
    sa.Column('phone_number', sa.String(length=20), nullable=True),
    sa.Column('street_address', sa.String(length=200), nullable=True),
    sa.Column('city', sa.String(length=100), nullable=True),
    sa.Column('state', sa.String(length=100), nullable=True),
    sa.Column('zip_code', sa.String(length=20), nullable=True),
    sa.Column('country', sa.String(length=100), nullable=True),
    sa.Column('cardholder_name', sa.String(length=100), nullable=True),
    sa.Column('card_number', sa.String(length=16), nullable=True),
    sa.Column('card_type', sa.String(length=50), nullable=True),
    sa.Column('expiry_date', sa.String(length=5), nullable=True),
    sa.Column('cvc', sa.String(length=4), nullable=True),
    sa.Column('is_admin', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('user_id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('trips',
    sa.Column('trip_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('destination', sa.String(length=100), nullable=False),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('end_date', sa.Date(), nullable=False),
    sa.Column('nights', sa.Integer(), nullable=False),
    sa.Column('num_adults', sa.Integer(), nullable=False),
    sa.Column('num_kids', sa.Integer(), nullable=False),
    sa.Column('caravan_fee', sa.Float(), nullable=False),
    sa.Column('grand_total', sa.Float(), nullable=False),
    sa.Column('trip_fully_processed', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
    sa.PrimaryKeyConstraint('trip_id')
    )
    op.create_table('segments',
    sa.Column('segment_id', sa.Integer(), nullable=False),
    sa.Column('trip_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('selected_accommodation', sa.String(length=100), nullable=False),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('end_date', sa.Date(), nullable=False),
    sa.Column('nights', sa.Integer(), nullable=False),
    sa.Column('base_price', sa.Float(), nullable=False),
    sa.Column('tax', sa.Float(), nullable=False),
    sa.Column('total', sa.Float(), nullable=False),
    sa.Column('payment_successful', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['trip_id'], ['trips.trip_id'], ),
    sa.PrimaryKeyConstraint('segment_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('segments')
    op.drop_table('trips')
    op.drop_table('users')
    # ### end Alembic commands ###
