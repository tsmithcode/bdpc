BDPC Dunn Residence client-safe data download

Use the ‘Download verified SQLite’ control in the Client Service OS. The browser reconstructs the multipart transport, verifies the transport and database SHA-256 values from manifest.json, and then saves bdpc_client_os.sqlite.

A direct copy is also available at data/bdpc_client_os.sqlite. Use manifest.json to verify its SHA-256 value and expected table counts. data/schema.sql documents the client-safe schema.
