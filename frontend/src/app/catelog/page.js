"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ACCESS_EXPERIMENTS, EXPERIMENT_LIST_DESCRIPTION, EXPERIMENT_TEXT, EXPLORE_TEXT, SEARCH_TEXT } from "../CONSTANTS";
import { fetchExperimentList, fetchSearchResult } from "../services/hasuraAPI";

export default function CatelogList() {
    const [experimentList, setExperimentList] = useState(null)
    const [currentExperimentFocus, setCurrentExperimentFocus] = useState(null)
    const searchInputRef = useRef(null);

    useEffect(() => {
        getExperimentList()
    }, [])

    const handleSearchClick = async () => {
        const response = await fetchSearchResult(searchInputRef.current.value)
        setExperimentList(response.search_experiments)
    };

    const getExperimentList = async () => {
        const response = await fetchExperimentList()
        setExperimentList(response.experiments)
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", padding: 20 }}>
            <p style={{ fontSize: 36, fontWeight: 700 }}>{ACCESS_EXPERIMENTS}</p>
            <p style={{ fontSize: 20 }}>{EXPERIMENT_LIST_DESCRIPTION}</p>

            <div style={{ display: "flex", flexDirection: "row", width: "100%", marginBottom: 40 }}>
                <input style={{ width: "80%", height: 44, padding: 10 }} ref={searchInputRef} placeholder={SEARCH_TEXT} />
                <button style={{ width: "18%", marginLeft: 20, backgroundColor: "blue", color: "white" }} onClick={handleSearchClick}>{SEARCH_TEXT}</button>
            </div>

            <div style={{ display: "flex", width: "100%", flexDirection: "row" }}>
                <div style={{ display: "flex", width: "35%", border: "2px solid black", flexDirection: "column" }}>
                    <div style={{
                        display: "flex",
                        width: "100%",
                        padding: 2,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 20,
                        backgroundColor: "blue"
                    }}>
                        <p style={{ color: "white" }}>{EXPERIMENT_TEXT}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {experimentList && experimentList.map((experiment) => {
                            return (
                                <div onClick={() => {
                                    setCurrentExperimentFocus(experiment)
                                }}
                                    style={{
                                        marginTop: 8,
                                        backgroundColor: currentExperimentFocus === experiment ? "lightblue" : "white",
                                        paddingLeft: 8
                                    }}
                                    key={experiment.name}>
                                    <p>{experiment.name}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {currentExperimentFocus && <div style={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: 20
                }}>
                    <p>{`Model: ${currentExperimentFocus.model}`}</p>
                    <p>{`Description: ${currentExperimentFocus.description}`}</p>
                    <p>{`Keywords: ${currentExperimentFocus.keywords}`}</p>
                </div>}
            </div>
            {currentExperimentFocus && <Link href={`/catelog/${currentExperimentFocus.name}`} style={{
                width: "10%",
                marginTop: 20,
                backgroundColor: "blue",
                height: 50,
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textDecoration: "none"
            }}>
                <p>{EXPLORE_TEXT}</p>
            </Link>}
        </div>
    )
}