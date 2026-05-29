from sqlalchemy import (
    Column,
    String,
    Text,
    Numeric,
    Integer,
    JSON,
    ForeignKey,
    ARRAY,
)
from sqlalchemy.dialects.postgresql import VECTOR
from sqlalchemy.orm import relationship

from src.models.base import Base, UUIDMixin, TimestampMixin


class Product(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "products"

    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    compare_at_price = Column(Numeric(10, 2), nullable=True)
    category = Column(String(100), nullable=True, index=True)
    subcategory = Column(String(100), nullable=True)
    tags = Column(ARRAY(String), default=list)
    brand = Column(String(100), nullable=True)
    sku = Column(String(100), nullable=True)
    inventory_count = Column(Integer, default=0)
    status = Column(String(20), default="active", index=True)
    attributes = Column(JSON, nullable=True)
    images = Column(JSON, default=list)
    text_embedding = Column(VECTOR(1024), nullable=True)
    image_embedding = Column(VECTOR(768), nullable=True)

    vendor = relationship("Vendor", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")


class ProductVariant(Base, UUIDMixin):
    __tablename__ = "product_variants"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    variant_name = Column(String(255), nullable=False)
    sku = Column(String(100), nullable=True)
    price_adjustment = Column(Numeric(10, 2), default=0)
    inventory_count = Column(Integer, default=0)
    attributes = Column(JSON, nullable=True)

    product = relationship("Product", back_populates="variants")
