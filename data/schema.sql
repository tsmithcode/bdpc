-- BDPC Client Service OS client-safe SQLite schema
PRAGMA foreign_keys=ON;
CREATE TABLE project(id TEXT PRIMARY KEY,name TEXT NOT NULL,client TEXT NOT NULL,provider TEXT NOT NULL,phase TEXT NOT NULL,current_gate TEXT NOT NULL,production_status TEXT NOT NULL,revision TEXT NOT NULL,updated_date TEXT NOT NULL);
CREATE TABLE metrics(key TEXT PRIMARY KEY,value_num REAL,value_text TEXT,unit TEXT);
CREATE TABLE milestones(milestone_id TEXT PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,phase TEXT NOT NULL,evidence TEXT NOT NULL,limitation TEXT NOT NULL);
CREATE TABLE kickoff_gates(sequence INTEGER PRIMARY KEY,gate TEXT NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,requirement TEXT NOT NULL);
CREATE TABLE validation_sessions(session_label TEXT PRIMARY KEY,role TEXT NOT NULL,point_count INTEGER NOT NULL,status TEXT NOT NULL,limitation TEXT NOT NULL);
CREATE TABLE native_overlap_pairs(pair_label TEXT PRIMARY KEY,classification TEXT NOT NULL,transform_applied TEXT NOT NULL,tolerance_adopted TEXT NOT NULL,registration_pass TEXT NOT NULL,overlay TEXT NOT NULL,limitation TEXT NOT NULL);
CREATE TABLE slice_evidence(slice_id TEXT PRIMARY KEY,session_label TEXT NOT NULL,purpose TEXT NOT NULL,height_candidate_m REAL NOT NULL,thickness_candidate_m REAL NOT NULL,point_count INTEGER NOT NULL,status TEXT NOT NULL,image TEXT NOT NULL,limitation TEXT NOT NULL);
CREATE TABLE commercial(id INTEGER PRIMARY KEY AUTOINCREMENT,term TEXT NOT NULL,value TEXT NOT NULL,status TEXT NOT NULL);
CREATE TABLE deliverables(sequence INTEGER PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,scope TEXT NOT NULL,output_format TEXT NOT NULL,target TEXT NOT NULL);
CREATE TABLE reports(report_id TEXT PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,url TEXT NOT NULL,summary TEXT NOT NULL);
