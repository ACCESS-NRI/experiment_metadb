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
        { headerName: 'Name', field: 'spec', 
            valueFormatter: (p) => p.value.split("@")[0], flex: .5 },
        { headerName: 'Version', field: 'spec', cellRenderer: (p) => <Link href={p.data.release_url}>{p.value.split("git.")[1]}</Link>, flex: .5  },
        { headerName: 'Spack Hash', field: 'spack_hash' },
        { headerName: 'Spack Version', field: 'spack_version' },
        { headerName: 'Created At', field: 'created_at', valueFormatter: p => new Date(p.value).toLocaleString() },
        { headerName: 'Model Components', cellRenderer: "agGroupCellRenderer", flex:.5 },
    ], []);
    const detailCellRendererParams = useMemo(() => {
        return ({
            detailGridOptions: {
                columnDefs: [
                    { headerName: 'Install Path', field: 'component_build_info.install_path', flex: 3 },
                    { headerName: 'Spec', field: 'component_build_info.spec', flex: 1 },
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