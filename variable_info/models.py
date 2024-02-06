from __future__ import annotations
from sqlalchemy import (
    Integer, Text, Index, String, Column, ForeignKey, Table, ARRAY, Float)
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Mapped, sessionmaker
from typing import List

#TODO: move the connection details to env variables
USERNAME = ""
PASSWORD = ""
HOST = "ep-summer-frost-03430523.ap-southeast-1.aws.neon.tech"
CONNSTR = f'postgresql://{USERNAME}:{PASSWORD}@{HOST}/EXPERIMENT'

Base = declarative_base()

def create_session():

    engine = create_engine(CONNSTR)
    Base.metadata.create_all(engine)

    Session = sessionmaker(bind=engine, autoflush=False)
    return Session()

exp_vars = Table(
    "expVars",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("experiments", ForeignKey("experiments.id")),
    Column("variables", ForeignKey("variables.id"))
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
