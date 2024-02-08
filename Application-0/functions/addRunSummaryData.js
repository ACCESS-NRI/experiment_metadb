exports = async function({ query, headers, body}, response){
  
    const {data, expUUID} = JSON.parse(body.text());
    
    if(body === undefined) {
      throw new Error(`Request body was not defined.`)
    }
    
    
    const serviceName = "mongodb-atlas"
    const dbName = "test"
    const client = context.services.get(serviceName)
    const db = client.db(dbName)
    const session = client.startSession();
  
    const getJobTimestamp = (data) => {
      job_run_timestamp = {}
      job_run_timestamp.end_date = data["Model end time"]
      job_run_timestamp.run_length_in_days = data["Model run length (days)"]
      job_run_timestamp.run_length_in_seconds = data["Model run length (s)"]
      job_run_timestamp.timestamp_file = data["Time stamp file"]
      job_run_timestamp.start_time = data["Model start time"]
      return job_run_timestamp
    }
    
    const getFields = (data) => {
      fields = {}
      for (let [key, value] of Object.entries(data)){
          key = key.replace(".", " _dot_ ")
          fields[key] = value
      }
      return {fields}
    }
  
    const getGitDiff = (data) => {
      job_git_diff = {}
      job_git_diff.changed_files = data["Changed files"]
      job_git_diff.messages = data["Messages"]
      return job_git_diff
    }
  
    const getGitLog = (data) => {
      job_git_log = {}
      job_git_log.author = data["Author"]
      job_git_log.commit = data["Commit"]
      job_git_log.date = data["Date"]
      job_git_log.message = data["Message"]
      return job_git_log
    }
  
    const getJobPayu = (data) => {
      job_payu = {}
      job_payu.control_dir = data["PAYU_CONTROL_DIR"]
      job_payu.current_run = data["PAYU_CURRENT_RUN"]
      job_payu.finish_time = data["PAYU_FINISH_TIME"]
      job_payu.job_status = data["PAYU_JOB_STATUS"]
      job_payu.n_runs = data["PAYU_N_RUNS"]
      job_payu.path = data["PAYU_PATH"]
      job_payu.run_id = data["PAYU_RUN_ID"]
      job_payu.start_time = data["PAYU_START_TIME"]
      job_payu.wall_time_in_sec =  parseFloat(data["PAYU_WALLTIME"].split()[0]) ? data["PAYU_WALLTIME"] : null
      return job_payu
    }
  
    const getRoutineList = (data) => {
        routine_list = {routine_timing: []}
        for (const [key, value] of Object.entries(data)) {
          if (value) {
              tavg = value["tavg"]
              if (tavg && tavg != 0) {
                  routine_timing = {}
                  routine_timing.name = key
                  routine_timing.grain = value['grain']
                  routine_timing.pemax = value['pemax']
                  routine_timing.pemin = value['pemin']
                  routine_timing.tavg = value['tavg']
                  routine_timing.tfrac = value['tfrac']
                  routine_timing.tmax = value['tmax']
                  routine_timing.tmin = value['tmin']
                  routine_timing.tstd = value['tstd']
                  routine_list.routine_timing.push(routine_timing)
              }
          }
      }
      return routine_list
    }
  
    const getFilePath = (data) => {
      job_file_path = {}
      job_file_path.archive_output = data["Archive output path"]
      job_file_path.archive_path = data["Archive path"]
      job_file_path.control_path = data["Control path"]
      job_file_path.output_path = data["Output path"]
      job_file_path.restart_path = data["Restart path"]
      job_file_path.sync_output_path = data["Sync path"]
      job_file_path.sync_path = data["Sync path"]
      return job_file_path
    }
  
    const getChangedValues = (newData, prevData) => {
        if (!newData || !prevData)
            return null
        changedValues = {}
        dictValueChanged(newData, prevData, changedValues)
        if (Object.keys(changedValues).length === 0)
            return null
        return changedValues
    }

    const dictValueChanged = (new_dict, old_dict, changed_values={}, level='') => {
        if (new_dict instanceof Object) {
            if (JSON.stringify(new_dict) !== JSON.stringify(old_dict)) {
              const new_dict_keys = Object.keys(new_dict);
              const old_dict_keys = Object.keys(old_dict);
              for (let k of new_dict_keys) {
                const modified_key = k.replace('.', ' _dot_ ');
                if (old_dict_keys.includes(modified_key)) {
                    dictValueChanged(new_dict[k], old_dict[modified_key], changed_values, level + '/' + modified_key);
                } else {
                  	if (changed_values['added'] === undefined)
                      changed_values['added'] = {}
                    changed_values['added'][level + '/' + modified_key] = new_dict[k];
                }
              }   
              for (let k of old_dict_keys) {
                const unmodified_key = k.replace(' _dot_ ', '.');
                                  console.log(unmodified_key)
                if (!new_dict_keys.includes(unmodified_key)) {
                    if (changed_values['removed'] === undefined)
                      changed_values['removed'] = {}
                    changed_values['removed'][level + '/' + k] = old_dict[k];
                }
              }
            }
          } else {
            if (new_dict !== old_dict) {
              if (changed_values['edited'] === undefined)
               	changed_values['edited'] = {}
              changed_values["edited"][level] = new_dict;
            }
          }
    }
  
   try {
     await session.withTransaction(async () => {
  
      const runSummary = db.collection("run_summary")
  
      const experiment = await runSummary.findOne({
          expUUID
      })
  
       for (let pbs_id in data) {
          pbs_job_data = {
              run_summary: expUUID,
              pbs_job_id: pbs_id
          }
          const job_data = data[pbs_id]
          pbs_job_data.timestamp = getJobTimestamp(job_data["MOM_time_stamp.out"])
          pbs_job_data.pbs_logs = getFields(job_data["PBS log"])
          pbs_job_data.git_diff = getGitDiff(job_data["git diff"])
          pbs_job_data.git_log = getGitLog(job_data["git log"])
          pbs_job_data.payu = getJobPayu(job_data["job.yaml"])
          pbs_job_data.storage_in_gb = job_data["storage"]["Output path GiB"]
          
          const manifestRestart = await db.collection("job_manifest_restart").insertOne(
              getFields(job_data["manifests/restart.yaml"]), { session })
          const routineList = await db.collection("routine_list").insertOne(
            getRoutineList(job_data["access-om2.out"]), { session })        
          const filePath = await db.collection("job_file_path").insertOne(
            getFilePath(job_data["paths"]), { session })
        
          pbs_job_data.manifest_restart = manifestRestart.insertedId
          pbs_job_data.file_path = routineList.insertedId
          pbs_job_data.routine = filePath.insertedId
          db.collection("pbs_job").insertOne(pbs_job_data, { session })
          
          if (experiment) {
              const config = await db.collection("job_config").findOne({ "_id": experiment.config})
              const diag = await db.collection("job_diag").findOne({"_id": experiment.diag})
              const env = await db.collection("job_env").findOne({"_id": experiment.env})
              const manifestExec = await db.collection("job_manifest_exec").findOne({"_id": experiment.manifest_exec})
              const manifestInput = await db.collection("job_manifest_input").findOne({"_id": experiment.manifest_input})
              const namelist = await db.collection("namelist").findOne({"_id": experiment.namelist})
              
              const config_change = getChangedValues(getFields(job_data["config.yaml"]).fields, config.fields)
              const diag_change = getChangedValues(getFields(job_data["ice_diag.d"]), diag.fields)
              const env_change = getChangedValues(getFields(job_data["env.yaml"]), env.fields)
              const manifestExecChange = getChangedValues(getFields(job_data["manifests/exe.yaml"]), manifestExec.fields)
              const manifestInputChange = getChangedValues(getFields(job_data["manifests/input.yaml"]), manifestInput.fields)
              const namelist_change = getChangedValues(getFields(job_data["namelists"]), namelist.fields)

              const fieldToUpdate = "change_in_job." + pbs_id 
              if (config_change)
                await db.collection("job_config").updateOne({"_id": experiment.config}, {"$set": {[fieldToUpdate]: config_change}}, { session })
              if (diag_change)
                await db.collection("job_diag").updateOne({"_id": experiment.diag},{"$set": {[fieldToUpdate]: diag_change}}, { session })
              if (env_change)
                await db.collection("job_env").updateOne({"_id": experiment.env},{"$set": {[fieldToUpdate]: env_change}}, { session })
              if (manifestExecChange)
                await db.collection("job_manifest_exec").updateOne({"_id": experiment.manifest_exec},{"$set": {[fieldToUpdate]: manifestExecChange}}, { session })
              if (manifestInputChange)
                await db.collection("job_manifest_input").updateOne({"_id": experiment.manifest_input},{"$set": {[fieldToUpdate]: manifestInputChange}}, { session })
              if (namelist_change)
                await db.collection("namelist").updateOne({"_id": experiment.namelist},{"$set": {[fieldToUpdate]: namelist_change}}, { session })
                
              response.setStatusCode(200);
              response.setBody("experiment data added");
  
          } else {
              config = (await db.collection("job_config").insertOne(getFields(job_data["config.yaml"]), 
                { session })).insertedId
              diag = (await db.collection("job_diag").insertOne(getFields(job_data["ice_diag.d"]),
                { session })).insertedId
              env = (await db.collection("job_env").insertOne(getFields(job_data["env.yaml"]),
                { session })).insertedId
              manifestExec = (await db.collection("job_manifest_exec")
                .insertOne(getFields(job_data["manifests/exe.yaml"]), { session })).insertedId
              manifestInput = (await db.collection("job_manifest_input")
                .insertOne(getFields(job_data["manifests/input.yaml"]), { session })).insertedId
              namelist = (await db.collection("namelist").insertOne(getFields(job_data["namelists"]),
                { session })).insertedId

              await db.collection("run_summary").insertOne({
                expUUID,
                config, diag, env, namelist,
                manifest_exec: manifestExec,
                manifest_input: manifestInput,
                contact: job_data["metadata.yaml"]["contact"],
                created: job_data["metadata.yaml"]["created"],
                description: job_data["metadata.yaml"]["description"],
              }, { session })
              response.setStatusCode(200);
              response.setBody("new experiment created");
          }
  
       }
     })
   }  catch (err) {
      console.log(err)
      await session.abortTransaction();
      response.setStatusCode(400);
      response.setBody(err.message);
    } finally {
      await session.endSession();
    }
  };