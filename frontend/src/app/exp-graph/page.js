"use client";

import React from 'react';
import dynamic from "next/dynamic";
const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

const EXPERIMENT_TREE = {
  name: 'Exp 1',
  attributes: {
    start_date: '1900',
  },
  children: [
    {
      name: 'Exp 2',
      attributes: {
        start_date: '1910',
      },
      children: [
        {
          name: 'Exp 3',
          attributes: {
            start_date: '1920',
          },
          children: [
            {
              name: 'Exp 4',
              attributes: {
                start_date: '1930',
              }
            },
            {
                name: "Exp 5",
                attributes: {
                    start_date: '1940',
                  }
            }
          ],
        },
        {
          name: 'Exp 6',
          attributes: {
            start_date: '1930',
          },
          children: [
            {
              name: 'Exp 7',
              attributes: {
                start_date: '1950',
              }
            },
          ],
        },
      ],
    },
    {
        name: 'Exp 8',
        attributes: {
          start_date: '1915',
        },
        children: [
          {
            name: 'Exp 9',
            attributes: {
              start_date: '1920',
            },
            children: [
              {
                name: 'Exp 10',
                attributes: {
                  start_date: '1930',
                }
              },
              {
                  name: "Exp 11",
                  attributes: {
                      start_date: '1935',
                    }
              }
            ],
          },
          {
            name: 'Exp 12',
            attributes: {
              start_date: '1930',
            },
            children: [
              {
                name: 'Exp 13',
                attributes: {
                  start_date: '1950',
                }
              },
            ],
          },
          {
            name: 'Exp 14',
            attributes: {
                start_date: '1930'
            }
          },
          {
            name: 'Exp 15',
            attributes: {
                start_date: '1935'
            }
          }
        ],
      },
  ],
};

export default function OrgChartTree() {
  return (
    <div  style={{  
        display:'flex', 
        width: "100vw",
        height: "100vh",
        justifyContent:'center', 
        maxWidth: "100%",
        alignItems: 'center' }}>
            <div  style={{width: '70vw', height: '70vh', border: '1px dotted black'}}>
                <Tree data={EXPERIMENT_TREE} translate={{ x: 500, y: 350 }}/>
            </div>
    </div>
  );
}