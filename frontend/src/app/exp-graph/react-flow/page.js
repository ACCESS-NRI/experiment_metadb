"use client";

import React from 'react';
import ReactFlow, { Controls, Background, BackgroundVariant, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const restart_style = { width: 100, height: 40, backgroundColor: 'black', color: 'white'}
const child_style = {widht: 150, height: 40, backgroundColor: 'lightblue', color: 'black', borderRadius: 20}

const NodeLable = ({name, start_date}) => {
    return (
        <div>
            <p>{name}</p>
            <p>{start_date}</p>
        </div>
    )
}
const HANDLER_POSITION = {sourcePosition: 'right', targetPosition: 'left'}
const NODES = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: "Experiment start: 1900"}, ...HANDLER_POSITION, 
        style: { width: 180, height: 40 } },
    { id: '2', position: { x: 280, y: 0 }, ...HANDLER_POSITION, data: { label: "Restart: 1920"}, 
        style: restart_style },
    { id: '3', position: { x: 480, y: 0 }, ...HANDLER_POSITION, data: { label: "Restart: 1940"}, 
    style: restart_style },
    { id: '4', position: { x: 680, y: 0 }, ...HANDLER_POSITION, data: { label: "Restart: 1960"}, 
    style: restart_style },
    { id: '5', position: { x: 880, y: 0 }, ...HANDLER_POSITION, data: { label: "Restart: 1980"}, 
    style: restart_style },
    { id: '6', position: { x: 1080, y: 0 }, data: { label: "Experiment Ends: 2000"}, ...HANDLER_POSITION, 
    style: { width: 180, height: 40 } },
    { id: '7', position: { x: 250, y: -120 }, data: { label: "Child Exp: 1920"}, 
    style: child_style },
    { id: '8', position: { x: 850, y: -120 }, data: { label: "Child Exp: 1980"}, 
    style: child_style },
    { id: '9', position: { x: 850, y: 120 }, data: { label: "Child Exp: 1980"}, 
    style: child_style },
    { id: '10', position: { x: 850, y: -220 }, data: { label: "Child Exp: 1980"}, 
    style: child_style }
  ];
const EDGES = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
    { id: 'e5-6', source: '5', target: '6' },
    { id: 'e7-2', source: '7', target: '2', animated: true },
    { id: 'e8-5', source: '8', target: '5', animated: true },
    { id: 'e5-9', source: '5', target: '9', animated: true },
    { id: 'e10-5', source: '10', target: '5', animated: true }
];

export default function ExpGraph() {
    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{width: '90vw', height: '90vh', border: '1px dotted black'}}>
                <ReactFlow nodes={NODES} edges={EDGES}>
                    <Controls showInteractive={false} />
                    <Background color="#ccc" variant={BackgroundVariant.Dots} />
                    <MiniMap />
                </ReactFlow>
            </div>
        </div>
    )
}