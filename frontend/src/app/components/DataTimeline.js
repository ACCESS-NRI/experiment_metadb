import { Scatter } from "react-chartjs-2";
import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    CategoryScale,
} from "chart.js";
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
// import Slider, { Range } from 'rc-slider';
// import 'rc-slider/assets/index.css';
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'

ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    annotationPlugin,
    CategoryScale
);
import { useEffect, useRef, useState } from "react"
import Checkbox from "@/app/components/Checkbox";
import { getObjectFromS3 } from "@/utils/s3";
import Switch from "react-switch";

export default function DataTimeline({ catalog, expVars, zoomSliderValue }) {
    let chartOptions

    const [catalogData, setCatalogData] = useState()
    const [plotData, setPlotData] = useState([]);
    const [freqAxis, setFreqAxis] = useState();
    const [freqVariables, setFreqVariable] = useState([])
    const [currentRealm, setCurrentRealm] = useState([])
    const [currentFreq, setCurrentFreq] = useState()
    const [realmFreqs, setRealmFreqs] = useState([])
    const [realms, setRealms] = useState([])
    const [searchVarArray, setSearchVarArray] = useState([])
    const [searchResults, setSearchResults] = useState({})
    const [currentVisiableGroupInfo, setCurrentVisiableGroupInfo] = useState(null)
    const [variableInfo, setVariableInfo] = useState(null)
    const [isANDSearchEnabled, setIsANDSearchEnabled] = useState(false)
    const chartRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        getCatelog()
    }, [])

    useEffect(() => {
        if (expVars) {
            let variableInfo = expVars.reduce((obj, item) => (obj[item.variable.name.toUpperCase()] = {
                "long_name": item.variable.long_name,
                "units": item.variable.units
            }, obj), {});
            setVariableInfo(variableInfo)
        }
    }, [expVars])

    useEffect(() => {
        if (catalogData && chartRef.current)
            handleSliderChange(zoomSliderValue)
    }, [zoomSliderValue])

    useEffect(() => {
        if (catalogData) {
            const realmList = Object.keys(catalogData["realms"])
            setRealms(realmList)
            const currRealm = realmList[0]
            setCurrentRealm(currRealm)
            setRealmFreqs(Object.keys(catalogData["realms"][currRealm]))
        }
    }, [catalogData])

    useEffect(() => {
        plotVariable()
    }, [freqVariables]);

    useEffect(() => {
        plotVariable()
    }, [searchResults])

    useEffect(() => {
        plotFrequency(currentFreq)
    }, [currentFreq]);

    const getCatelog = async () => {
        const catalogData = await getObjectFromS3(`${catalog}.json`)
        setCatalogData(JSON.parse(catalogData))
    }

    const randomColorGenerator = () => {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    };

    const plotFrequency = (freq) => {
        if (currentRealm && catalogData) {
            const realmData = catalogData["realms"]
            setFreqVariable([])
            setCurrentVisiableGroupInfo(null)
            let newFreqVariables = []
            for (const grp in realmData[currentRealm][freq]) {
                if (realmData[currentRealm][freq][grp]['timestamp'].length != 0) {
                    newFreqVariables.push({
                        name: grp,
                        color: randomColorGenerator(),
                        isVisible: true,
                        variables: realmData[currentRealm][freq][grp]["variables"]
                    })
                }
            }
            setFreqVariable(newFreqVariables)
            setFreqAxis({
                grid: {
                    display: false
                },
                type: 'category',
                offset: true,
                labels: newFreqVariables.map(e => e.name),
                ticks: {
                    autoSkip: false,
                    display: false
                },
                position: 'left',
            })
        }
    }

    const plotVariable = () => {
        setPlotData([])
        if (catalogData) {
            const realmData = catalogData["realms"]
            if (Object.keys(searchResults).length !== 0) {
                for (const group in searchResults) {
                    const grp = searchResults[group]
                    for (const dates of realmData[currentRealm][currentFreq][group]["timestamp"]) {
                        setPlotData(data => [...data, {
                            type: 'line',
                            mode: 'horizontal',
                            xMin: new Date(dates[0]),
                            xMax: new Date(dates[1]),
                            yMin: group,
                            yMax: group,
                            borderWidth: 10,
                            borderColor: grp.color,
                            label: {
                                display: false,
                                content: group,
                                backgroundColor: "black",
                                color: "white",
                            },
                            click({ element }, event) {
                                setCurrentVisiableGroupInfo(element.label.options.content)
                            },
                            // enter({element}, event) {
                            //     element.label.options.display = true;
                            //     return true;
                            // },
                            // leave({element}, event) {
                            //     element.label.options.display = false;
                            //     return true;
                            // }
                        }])
                    }
                }
            } else {
                for (const grp of freqVariables) {
                    if (grp.isVisible) {
                        for (const dates of realmData[currentRealm][currentFreq][grp.name]["timestamp"]) {
                            setPlotData(data => [...data, {
                                type: 'line',
                                mode: 'horizontal',
                                xMin: new Date(dates[0]),
                                xMax: new Date(dates[1]),
                                yMin: grp.name,
                                yMax: grp.name,
                                borderWidth: 10,
                                borderColor: grp.color,
                                label: {
                                    display: false,
                                    content: grp.name,
                                    backgroundColor: "black",
                                    color: "white",
                                },
                                click({ element }, event) {
                                    setCurrentVisiableGroupInfo(element.label.options.content)
                                },
                                // enter({element}, event) {
                                //     element.label.options.display = true;
                                //     return true;
                                // },
                                // leave({element}, event) {
                                //     element.label.options.display = false;
                                //     return true;
                                // }
                            }])
                        }
                    }
                }
            }
        }
    }

    const handleCheckboxChange = (label, checked) => {
        const newFreqVariables = freqVariables.map(element => {
            if (element.name === label) {
                return {
                    ...element, isVisible: !checked
                }
            } else {
                return element
            }
        })
        setFreqVariable(newFreqVariables)
    }

    const orSearch = (searchVar, realm, freq, result = {}) => {
        try {
            const realmData = catalogData["realms"]
            for (const group in realmData[realm][freq]) {
                if (realmData[realm][freq][group].timestamp.length === 0) continue;
                for (const variable of realmData[realm][freq][group].variables) {
                    if (variable.includes(searchVar)) {
                        if (result[group]) {
                            result[group].variables.push(variable)
                        } else {
                            result[group] = {}
                            result[group]["color"] = randomColorGenerator()
                            result[group]["variables"] = [variable]
                        }
                    }
                }
            }
            return result
        } catch (error) {
            console.log(error)
        }
    }

    const andSearch = (searchVar, result) => {
        for (const group in result) {
            const newVariableList = []
            for (let index = 0; index < result[group].variables.length; index++) {
                const variable = result[group].variables[index]
                if (variable.includes(searchVar)) {
                    newVariableList.push(variable)
                    //result[group].variables.splice(index, 1)
                }
            }

            if (newVariableList.length === 0) {
                delete result[group]
            } else {
                result[group].variables = newVariableList
            }
        }

        return result
    }

    const handleSearchAdd = (newsearchVarArray, changedsearchVarArray, changedIndexes) => {
        setSearchVarArray(newsearchVarArray);
        let result = {}
        for (const searchVar of newsearchVarArray) {
            if (Object.keys(result).length === 0 || !isANDSearchEnabled) {
                result = orSearch(searchVar, currentRealm, currentFreq, result)
            } else {
                result = andSearch(searchVar, result)
            }
        }
        setSearchResults(result)
    };


    const addDays = (date, days) => {
        let result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    const handleSliderChange = (value) => {
        let start = new Date(catalogData["model_start_date"])
        let end = new Date(catalogData["model_end_date"])
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        chartRef.current.config._config.options.scales.x.min = addDays(start, Math.floor(diffDays * value[0] / 100))
        chartRef.current.config._config.options.scales.x.max = addDays(start, Math.floor(diffDays * value[1] / 100))
        chartRef.current.update()
    }

    const realmChanged = (event) => {
        const realm = event.target.value
        setCurrentRealm(realm)
        setCurrentFreq("none")
        setRealmFreqs(Object.keys(catalogData['realms'][realm]))
        //setSearchResults({})
        setSearchVarArray([])
    }

    const freqChanged = (event) => {
        setSearchVarArray([])
        setCurrentFreq(event.target.value)
    }

    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "time",
                time: {
                },
                ticks: {
                    display: true,
                },
                min: catalogData ? new Date(catalogData["model_start_date"]) : null,
                max: catalogData ? new Date(catalogData["model_end_date"]) : null,
                grid: {
                    display: false
                },
            },
            freqAxis
        },
        plugins: {
            legend: {
                display: false
            },
            annotation: {
                annotations: plotData,
            }
        }

    }

    const renderCheckbox = (name, color, variables, isVisible, handleCheckboxChange, index) => {
        return (
            <Checkbox label={name}
                key={name + " " + index}
                color={color}
                variables={variables}
                checked={isVisible} onChange={handleCheckboxChange} />
        )
    }

    const renderGroupInfo = () => {
        try {
            
            const group = Object.keys(searchResults).length === 0 ? freqVariables.find(
                group => group.name === currentVisiableGroupInfo) :
                searchResults[currentVisiableGroupInfo]
            
            return (
                <div style={{ display: "flex", flexDirection: "row", marginTop: 20 }}>
                    <div style={{ backgroundColor: group.color, height: "auto", width: 20 }}
                        onClick={() => { setCurrentVisiableGroupInfo(null) }} />
                    <div>
                        {
                            group.variables.map(variable => {
                                variable = variable.toUpperCase()
                                return (<p key={variable}
                                    style={{ fontSize: 18, marginLeft: 34, marginTop: 3, marginBottom: 0 }}>
                                    <strong>{variable}</strong>
                                    {` :\t
                                            ${variableInfo[variable].long_name} \t (${variableInfo[variable].units})`}
                                </p>)
                            })
                        }
                    </div>
                </div>

            )
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div style={{ display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '5%' }}>
            <p style={{ marginBottom: '30px', fontSize: 22, fontWeight: 700 }}>{catalogData ? catalogData["name"] : ""}</p>
            <select value={currentRealm || "none"} onChange={realmChanged}>
                <option value={"none"} selected disabled hidden>Select a realm</option>
                {realms.map(realm => <option key={realm} value={realm}>{realm}</option>)}
            </select>
            <select value={currentFreq || "none"} onChange={freqChanged}>
                <option value={"none"} selected disabled hidden>Select a frequency</option>
                {realmFreqs.map(freq => <option key={freq} value={freq}>{freq}</option>)}
            </select>
            <TagsInput
                disabled={!currentFreq}
                inputProps={{
                    className: 'react-tagsinput-input',
                    placeholder: 'Search'
                }}
                ref={searchRef}
                value={searchVarArray}
                onChange={handleSearchAdd} />
            <div style={{display: "flex", alignItems: "center", width: 130, justifyContent:"space-between"}}>
                <p>OR</p> 
                <Switch onChange={(checked) => {
                    setIsANDSearchEnabled(checked)
                }}
                offColor={"#00F"}
                checked={isANDSearchEnabled} uncheckedIcon={null} checkedIcon={null}/>
                <p>AND</p>
            </div>
            <div class="chart-container" style={{ height: "30vh", width: "100%" }}>
                {(currentFreq && currentFreq != 'none') && <Scatter ref={chartRef} options={chartOptions} data={{ datasets: [] }} />}
                {/* {(currentFreq && currentFreq != 'none') && <Slider range
                    onChange={handleSliderChange}
                    defaultValue={[0, 100]}
                />} */}
            </div>
            <div style={{
                marginTop: "40px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "100%",
            }}>
                {Object.keys(searchResults).length === 0 ?
                    freqVariables.map((grp, i) =>
                        renderCheckbox(grp.name, grp.color, grp.variables, grp.isVisible, handleCheckboxChange, i)) :
                    Object.keys(searchResults).map((grp, i) => {
                        return (renderCheckbox(
                            grp,
                            searchResults[grp].color,
                            searchResults[grp].variables,
                            true,
                            () => { }, i
                        ))
                    })
                }
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                {currentVisiableGroupInfo && renderGroupInfo()}
            </div>
        </div>
    )
}
