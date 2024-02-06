from mongoengine import connect
import sys
import yaml
from models.run_summary import *
from utils import *
from collections import defaultdict

# TODO: remove DB uer details to env
DB = "EXPERIMENTS"
SRV = "mongodb+srv://admin:HFcaqAVixm2SLouj@cluster0.byj6hew.mongodb.net/?retryWrites=true&w=majority"

def connect_db():
    return connect(db=DB , host=SRV)

def disconnect_db(db):
    db.close()

def parse_yaml(file):
    with open(file, 'r') as f:
        run_summary = yaml.safe_load(f)
    return run_summary

def save_job_timestamp(data):
    job_run_timestamp = JobRunTimestamp()
    job_run_timestamp.end_date = data.get("Model end time")
    job_run_timestamp.run_length_in_days = data.get("Model run length (days)")
    job_run_timestamp.run_length_in_seconds = data.get("Model run length (s)")
    job_run_timestamp.timestamp_file = data.get("Time stamp file")
    job_run_timestamp.start_time = data.get("Model start time")
    return job_run_timestamp

def save_pbs_logs(data):
    pbs_logs = PBSLogs()
    return save_dynamic_document(data, pbs_logs)

def save_dynamic_document(data, model):
    fields = {}
    for key, value in data.items():
        key = key.replace(".", " _dot_ ") #TODO: Change replace value
        fields[key] = value
    model.fields = fields
    return model

def save_routine_list(data):
    routine_list = RoutineList()
    for key, value in data.items():
        if (value):
            tavg = value.get("tavg")
            if (tavg != 0 and tavg is not None):
                routine_timing = RoutineTiming()
                routine_timing.name = key
                routine_timing.grain = value['grain']
                routine_timing.pemax = value['pemax']
                routine_timing.pemin = value['pemin']
                routine_timing.tavg = value['tavg']
                routine_timing.tfrac = value['tfrac']
                routine_timing.tmax = value['tmax']
                routine_timing.tmin = value['tmin']
                routine_timing.tstd = value['tstd']
                routine_list.routine_timing.append(routine_timing)
    routine_list.save()
    return routine_list


def save_run_common_dynamic_document(data, model, id, is_initial):
    fields = {}
    if is_initial:
        for key, value in data.items():
            key = key.replace(".", " _dot_ ") #TODO: Change replace value
            fields[key] = value
        model.fields = fields
        model.save()
    else:
        changed_values = defaultdict(dict)
        dict_value_change(data, model.fields, changed_values)
        if changed_values:
            model.change_in_job.update({str(id):  changed_values})
    model.save()
    return model


def save_git_diff(data):
    job_git_diff = JobGitDiff()
    job_git_diff.changed_files = data["Changed files"]
    job_git_diff.messages = (data["Messages"])
    return job_git_diff

def save_git_log(data):
    job_git_log = JobGitLog()
    job_git_log.author = data["Author"]
    job_git_log.commit = data["Commit"]
    job_git_log.date = data["Date"]
    job_git_log.message = data["Message"]
    return job_git_log

def save_payu(data):
    job_payu = JobPayu()
    job_payu.control_dir = data.get("PAYU_CONTROL_DIR")
    job_payu.current_run = data.get("PAYU_CURRENT_RUN")
    job_payu.finish_time = data.get("PAYU_FINISH_TIME")
    job_payu.job_status = data.get("PAYU_JOB_STATUS")
    job_payu.n_runs = data.get("PAYU_N_RUNS")
    job_payu.path = data.get("PAYU_PATH")
    job_payu.run_id = data.get("PAYU_RUN_ID")
    job_payu.start_time = data.get("PAYU_START_TIME")
    job_payu.wall_time_in_sec =  float(data.get("PAYU_WALLTIME").split()[0]) if data.get("PAYU_WALLTIME") != None else None
    return job_payu


def save_manifest_restart(data):
    manifest_restart = JobManifestRestart()
    save_dynamic_document(data, manifest_restart)
    manifest_restart.save()
    return manifest_restart


def save_file_path(data, job_file_path, pbs_id, is_initial):
    # if is_initial:
    job_file_path.archive_output = data.get("Archive output path")
    job_file_path.archive_path = data.get("Archive path")
    job_file_path.control_path = data.get("Control path")
    job_file_path.output_path = data.get("Output path")
    job_file_path.restart_path = data.get("Restart path")
    job_file_path.sync_output_path = data.get("Sync path")
    job_file_path.sync_path = data.get("Sync path")
    # else:
    #     changed_values = {}
    #     job_file_path.change_in_job.update({str(pbs_id):  changed_values})

    job_file_path.save()
    return job_file_path

def save_to_db(data):
    run_summary = RunSummary()
    run_summary.save()
    is_intial_state = True
    job_config = JobConfig()
    job_env = JobEnv()
    job_diag = JobDiag()
    manifest_exec = JobManifestExec()
    manifest_input = JobManifestInput()
    namelist = Namelist()
    job_file_path = JobFilePath()
    index = 0
    total_run = len(data)
    for key, value in data.items():
        index = index + 1
        if (index%20 == 0):
            print("Saving data for index: ", index, "/", total_run)
        pbs_job = PBSJob()
        pbs_id = str(key)
        job_run_timestamp = save_job_timestamp(value["MOM_time_stamp.out"])
        pbs_logs = save_pbs_logs(value["PBS log"])
        job_git_diff = save_git_diff(value["git diff"])
        job_git_log = save_git_log(value["git log"])
        job_payu = save_payu(value["job.yaml"])
        manifest_restart = save_manifest_restart(value["manifests/restart.yaml"])
        routine_list = save_routine_list(value["access-om2.out"]) #TODO: ask key name
        job_config = save_run_common_dynamic_document(value["config.yaml"], job_config, pbs_id, is_intial_state)
        job_env = save_run_common_dynamic_document(value["env.yaml"], job_env, pbs_id, is_intial_state) #TODO: handle keys starting with undersocre
        job_diag = save_run_common_dynamic_document(value["ice_diag.d"], job_diag, pbs_id, is_intial_state) #TODO: ask key name
        namelist = save_run_common_dynamic_document(value["namelists"], namelist, pbs_id,  is_intial_state)
        manifest_exec = save_run_common_dynamic_document(value["manifests/exe.yaml"], manifest_exec, pbs_id, is_intial_state)
        manifest_input = save_run_common_dynamic_document(value["manifests/input.yaml"], manifest_input, pbs_id, is_intial_state)
        job_file_path = save_file_path(value["paths"], job_file_path, pbs_id, is_intial_state)
        pbs_job.run_summary = value["metadata.yaml"]["experiment_uuid"]
        pbs_job.pbs_job_id = pbs_id
        pbs_job.timestamp = job_run_timestamp
        pbs_job.pbs_logs = pbs_logs
        pbs_job.routine = routine_list
        pbs_job.git_diff = job_git_diff
        pbs_job.git_log = job_git_log
        pbs_job.payu = job_payu
        pbs_job.manifest_restart = manifest_restart
        pbs_job.file_path = job_file_path
        pbs_job.storage_in_gb = value["storage"]["Output path GiB"]

        pbs_job.save()
        is_intial_state = False

    metadata = data[list(data)[-1]]["metadata.yaml"]
    run_summary.contact = metadata["contact"]
    run_summary.created = metadata["created"]
    run_summary.description = metadata["description"]
    run_summary.experiment_uuid = metadata["experiment_uuid"]
    run_summary.manifest_exec = manifest_exec
    run_summary.manifest_input = manifest_input
    run_summary.diag = job_diag
    run_summary.namelist = namelist
    run_summary.config = job_config
    run_summary.env = job_env
    run_summary.save()

        



def main():
    db = connect_db()
    file = sys.argv[1]
    run_summary = parse_yaml(file)
    save_to_db(run_summary)
    disconnect_db(db)


if __name__ == "__main__":
    main()

