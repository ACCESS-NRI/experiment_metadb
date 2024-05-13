"use client";
import {
    Chart as ChartJS,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    PointElement,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    LinearScale,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    PointElement,
);

export default function ExpGraphTimeline() {
    const plotData = {
        datasets: [
            {
                label: 'Experiment',
                data: [{
                    x: new Date(1900, 1, 1),
                    y: 0
                }],
                backgroundColor: 'blue',
                pointRadius: 10,
                pointHoverRadius: 25
            },
            {
                label: 'Restart',
                data: [{
                    x: new Date(1901, 1, 1),
                    y: 0
                }, {
                    x: new Date(1905, 1, 1),
                    y: 0
                }, {
                    x: new Date(1910, 1, 1),
                    y: 0
                }, {
                    x: new Date(1920, 1, 1),
                    y: 0
                },
                {
                    x: new Date(1930, 1, 1),
                    y: 0
                },
                {
                    x: new Date(1940, 1, 1),
                    y: 0
                },
                {
                    x: new Date(1950, 1, 1),
                    y: 0
                }
                ],
                backgroundColor: 'black',
                pointRadius: 5,
                pointHoverRadius: 25
            },
            {
                label: 'Child Experiment',
                data: [{
                    x: new Date(1901, 1, 1),
                    y: 2
                }, {
                    x: new Date(1901, 1, 1),
                    y: -2
                }, {
                    x: new Date(1910, 1, 1),
                    y: 2
                }, {
                    x: new Date(1920, 1, 1),
                    y: 2
                },
                {
                    x: new Date(1930, 1, 1),
                    y: 2
                },
                {
                    x: new Date(1930, 1, 1),
                    y: -2
                },
                {
                    x: new Date(1940, 1, 1),
                    y: 2
                }
                ],
                backgroundColor: 'red',
                pointRadius: 7.5,
                pointHoverRadius: 25
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "time",
                time: {
                  unit: 'year'
                },
                ticks: { 
                    display: true,
                },
                grid: {
                    display: false
                },
            },
            y: {
              grid: {
                display: false
              },
              ticks: { 
                display: false,
              },
              border:{
                display:false
              }
            }
            
        },
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    font: {
                        size: 18
                    }
                }
            },
        //     tooltip: {
        //       callbacks: {
        //           label: function(context) {
        //               return "Label goes here";
        //           }
        //       }
        //   }
        }
      }

      return (
        <div style={{display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection:'column', padding: '5%'}}>
            <div class="chart-container" style={{height:"40vh", width:"100%"}}>
                <Scatter data={plotData} options={chartOptions}/>
            </div>
        </div>
    )
}