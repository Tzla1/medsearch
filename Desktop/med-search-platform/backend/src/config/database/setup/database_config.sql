SET GLOBAL innodb_buffer_pool_size = 128M;
SET GLOBAL max_connections = 150;
SET GLOBAL query_cache_size = 32M;
SET GLOBAL query_cache_type = 1;
SET GLOBAL time_zone = 'America/Mexico_City';

SELECT @@version as mysql_version,
       @@innodb_buffer_pool_size as buffer_pool_size,
       @@max_connections as max_connections,
       @@time_zone as timezone;