import intake
from models import *
import sys
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound

def get_catalog(catalog_name):
    catalog = intake.cat.access_nri
    catalog_filtered = catalog.search(name=catalog_name)
    return catalog_filtered.to_source()

def get_catalog_var_info(data_catalog):
    var_info_mapping_list = data_catalog.df.apply(
        lambda row: set(zip(row["variable"], row["variable_long_name"], 
                        row["variable_standard_name"], row["variable_units"])), axis=1).tolist()
    exp_var_info = set()
    for s in var_info_mapping_list:
        exp_var_info.update(s)
    return exp_var_info

def create_experiment(metadata):
    experiment = Experiment()
    experiment.name = metadata.get("name")
    experiment.experiment_uuid = metadata.get("experiment_uuid")
    experiment.description = metadata.get("description")
    experiment.long_description = metadata.get("long_description")
    experiment.model = metadata.get("model")
    experiment.realm = metadata.get("realm")
    experiment.frequency = metadata.get("frequency")
    experiment.nominal_resolution = metadata.get("nominal_resolution")
    experiment.version = metadata.get("version")
    experiment.contact = metadata.get("contact")
    experiment.email = metadata.get("email")
    experiment.created = metadata.get("created")
    experiment.reference = metadata.get("reference") 
    experiment.license = metadata.get("license")
    experiment.url = metadata.get("url")
    experiment.parent_experiment = metadata.get("parent_experiment")
    experiment.related_experiments = metadata.get("related_experiments")
    experiment.notes = metadata.get("notes")
    experiment.keywords = metadata.get("keywords")
    return experiment

def add_experiment_variables(session, experiment, variable_info_list):
    for variable_info in variable_info_list:
        try:
            variable = session.query(Variable).filter(
                Variable.name == variable_info[0], 
                Variable.long_name == variable_info[1],
                Variable.standard_name == variable_info[2],
                Variable.units == variable_info[3]).one()
        except NoResultFound:
            variable = Variable()
            variable.name = variable_info[0]
            variable.long_name = variable_info[1]
            variable.standard_name = variable_info[2]
            variable.units = variable_info[3]
        experiment.variables.append(variable)
    
    return experiment
        
        

def main():

    catalog_name = sys.argv[1]
    session = create_session()

    data_catalog = get_catalog(catalog_name)
    var_info = get_catalog_var_info(data_catalog)

    experiment = create_experiment(data_catalog.metadata)
    experiment = add_experiment_variables(session, experiment, var_info)

    try:
        session.add(experiment)
        session.commit()

    except:
        session.rollback()
        raise

    finally:
        session.close()



if __name__ == "__main__":
    main()