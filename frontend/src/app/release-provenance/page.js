"use client";

import { useEffect, useMemo, useState } from "react"
import { fetchModelBuildList } from "../services/hasuraAPI"
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Link from "next/link";



export default function ReleaseProvenance () {
    const [modelList, setModelList] = useState([])
    const modelColDefs = useMemo(() => [
        { headerName: 'Name', valueGetter: (p) => p.data.spec.split("@")[0]},
        { headerName: 'Version', 
            valueGetter: (p) => p.data.spec.split("=")[1],
            cellRenderer: (p) => <Link target="_blank" href={p.data.release_url}>{p.value}</Link> },
        { headerName: 'Status', valueGetter: (p) => p.data.status },
        { headerName: 'Spack Hash', valueGetter: (p) => p.data.spack_hash.substring(0,8) },
        { headerName: 'Spack Version', valueGetter: (p) => p.data.spack_version.substring(0,8) },
        { headerName: 'Created At', valueGetter: p => new Date(p.data.created_at).toLocaleString(), filter: false,
    },
        { headerName: 'Model Components', cellRenderer: "agGroupCellRenderer", flex:.5, filter: false },
    ], []);
    const detailCellRendererParams = useMemo(() => {
        return ({
            detailGridOptions: {
                columnDefs: [
                    { headerName: 'Name',  flex: 1,
                        valueGetter: (p) => p.data.component_build_info.spec.split("@")[0] },
                    { headerName: 'Version',  flex: 1,
                        valueGetter: (p) => p.data.component_build_info.spec.split("=")[1],
                        cellRenderer: (p) => 
                                    <Link target="_blank"
                                        href={`https://github.com/ACCESS-NRI/${p.data.component_build_info.spec.split("@")[0]}/releases/tag/${p.value}`}>
                                        {p.value}
                                    </Link>},
                    { headerName: 'Install Path', field: 'component_build_info.install_path', flex: 7 },
                    { headerName: 'Spack Hash', field: 'component_build_info.spack_hash', flex: 1 }
                ]
            },
        
            getDetailRowData: params => {
                return params.successCallback(params.data.model_components);
            }
        })
    },[]);



    useEffect(() => {
        getModelBuildList()
    }, [])

    const getModelBuildList = async () => {
        const response = await fetchModelBuildList()
        setModelList(response.model_build)
    }

    return (
        <div style={{padding: 40}}>
            <div className="ag-theme-quartz">
                <AgGridReact
                    defaultColDef={{
                        flex: 1,
                        minWidth: 150,
                        sortable: true,
                        filter: true,
                        floatingFilter: true,
                        wrapText: true,
                        autoHeight: true,
                    }}
                    masterDetail={true}
                    detailCellRendererParams={detailCellRendererParams}
                    domLayout="autoHeight"
                    rowSelection={"single"}
                    columnDefs={modelColDefs} 
                    rowData={modelList}/>
            </div>
        </div>

    )

}