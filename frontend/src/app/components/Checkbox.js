
import React from 'react';
import PropTypes from 'prop-types';
import variableNameMapping  from "../catelog/VariableData/variable_full_name_mapping.json"
const Checkbox = ({ label, checked = false, onChange, color, variables }) => (
    <div style={{margin: 10}}>
        <button style={{
            width: 24, 
            height: 24, 
            borderWidth: 1, 
            bodorColor: "blue", 
            backgroundColor: checked ? color : "white",
            marginRight: 10,
            boxShadow: "4px 4px #b5b5b5",
            borderRadius: 4
        }} 
            onClick={() => onChange(label, checked)}/>
        <span>{label}</span>
        {checked && 
            variables.map(variable => 
            <p key={variable} 
                style={{fontSize:11, marginLeft:34, marginTop:3, marginBottom:0}}>
                    <strong>{variable}</strong> : {variableNameMapping[variable]}
            </p>)}
    </div>
  
);

Checkbox.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  color: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  variables: PropTypes.array
}

export default Checkbox;