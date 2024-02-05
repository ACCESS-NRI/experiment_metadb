"use client";

import { DATA_TIMELINE_DESCRIPTION } from "@/app/CONSTANTS";
import DataTimeline from "@/app/components/DataTimeline";
import ResourceUtilisation from "@/app/components/ResourceUtilisation";
import { fetchExperimentData } from "@/app/services/hasuraAPI";
import Slider from "rc-slider";
import 'rc-slider/assets/index.css';
import { useEffect, useState } from "react";
import Collapsible from 'react-collapsible';


const TriggerComponent = ({ text }) => {
    return (
        <div style={{
            //width: "100%", 
            height: 68, 
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "blue",
            paddingLeft: 20
        }}>
            <p style={{color: "white", fontSize: 28}}>
                {text}
            </p>
        </div>
    )
}

const collaspableContainerProps = {
    style: {
        marginTop: 20
    }
}

export default function Experiment({ params }) {
    const [experimentData, setExperimentData] = useState(null)
    const [zoomSliderValue, setZoomSliderValue] = useState([0, 100])

    useEffect(() => {
        getExperimentData(params.catelog)
    }, [])

    const getExperimentData = async (catalog) => {
        const data = await fetchExperimentData(catalog)
        setExperimentData(data.experiments[0])
    }

    const handleSliderChange = (value) => {
        setZoomSliderValue(value)
    }

    return (
        <div style={{ display: "flex", padding: "1%", flexDirection: "column"}}>
            <Collapsible
                containerElementProps={collaspableContainerProps}
                open
                trigger={<TriggerComponent text="Metadata" />}>
                    {/* TODO: Remove iteration */}
                    {experimentData && Object.keys(experimentData).map(field => {
                        if (field != "expVars")
                        return (
                            <p style={{fontSize: 24, fontWeight:700}}>{`${field}:   `} 
                                <span style={{fontSize: 18, fontWeight: 400}}>
                                    {experimentData[field]}
                                </span></p>
                        )
                    })}
            </Collapsible>

            <Collapsible
                containerElementProps={collaspableContainerProps}
                open
                trigger={<TriggerComponent text="Data Timeline" />}>
                    <div>
                        <p style={{ fontSize: 24, fontWeight: 700 }}>{DATA_TIMELINE_DESCRIPTION}</p>
                        <DataTimeline catalog={params.catelog} zoomSliderValue={zoomSliderValue}
                            expVars={experimentData ? experimentData.expVars : null}/>
                    </div>
                    
            </Collapsible>

            {experimentData && <Collapsible
                containerElementProps={collaspableContainerProps}
                open
                trigger={<TriggerComponent text="Resource Use" />}>
                    <ResourceUtilisation zoomSliderValue={zoomSliderValue} experimentUUID={ 
                        experimentData.experiment_uuid}/>
            </Collapsible>}
            <div style={{ marginTop: 20 }}>
                <Slider range
                    onChange={handleSliderChange}
                    defaultValue={[0, 100]}/>
            </div>
        </div>
    )
}