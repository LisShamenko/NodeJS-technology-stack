-- PGADMIN

CREATE TABLE metadata.new_table
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT new_table_pkey PRIMARY KEY (id),
	field_1 integer,
    field_2 text, -- COLLATE pg_catalog."default"
    field_3 uuid, -- NOT NULL
	field_4 timestamp with time zone,
	field_5 timestamp without time zone
)

-- DBEAVER

-- metadata.new_table definition
-- Drop table
-- DROP TABLE metadata.new_table;
CREATE TABLE metadata.new_table (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	field_1 int4 NULL,
	field_2 text NULL,
	field_3 uuid NULL,
	field_4 timestamptz NULL,
	field_5 timestamp NULL,
	field_array_json _json NULL,
	CONSTRAINT new_table_pkey PRIMARY KEY (id)
);