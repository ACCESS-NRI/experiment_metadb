from mongoengine import ( 
    Document, EmbeddedDocument, StringField, ListField, ReferenceField, IntField, DateTimeField,
    FloatField, EmbeddedDocumentField, DynamicDocument, DateField, DictField, DynamicEmbeddedDocument )

class JobRunTimestamp(Document):
    end_date = DateTimeField()
    run_length_in_days = FloatField()
    run_length_in_seconds = FloatField()
    timestamp_file = StringField()
    start_time = DateTimeField()


class PBSLogs(DynamicDocument):
    pass
    meta = {'collection': 'pbs_logs'}

class JobConfig(DynamicDocument):
    change_in_job = DictField()

class JobEnv(DynamicDocument):
    change_in_job = DictField()

class Namelist(DynamicDocument):
    change_in_job = DictField()

class JobDiag(DynamicDocument):
    name = StringField()
    change_in_job = DictField()

class RoutineTiming(EmbeddedDocument):
    name = StringField()
    grain = FloatField()
    pemax = FloatField()
    pemin = FloatField()
    tavg = FloatField()
    tfrac = FloatField()
    tmax = FloatField()
    tmin = FloatField()
    tstd = FloatField()

class RoutineList(Document):
    routine_timing = ListField(EmbeddedDocumentField(RoutineTiming))

class JobGitDiff(Document):
    changed_files = StringField()
    messages = ListField()

class JobGitLog(Document):
    author = StringField()
    commit = StringField()
    date = DateTimeField()
    message = StringField()

class JobPayu(Document):
    control_dir = StringField()
    current_run = IntField()
    finish_time = DateTimeField()
    job_status = IntField()
    n_runs = IntField()
    path = StringField()
    run_id = StringField()
    start_time = DateTimeField()
    wall_time_in_sec = FloatField()

class JobFilePath(Document):
    archive_output = StringField()
    archive_path = StringField()
    control_path = StringField()
    output_path = StringField()
    restart_path = StringField()
    sync_output_path = StringField()
    sync_path = StringField()
    change_in_job = DictField()

# class Hash(EmbeddedDocument):
#     name = StringField()
#     value = StringField()

# class Manifest(EmbeddedDocument):
#     name = StringField()
#     fullpath = StringField()
#     hashes = ListField(EmbeddedDocumentField(Hash))

class JobManifestExec(DynamicDocument):
    change_in_job = DictField()

class JobManifestInput(DynamicDocument):
    change_in_job = DictField()

class JobManifestRestart(DynamicDocument):
    pass

class PBSJob(Document):
    pbs_job_id = StringField(required = True)
    payu_run_id = StringField()
    timestamp = ReferenceField(JobRunTimestamp)
    pbs_logs = ReferenceField(PBSLogs)
    routine = ReferenceField(RoutineList)
    git_diff = ReferenceField(JobGitDiff)
    git_log = ReferenceField(JobGitLog)
    payu = ReferenceField(JobPayu)
    manifest_restart = ReferenceField(JobManifestRestart)
    file_path = ReferenceField(JobFilePath)
    storage_in_gb = FloatField()
    meta = {'collection': 'pbs_job'}


class RunSummary(Document):
    job_list = ListField(ReferenceField(PBSJob), required = True)
    diag = ReferenceField(JobDiag)
    namelist = ReferenceField(Namelist)
    config = ReferenceField(JobConfig)
    env = ReferenceField(JobEnv)
    manifest_exec = ReferenceField(JobManifestExec)
    manifest_input = ReferenceField(JobManifestInput)
    contact = StringField()
    created = DateField()
    description = StringField()

