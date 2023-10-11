# Compare how the values present in new_dict different from old_dict 
# with modified keys assuming the datatype of values in both is same
def dict_value_change(new_dict, old_dict, changed_values={}, level=''):
    if isinstance(new_dict, dict):
        if new_dict != old_dict:
            new_dict_keys = set(new_dict.keys())
            old_dict_keys = set(old_dict.keys())
            for k in new_dict_keys:
                modified_key = k.replace(".", " _dot_ ")
                if modified_key in old_dict:
                    dict_value_change(new_dict[k], old_dict[modified_key], changed_values, level + '/' + modified_key)
                else:
                    #print("added", level + '/', k)
                    changed_values["added"][level + '/' + modified_key] = new_dict[k]
            for k in old_dict_keys:
                unmodified_key = k.replace(" _dot_ ", ".")
                if unmodified_key not in new_dict_keys:
                    #print("removed", level + '/', k)
                    changed_values["removed"][level + '/' + k] = old_dict[k]
    else:
        if new_dict != old_dict:
            #print('edited: ', level)
            changed_values["edited"][level] = new_dict
