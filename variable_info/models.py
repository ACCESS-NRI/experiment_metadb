from __future__ import annotations
from sqlalchemy import (
    Integer, Text, Index, String, Column, ForeignKey, Table, ARRAY, Float, UniqueConstraint)
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Mapped, sessionmaker
from typing import List

#TODO: move the connection details to env variables
USERNAME = ""
PASSWORD = ""
HOST = ""
CONNSTR = f'postgresql://{USERNAME}:{PASSWORD}@{HOST}/EXPERIMENT'

Base = declarative_base()

def create_session():

    engine = create_engine(CONNSTR)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False)
    return session()

exp_vars = Table(
    "exp_variables",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("experiments", ForeignKey("experiments.id")),
    Column("variables", ForeignKey("variables.id")),
    UniqueConstraint('experiments', 'variables', name='uix_1')
)

model_coordinate_variables = Table(
    "model_coordinate_variables",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("model_name", ForeignKey("models.name")),
    Column("variable_id", ForeignKey("variables.id")),
    UniqueConstraint('model_name', 'variable_id', name='uix_1')
)

class Variable(Base):
    __tablename__ = "variables"
    __table_args__ = (
        Index(
            "ix_variables_name_long_name_units",
            "name",
            "long_name",
            "units",
            unique=True,
        ),
    )

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, index=True)
    long_name = Column(String)
    standard_name = Column(String)
    units = Column(String)


class Model(Base):
    __tablename__ = "models"
    name = Column(String, primary_key=True)
    coordinate_variables:Mapped[List[Variable]] = relationship(
        Variable, secondary=model_coordinate_variables
    )

class Experiment(Base):
    __tablename__ = "experiments"

    __table_args__ = (
        Index(
            "ix_experiments_experiment_rootdir", "name", unique=True
        ),
    )

    # Fields taken from catalog metadata available at 
    # https://access-nri-intake-catalog.readthedocs.io/en/latest/management/building.html#metadata-yaml-files
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    experiment_uuid = Column(String)
    description = Column(Text)
    long_description = Column(Text)
    model = Column(ARRAY(String))
    realm = Column(ARRAY(String))
    frequency = Column(ARRAY(String))
    nominal_resolution = Column(ARRAY(String)) 
    version = Column(Float)
    contact = Column(String)
    email = Column(String)
    created = Column(String)
    reference = Column(Text)
    license = Column(Text)
    url = Column(String)
    parent_experiment = Column(String) 
    related_experiments = Column(ARRAY(String))
    notes = Column(Text)
    keywords = Column(ARRAY(String))
    variables:Mapped[List[Variable]] = relationship(
        Variable, secondary=exp_vars
    )