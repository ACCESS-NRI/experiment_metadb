"use client";

import { useEffect, useState } from "react"
import { getRunSummaryJobData } from "../apis/experiment";
import { END_DATE, MEMEORY_USED_IN_GB, RUN_LENGTH_DAYS, SERVICE_UNITS, STORAGE_IN_GB, WALLTIME_IN_HRS } from "../CONSTANTS";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);
export default function ResourceUtilisation() {

  const [runSummaryJobData, setRunSummaryJobData] = useState(null)
  const [plotData, setPlotData] = useState(null)

  useEffect(() => {
      getRunSummaryData()
  },[])

  useEffect(() => {
    if (!runSummaryJobData) {
      return
    }
    const jobPlotData = { walltime: { data:[], avg:0 }, 
      memoryUsed: { data:[], avg:0 },
      serviceUnits: { data:[], avg:0 },
      storage: { data:[], avg:0 }}
    const years = []

    for (const jobData of runSummaryJobData) {
      let { pbs_logs } = jobData
      pbs_logs = pbs_logs.fields
      const runLengthDays = jobData.timestamp[RUN_LENGTH_DAYS]
      const walltimeYPD = 0.0658 * runLengthDays/pbs_logs[WALLTIME_IN_HRS]
      const memoryPerYear = pbs_logs[MEMEORY_USED_IN_GB] * 365/runLengthDays
      const serviceUnitsPerYear = pbs_logs[SERVICE_UNITS] * 365/runLengthDays
      jobPlotData.walltime.data.push(walltimeYPD)
      jobPlotData.memoryUsed.data.push(memoryPerYear)
      jobPlotData.serviceUnits.data.push(serviceUnitsPerYear)
      jobPlotData.storage.data.push(jobData[STORAGE_IN_GB])
      jobPlotData.walltime.avg += walltimeYPD
      jobPlotData.memoryUsed.avg += memoryPerYear
      jobPlotData.serviceUnits.avg += serviceUnitsPerYear
      jobPlotData.storage.avg += jobData[STORAGE_IN_GB]
      years.push(jobData.timestamp[END_DATE])
    }

    jobPlotData.walltime.avg/=runSummaryJobData.length
    jobPlotData.memoryUsed.avg/=runSummaryJobData.length
    jobPlotData.serviceUnits.avg/=runSummaryJobData.length
    jobPlotData.storage.avg/=runSummaryJobData.length
    setPlotData({
      labels: years,
      datasets: [
        {
          label: "Walltime YPD",
          data: jobPlotData.walltime.data.map(data => data/jobPlotData.walltime.avg),
          borderColor: "rgba(255,0,0)",
          avg: jobPlotData.walltime.avg
        },
        {
          label: "Memory used per year",
          data: jobPlotData.memoryUsed.data.map(data => data/jobPlotData.memoryUsed.avg),
          borderColor: "rgba(0,255,0)",
          avg: jobPlotData.memoryUsed.avg
        },
        {
          label: "Service units per year",
          data: jobPlotData.serviceUnits.data.map(data => data/jobPlotData.serviceUnits.avg),
          borderColor: "rgba(0,0,255)",
          avg: jobPlotData.serviceUnits.avg
        },
        {
          label: "Storage in GB",
          data: jobPlotData.storage.data.map(data => data/jobPlotData.storage.avg),
          borderColor: "rgba(0,0,0)",
          avg: jobPlotData.storage.avg
        }
      ]
    })
  }, [runSummaryJobData])


  const getRunSummaryData = async () => {
    const response = await getRunSummaryJobData("6538f9f6179a2e8d2611d9ec")
    setRunSummaryJobData(response.documents)
  }

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
          }
        }
        
    },
    plugins: {
        legend: {
            display: true
        },
        tooltip: {
          callbacks: {
              label: function(context) {
                  let label = context.dataset.label || '';
                  return `${label}   ${context.formattedValue * context.dataset.avg}`;
              }
          }
      }
    }
  }

  return (
      
    <div style={{display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection:'column', padding: '5%'}}>
      <div class="chart-container" style={{height:"90vh", width:"100%"}}>
        {plotData && <Line data={plotData} options={chartOptions}/>}
      </div>
    </div>
    )
  }
  