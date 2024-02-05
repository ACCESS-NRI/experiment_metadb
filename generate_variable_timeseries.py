import intake
from itertools import chain
import matplotlib.pyplot as plt
import json
from collections import defaultdict
import cftime
import sys


def get_catalog(catalog_name):
    catalog = intake.cat.access_nri
    catalog_filtered = catalog.search(name=catalog_name)
    data_catalog = catalog_filtered.to_source()
    return data_catalog.df[~((data_catalog.df.start_date == 'none') | (data_catalog.df.end_date == 'none'))]


def get_coordinate_var(filename):
    with open(filename) as coordinate_var_json:
       return json.load(coordinate_var_json)

    
def convert_column_to_cftime(data_catalog, column_name):
    data_catalog[column_name].map(lambda date: cftime.datetime.strptime(
        date,format="%Y-%m-%d, %H:%M:%S", calendar='standard', has_year_zero=None))


def extract_plot_variables(data_catalog, realm_list, coordinate_var_dict):
    # Dict with realms as keys and list of variables present in the realm as values
    plot_variables = defaultdict(dict)
    
    # Create list of variables in catalog for each realm and remove coordinates variable
    for realm in realm_list:
        realm_vars = set(chain.from_iterable(data_catalog.loc[data_catalog['realm'] == realm].variable))
        if realm in coordinate_var_dict:
            realm_vars = realm_vars - set(coordinate_var_dict[realm])
        plot_variables[realm] = realm_vars
    
    return plot_variables

def extract_graph_data_compressed(row, variable_data, plot_variables):
    # Given a row from dataframe, add an entry in the variable_data (dict) for all the variables present in that row 
    
    # each row is assumed to be sorted by start_date and then end_date
    
    start_date = row['start_date']
    end_date = row['end_date']
    freq = row["frequency"]
    realm = row["realm"]
    
    freq_dict = variable_data[realm][freq]

    for var in plot_variables[realm]:
        entry_found = False
        if (var in row['variable']):
            if (freq_dict[var]):

                # Check for duplicate
                if (freq_dict[var][-1][0] == start_date and freq_dict[var][-1][1] == end_date):
                    entry_found = True

                # Start date of new row is same as end date of previous: extend end date of previous to current row end date
                elif (freq_dict[var][-1][1] == start_date):
                    freq_dict[var][-1][1] = end_date
                    entry_found = True
                    
                else:
                    for dates in freq_dict[var]:
                        if (dates[0] <= start_date and dates[1] > start_date):
                            if (dates[1] < end_date):
                                freq_dict[var][-1][1] = end_date
                            entry_found = True
                            break
            
                
            if entry_found == False or (not freq_dict[var]):
                freq_dict[var].append([start_date, end_date])


def generate_catelog_var_timeseries(realm_freq_grp, plot_variables):
    # variable_data contains dict of all the relams which contains the dict of frequency and each frequency contains all 
    # the variables for that realm in the catelog. Each variable in the freq dict is an array with each item is an array 
    # of two elements first is start_date and second is end_date
    variable_data = defaultdict(dict)
    for (realm, freq), group in realm_freq_grp:
        variable_data[realm][freq] = {var: [] for var in plot_variables[realm]}
        group.apply(extract_graph_data_compressed, variable_data=variable_data, plot_variables=plot_variables, axis=1);
    return variable_data


def isVariablePartOfTimeserierGroup(group, var):
    if len(group) == len(var):
        for i in range(len(group)):
            if (var[i][0] != group[i][0] or var[i][1] != group[i][1]):
                return False
        return True
    return False
    

def create_var_timeseries_groups(realm_freq_grp, variable_data):
    # Combine variables which start and end at the same time into groups
    timeseries_grouped_var_data = defaultdict(dict)
    for (realm, f) in realm_freq_grp.groups: 
        group_count = 0
        timeseries_grouped_var_data[realm][f] = {}
        for var in variable_data[realm][f]:
            group_found = False
            for group in timeseries_grouped_var_data[realm][f]:
                if isVariablePartOfTimeserierGroup(timeseries_grouped_var_data[realm][f][group]["timestamp"], variable_data[realm][f][var]):
                    group_found = True
                    timeseries_grouped_var_data[realm][f][group]["variables"].append(var) 
                    break
            if not group_found:
                group_count += 1
                timeseries_grouped_var_data[realm][f]["g_" + str(group_count)]  = {"timestamp": variable_data[realm][f][var], "variables": [var]}
                
    return timeseries_grouped_var_data


def save_var_timeseries_to_json(output_filename, data_catalog, catalog_name, timeseries_grouped_var_data):
    with open(output_filename, "w") as outfile:
        json.dump({
            "name": catalog_name,
            "model_start_date": data_catalog.start_date.iloc[0],
            "model_end_date": data_catalog.sort_values(by=['end_date']).end_date.iloc[-1],
            "realms": timeseries_grouped_var_data
        }, outfile, default=str)
    print("output file created")


def main():
    catalog_name = sys.argv[1]
    coordinate_var_filename = sys.argv[2]
    output_filename = sys.argv[3]
    
    data_catalog = get_catalog(catalog_name)
    coordinate_var_dict = get_coordinate_var(coordinate_var_filename)
    
    # Convert dates to cftime and sort by start_date and end_date
    convert_column_to_cftime(data_catalog, 'start_date')
    convert_column_to_cftime(data_catalog, 'end_date')
    data_catalog.sort_values(by=['start_date', 'end_date'], inplace = True)
    
    realm_list = data_catalog.realm.unique()
    realm_freq_grp = data_catalog.groupby(['realm', 'frequency'], sort=False)

    plot_variables = extract_plot_variables(data_catalog, realm_list, coordinate_var_dict)
    
    variable_data = generate_catelog_var_timeseries(realm_freq_grp, plot_variables)

    timeseries_grouped_var_data = create_var_timeseries_groups(realm_freq_grp, variable_data)

    save_var_timeseries_to_json(output_filename, data_catalog, catalog_name, timeseries_grouped_var_data)

        
if __name__ == "__main__":
    main()