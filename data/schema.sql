-- BDPC Client Service OS client-safe SQLite schema
-- Revision 2026.07.21.1. Full synchronized data is contained in bdpc_client_os.sqlite and data/project.json.
PRAGMA foreign_keys=ON;
CREATE TABLE project(id TEXT PRIMARY KEY,name TEXT NOT NULL,client TEXT NOT NULL,provider TEXT NOT NULL,phase TEXT NOT NULL,current_gate TEXT NOT NULL,production_status TEXT NOT NULL,priority TEXT NOT NULL,revision TEXT NOT NULL,updated_date TEXT NOT NULL);
CREATE TABLE metrics(key TEXT PRIMARY KEY,value_num REAL,value_text TEXT,unit TEXT);
CREATE TABLE milestones(sequence INTEGER PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,phase TEXT NOT NULL,detail TEXT NOT NULL,completed_date TEXT);
CREATE TABLE file_groups(id INTEGER PRIMARY KEY AUTOINCREMENT,group_name TEXT NOT NULL,extensions TEXT NOT NULL,file_count INTEGER NOT NULL,status TEXT NOT NULL,notes TEXT NOT NULL);
CREATE TABLE standards(id INTEGER PRIMARY KEY AUTOINCREMENT,item TEXT NOT NULL,status TEXT NOT NULL,rule TEXT NOT NULL,basis TEXT NOT NULL);
CREATE TABLE automation(id INTEGER PRIMARY KEY AUTOINCREMENT,item TEXT NOT NULL,status TEXT NOT NULL,tool TEXT NOT NULL,result TEXT NOT NULL,disposition TEXT NOT NULL);
CREATE TABLE deliverables(sequence INTEGER PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,scope TEXT NOT NULL,output_format TEXT NOT NULL,target TEXT NOT NULL);
CREATE TABLE qa_checks(id INTEGER PRIMARY KEY AUTOINCREMENT,check_name TEXT NOT NULL,status TEXT NOT NULL,evidence TEXT NOT NULL);
CREATE TABLE commercial(id INTEGER PRIMARY KEY AUTOINCREMENT,term TEXT NOT NULL,value TEXT NOT NULL,status TEXT NOT NULL);
CREATE TABLE updates(id INTEGER PRIMARY KEY AUTOINCREMENT,update_date TEXT NOT NULL,title TEXT NOT NULL,detail TEXT NOT NULL,status TEXT NOT NULL);
CREATE TABLE runtime_requirements(id INTEGER PRIMARY KEY AUTOINCREMENT,component TEXT NOT NULL,version TEXT NOT NULL,status TEXT NOT NULL,availability TEXT NOT NULL,purpose TEXT NOT NULL);
CREATE TABLE reports(report_id TEXT PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,url TEXT NOT NULL,summary TEXT NOT NULL);
CREATE TABLE scan_sessions(session TEXT PRIMARY KEY,role TEXT NOT NULL,point_count INTEGER NOT NULL,file_size TEXT NOT NULL,raw_extent TEXT NOT NULL,core_extent TEXT NOT NULL,interpretation TEXT NOT NULL);
-- Current row counts: project 1; metrics 11; milestones 20; file_groups 6; standards 11; automation 12; deliverables 3; qa_checks 14; commercial 8; updates 8; runtime_requirements 10; reports 5; scan_sessions 5.