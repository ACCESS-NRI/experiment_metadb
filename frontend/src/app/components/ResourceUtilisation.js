import { useEffect, useRef, useState } from "react"
import { fetchRunSummaryJobData } from "../services/dataAPI";
import { END_DATE, MEMEORY_USED_IN_GB, RUN_LENGTH_DAYS, 
  SERVICE_UNITS, STORAGE_IN_GB, WALLTIME_IN_HRS } from "../CONSTANTS";
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
export default function ResourceUtilisation({experimentUUID, zoomSliderValue}) {

  const [runSummaryJobData, setRunSummaryJobData] = useState(null)
  const [plotData, setPlotData] = useState(null)
  const chartRef = useRef(null);

  useEffect(() => {
    console.log("experiment uuid", experimentUUID)
      getRunSummaryData()
  },[experimentUUID])

  useEffect(() => {
    if (runSummaryJobData)
        handleSliderChange(zoomSliderValue)
}, [zoomSliderValue])

  useEffect(() => {
    if (!runSummaryJobData) {
      return
    }
    const jobPlotData = { walltime: { data:[], avg:0 }, 
      memoryUsed: { data:[], avg:0 },
      serviceUnits: { data:[], avg:0 },
      storage: { data:[], avg:0 }}
    let years = []
    for (const jobData of runSummaryJobData) {
      let { pbs_logs } = jobData
      pbs_logs = pbs_logs.fields
      const runLengthDays = jobData.timestamp[RUN_LENGTH_DAYS]
      const walltimeYPD = 0.0658 * runLengthDays/pbs_logs[WALLTIME_IN_HRS]
      const storagePerYear = jobData[STORAGE_IN_GB] * 365/runLengthDays
      const serviceUnitsPerYear = pbs_logs[SERVICE_UNITS] * 365/runLengthDays
      jobPlotData.walltime.data.push(walltimeYPD)
      jobPlotData.memoryUsed.data.push(pbs_logs[MEMEORY_USED_IN_GB])
      jobPlotData.serviceUnits.data.push(serviceUnitsPerYear)
      jobPlotData.storage.data.push(storagePerYear)
      jobPlotData.walltime.avg += walltimeYPD
      jobPlotData.memoryUsed.avg += pbs_logs[MEMEORY_USED_IN_GB]
      jobPlotData.serviceUnits.avg += serviceUnitsPerYear
      jobPlotData.storage.avg += storagePerYear
      years.push(new Date(jobData.timestamp[END_DATE]))
    }

    jobPlotData.walltime.avg/=runSummaryJobData.length
    jobPlotData.memoryUsed.avg/=runSummaryJobData.length
    jobPlotData.serviceUnits.avg/=runSummaryJobData.length
    jobPlotData.storage.avg/=runSummaryJobData.length
    
    const indices = Array.from(years.keys())
    indices.sort( (a,b) => years[a] - years[b] )
    years = indices.map(i => years[i])
    jobPlotData.walltime.data = indices.map(i => jobPlotData.walltime.data[i])
    jobPlotData.memoryUsed.data = indices.map(i => jobPlotData.memoryUsed.data[i])
    jobPlotData.serviceUnits.data = indices.map(i => jobPlotData.serviceUnits.data[i])
    jobPlotData.storage.data = indices.map(i => jobPlotData.storage.data[i])

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
          label: "Memory used",
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
          label: "Storage in GB per year",
          data: jobPlotData.storage.data.map(data => data/jobPlotData.storage.avg),
          borderColor: "rgba(0,0,0)",
          avg: jobPlotData.storage.avg
        }
      ]
    })
  }, [runSummaryJobData])


  const getRunSummaryData = async () => {
    const response = await fetchRunSummaryJobData(experimentUUID)
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

  const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

  const handleSliderChange = (value) => {
    let start = new Date(plotData.labels[0])
    let end = new Date(plotData.labels[plotData.labels.length - 1])
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    chartRef.current.config._config.options.scales.x.min = addDays(start, Math.floor(diffDays * value[0] / 100))
    chartRef.current.config._config.options.scales.x.max = addDays(start, Math.floor(diffDays * value[1] / 100))
    chartRef.current.update()
}

  return (
      
    <div style={{display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection:'column', padding: '5%'}}>
      <div class="chart-container" style={{height:"40vh", width:"100%"}}>
        {plotData && <Line ref={chartRef} data={plotData} options={chartOptions}/>}
      </div>
    </div>
    )
  }
  