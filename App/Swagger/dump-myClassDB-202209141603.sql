--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2
-- Dumped by pg_dump version 13.2

-- Started on 2022-09-14 16:03:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 15 (class 2615 OID 17288)
-- Name: metadata; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA metadata;


ALTER SCHEMA metadata OWNER TO postgres;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3243 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 10 (class 2615 OID 35553)
-- Name: sequelize_schema; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA sequelize_schema;


ALTER SCHEMA sequelize_schema OWNER TO postgres;

--
-- TOC entry 781 (class 1247 OID 25798)
-- Name: link_type; Type: TYPE; Schema: metadata; Owner: postgres
--

CREATE TYPE metadata.link_type AS ENUM (
    'root',
    'tree',
    'join'
);


ALTER TYPE metadata.link_type OWNER TO postgres;

--
-- TOC entry 732 (class 1247 OID 16504)
-- Name: object_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.object_type AS ENUM (
    'catalog',
    'file'
);


ALTER TYPE public.object_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 231 (class 1259 OID 17321)
-- Name: columns; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.columns (
    id integer NOT NULL,
    name text NOT NULL,
    is_not_null boolean DEFAULT false,
    table_id integer NOT NULL,
    type text NOT NULL
);


ALTER TABLE metadata.columns OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17319)
-- Name: columns_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.columns ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.columns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 246 (class 1259 OID 44270)
-- Name: goods; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.goods (
    title text,
    arrived_at timestamp with time zone,
    count integer,
    id integer NOT NULL
);


ALTER TABLE metadata.goods OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 44268)
-- Name: goods_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.goods ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.goods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 239 (class 1259 OID 25867)
-- Name: query_executors; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.query_executors (
    id integer NOT NULL,
    query_string text,
    title text
);


ALTER TABLE metadata.query_executors OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 25865)
-- Name: query_executors_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.query_executors ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.query_executors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 25499)
-- Name: query_link; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.query_link (
    id integer NOT NULL,
    index integer,
    table_id integer,
    table_key_id integer,
    parent_id integer,
    parent_key_id integer,
    groups json[],
    query_id integer NOT NULL,
    type metadata.link_type
);


ALTER TABLE metadata.query_link OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 25497)
-- Name: query_link_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.query_link ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.query_link_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 25482)
-- Name: query_sql; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.query_sql (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE metadata.query_sql OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 25480)
-- Name: query_sql_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.query_sql ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.query_sql_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 17311)
-- Name: tables; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.tables (
    id integer NOT NULL,
    name text NOT NULL,
    schema text
);


ALTER TABLE metadata.tables OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17309)
-- Name: tables_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.tables ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.tables_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 243 (class 1259 OID 35538)
-- Name: test_child; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.test_child (
    title text,
    to_first_key integer,
    tree_child_key integer,
    tree_parent_key integer,
    id integer NOT NULL
);


ALTER TABLE metadata.test_child OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 35536)
-- Name: test_child_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.test_child ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.test_child_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 241 (class 1259 OID 35528)
-- Name: test_parent; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.test_parent (
    title text,
    first_key integer,
    second_key integer,
    third_key integer,
    id integer NOT NULL
);


ALTER TABLE metadata.test_parent OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 35526)
-- Name: test_parent_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.test_parent ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.test_parent_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 244 (class 1259 OID 35546)
-- Name: tree_243_934_935; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.tree_243_934_935 (
    id integer,
    parent integer,
    layer integer,
    path text
);


ALTER TABLE metadata.tree_243_934_935 OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 25807)
-- Name: tree_links; Type: TABLE; Schema: metadata; Owner: postgres
--

CREATE TABLE metadata.tree_links (
    id integer NOT NULL,
    table_id integer,
    table_key_id integer,
    parent_key_id integer,
    tree_table_name text
);


ALTER TABLE metadata.tree_links OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 25805)
-- Name: tree_links_id_seq; Type: SEQUENCE; Schema: metadata; Owner: postgres
--

ALTER TABLE metadata.tree_links ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME metadata.tree_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 16519)
-- Name: catalogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.catalogs (
    id integer NOT NULL,
    name text
);


ALTER TABLE public.catalogs OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16517)
-- Name: catalogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.catalogs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.catalogs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 211 (class 1259 OID 16433)
-- Name: lesson_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_students (
    lesson_id integer,
    student_id integer,
    visit boolean DEFAULT false
);


ALTER TABLE public.lesson_students OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 16437)
-- Name: lesson_teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_teachers (
    lesson_id integer,
    teacher_id integer
);


ALTER TABLE public.lesson_teachers OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16440)
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    date date NOT NULL,
    title character varying(100),
    status integer DEFAULT 0
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16444)
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lessons_id_seq OWNER TO postgres;

--
-- TOC entry 3244 (class 0 OID 0)
-- Dependencies: 214
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- TOC entry 222 (class 1259 OID 16495)
-- Name: objects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.objects (
    id integer NOT NULL,
    parent_id integer,
    name text,
    type public.object_type,
    owner_id uuid NOT NULL,
    object_id integer
);


ALTER TABLE public.objects OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16493)
-- Name: objects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.objects ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.objects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16487)
-- Name: public.students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."public.students" (
    id integer NOT NULL,
    name character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."public.students" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16485)
-- Name: public.students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."public.students_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."public.students_id_seq" OWNER TO postgres;

--
-- TOC entry 3245 (class 0 OID 0)
-- Dependencies: 219
-- Name: public.students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."public.students_id_seq" OWNED BY public."public.students".id;


--
-- TOC entry 215 (class 1259 OID 16446)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    name character varying(10)
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16449)
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.students_id_seq OWNER TO postgres;

--
-- TOC entry 3246 (class 0 OID 0)
-- Dependencies: 216
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- TOC entry 217 (class 1259 OID 16451)
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    id integer NOT NULL,
    name character varying(10)
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16454)
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teachers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teachers_id_seq OWNER TO postgres;

--
-- TOC entry 3247 (class 0 OID 0)
-- Dependencies: 218
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- TOC entry 227 (class 1259 OID 16547)
-- Name: temp_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.temp_photos (
    user_id uuid,
    photo_url text
);


ALTER TABLE public.temp_photos OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16538)
-- Name: temp_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.temp_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    data jsonb,
    name text
);


ALTER TABLE public.temp_users OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16509)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3028 (class 2604 OID 16456)
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- TOC entry 3031 (class 2604 OID 16490)
-- Name: public.students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."public.students" ALTER COLUMN id SET DEFAULT nextval('public."public.students_id_seq"'::regclass);


--
-- TOC entry 3029 (class 2604 OID 16457)
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- TOC entry 3030 (class 2604 OID 16458)
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- TOC entry 3222 (class 0 OID 17321)
-- Dependencies: 231
-- Data for Name: columns; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.columns (id, name, is_not_null, table_id, type) FROM stdin;
928	title	f	242	text
929	first_key	f	242	integer
930	second_key	f	242	integer
931	third_key	f	242	integer
932	title	f	243	text
933	to_first_key	f	243	integer
934	tree_child_key	f	243	integer
935	tree_parent_key	f	243	integer
936	title	f	244	text
937	arrived_at	f	244	timestamp with time zone
938	count	f	244	integer
\.


--
-- TOC entry 3237 (class 0 OID 44270)
-- Dependencies: 246
-- Data for Name: goods; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.goods (title, arrived_at, count, id) FROM stdin;
\.


--
-- TOC entry 3230 (class 0 OID 25867)
-- Dependencies: 239
-- Data for Name: query_executors; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.query_executors (id, query_string, title) FROM stdin;
39	\n                SELECT table_0.first_key, count(table_0.second_key) AS count_field, table_1.tree_child_key, table_1.tree_parent_key\n                \n                FROM metadata.test_parent AS table_0\n            \n                \n                INNER JOIN metadata.test_child AS table_1 \n                ON table_1.to_first_key = table_0.first_key\n            \n\n                INNER JOIN metadata.tree_243_934_935 AS table_2\n                ON table_2.id = table_1."tree_child_key"\n            \n                WHERE table_0.first_key >= 3 AND table_0.first_key <= 7 AND (table_2.layer = 1 AND table_2.parent = 0 AND table_2.path LIKE '0%')\n                GROUP BY table_0.first_key, table_0.second_key, table_1.to_first_key, table_1.tree_child_key, table_1.tree_parent_key\n                HAVING table_1.to_first_key >= 3 AND table_1.to_first_key <= 7\n                ORDER BY table_0.second_key\n            	test query 2
\.


--
-- TOC entry 3226 (class 0 OID 25499)
-- Dependencies: 235
-- Data for Name: query_link; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.query_link (id, index, table_id, table_key_id, parent_id, parent_key_id, groups, query_id, type) FROM stdin;
308	0	242	929	0	0	{}	148	root
309	1	243	933	242	929	{}	148	join
310	2	243	934	243	935	{}	148	tree
\.


--
-- TOC entry 3224 (class 0 OID 25482)
-- Dependencies: 233
-- Data for Name: query_sql; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.query_sql (id, name) FROM stdin;
148	first_request_join
\.


--
-- TOC entry 3220 (class 0 OID 17311)
-- Dependencies: 229
-- Data for Name: tables; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.tables (id, name, schema) FROM stdin;
242	test_parent	metadata
243	test_child	metadata
244	goods	metadata
\.


--
-- TOC entry 3234 (class 0 OID 35538)
-- Dependencies: 243
-- Data for Name: test_child; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.test_child (title, to_first_key, tree_child_key, tree_parent_key, id) FROM stdin;
title 0	0	0	\N	1
title 1	1	1	\N	2
title 2	2	2	0	3
title 3	3	3	0	4
title 4	4	4	1	5
title 6	6	6	2	7
title 7	7	7	3	8
update title	5	5	1	6
title 9	9	9	8	10
title 8	8	8	3	9
\.


--
-- TOC entry 3232 (class 0 OID 35528)
-- Dependencies: 241
-- Data for Name: test_parent; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.test_parent (title, first_key, second_key, third_key, id) FROM stdin;
title 0	0	\N	\N	1
title 1	1	\N	\N	2
title 2	2	\N	\N	3
title 3	3	\N	\N	4
title 4	4	\N	\N	5
title 5	5	\N	\N	6
title 6	6	\N	\N	7
title 7	7	\N	\N	8
title 8	8	\N	\N	9
title 9	9	\N	\N	10
delete	10	\N	\N	11
\.


--
-- TOC entry 3235 (class 0 OID 35546)
-- Dependencies: 244
-- Data for Name: tree_243_934_935; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.tree_243_934_935 (id, parent, layer, path) FROM stdin;
0	\N	0	\N
1	\N	0	\N
2	0	1	0
3	0	1	0
10	0	1	0
4	1	1	1
5	1	1	1
6	2	2	0.2
7	3	2	0.3
8	3	2	0.3
9	8	3	0.3.8
\.


--
-- TOC entry 3228 (class 0 OID 25807)
-- Dependencies: 237
-- Data for Name: tree_links; Type: TABLE DATA; Schema: metadata; Owner: postgres
--

COPY metadata.tree_links (id, table_id, table_key_id, parent_key_id, tree_table_name) FROM stdin;
66	243	934	935	tree_243_934_935
\.


--
-- TOC entry 3216 (class 0 OID 16519)
-- Dependencies: 225
-- Data for Name: catalogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.catalogs (id, name) FROM stdin;
14	new catalog
15	new catalog
\.


--
-- TOC entry 3202 (class 0 OID 16433)
-- Dependencies: 211
-- Data for Name: lesson_students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_students (lesson_id, student_id, visit) FROM stdin;
1	1	t
1	2	t
1	3	f
2	2	t
2	3	t
4	1	t
4	2	t
4	3	t
4	4	t
5	4	f
5	2	f
6	1	f
6	3	f
7	2	t
7	1	t
8	1	f
8	4	t
8	2	t
9	2	f
10	1	f
10	3	t
\.


--
-- TOC entry 3203 (class 0 OID 16437)
-- Dependencies: 212
-- Data for Name: lesson_teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_teachers (lesson_id, teacher_id) FROM stdin;
1	1
1	3
2	1
2	4
3	3
4	4
6	3
7	1
8	4
8	3
8	2
9	3
10	3
21	1
21	2
22	1
22	2
23	1
23	2
24	1
24	2
25	1
25	2
26	1
26	2
27	1
27	2
28	1
28	2
29	1
29	2
30	1
30	2
31	1
31	2
32	1
32	2
\.


--
-- TOC entry 3204 (class 0 OID 16440)
-- Dependencies: 213
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, date, title, status) FROM stdin;
2	2019-09-02	Red Color	0
5	2019-05-10	Purple Color	0
7	2019-06-17	White Color	0
10	2019-06-24	Brown Color	0
9	2019-06-20	Yellow Color	1
1	2019-09-01	Green Color	1
3	2019-09-03	Orange Color	1
4	2019-09-04	Blue Color	1
6	2019-05-15	Red Color	1
8	2019-06-17	Black Color	1
11	2021-04-12	удалить	0
12	2021-04-14	Blue Ocean	0
13	2021-04-17	Blue Ocean	0
14	2021-04-18	Blue Ocean	0
15	2021-04-14	Blue Ocean	0
16	2021-04-17	Blue Ocean	0
17	2021-04-18	Blue Ocean	0
18	2021-04-14	Blue Ocean	0
19	2021-04-17	Blue Ocean	0
20	2021-04-18	Blue Ocean	0
21	2021-04-14	Blue Ocean	0
22	2021-04-17	Blue Ocean	0
23	2021-04-18	Blue Ocean	0
24	2021-04-14	Blue Ocean	0
25	2021-04-15	Blue Ocean	0
26	2021-04-16	Blue Ocean	0
27	2021-04-14	Blue Ocean	0
28	2021-04-15	Blue Ocean	0
29	2021-04-16	Blue Ocean	0
30	2021-04-14	Blue Ocean	0
31	2021-04-17	Blue Ocean	0
32	2021-04-18	Blue Ocean	0
\.


--
-- TOC entry 3213 (class 0 OID 16495)
-- Dependencies: 222
-- Data for Name: objects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.objects (id, parent_id, name, type, owner_id, object_id) FROM stdin;
9	\N	new catalog	catalog	d991157d-b1e9-401b-99d7-c32c6cd25cba	14
10	\N	new catalog	catalog	d991157d-b1e9-401b-99d7-c32c6cd25cba	15
\.


--
-- TOC entry 3211 (class 0 OID 16487)
-- Dependencies: 220
-- Data for Name: public.students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."public.students" (id, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3206 (class 0 OID 16446)
-- Dependencies: 215
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, name) FROM stdin;
1	Ivan
2	Sergey
3	Maxim
4	Slava
5	Tom
6	Tom
\.


--
-- TOC entry 3208 (class 0 OID 16451)
-- Dependencies: 217
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teachers (id, name) FROM stdin;
1	Sveta
2	Marina
3	Angelina
4	Masha
\.


--
-- TOC entry 3218 (class 0 OID 16547)
-- Dependencies: 227
-- Data for Name: temp_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.temp_photos (user_id, photo_url) FROM stdin;
b35708de-3b84-4ea0-a85a-fc2922ace20f	s3.bucket.foo
d5b6b2b1-b3a5-4f0c-8e5e-38aacb9938d2	s3.bucket.foo
d10280c2-cbfb-4402-84a8-e2174895563f	s3.bucket.foo
d160bbe7-f870-4d4d-9e83-792b54bb34a9	s3.bucket.foo
8a92d39b-47d0-447e-b19a-fc3d27737ffd	s3.bucket.foo
91af3e53-6e79-4929-ac66-884cf84d561f	s3.bucket.foo
dfd74009-85e4-489b-8660-9d671c8b64fa	s3.bucket.foo
08c6fcad-57de-4958-ad41-57c319e9c3f0	s3.bucket.foo
1fa6f1f6-4b35-4b03-94c3-1ae61e6f43a5	s3.bucket.foo
29dc7cf4-1aa7-41e5-ba02-d2745a3f707d	s3.bucket.foo
ea9e9e1e-6563-44e1-8d3d-370b19a1ffa1	s3.bucket.foo
d71de043-3d65-413a-b66b-beb7ab6ff62a	s3.bucket.foo
dd30cec4-2b22-4728-a2e4-20e454e367ff	s3.bucket.foo
85c522ac-9bb0-4b5f-b7ac-cffbb9dd2e0c	s3.bucket.foo
4b9b40c5-3c11-4421-8725-74b7c00ee632	s3.bucket.foo
72153cac-4b3b-4261-90a7-eb1542f07573	s3.bucket.foo
3822edd3-5c09-4ddd-beaf-e164e772fa35	s3.bucket.foo
80bad7f9-d6c8-40d7-8cfd-29ddeacca59a	s3.bucket.foo
a87e00d0-c4d9-4f73-a64d-6b0470417dec	s3.bucket.foo
5495f1d4-0999-4f6c-8c2c-22a6a1081b33	s3.bucket.foo
2684a203-1521-442f-ba01-c01322b8a463	s3.bucket.foo
0e4457b9-5c3f-4009-845b-0402cbd31fd4	s3.bucket.foo
48d51ccf-1826-46f4-9b47-0a8259c93485	s3.bucket.foo
daa948e7-aa6b-4106-b859-75d01b2b9847	s3.bucket.foo
645a94a1-77b2-4798-8910-0cdbd264299c	s3.bucket.foo
51ace570-ca62-4f16-859b-4c7dd3f3d0b4	s3.bucket.foo
6d2203d1-89b3-4c80-82db-a0b274fe9d45	s3.bucket.foo
3a15cc39-bfc9-46bd-95bf-0da42e1300dc	s3.bucket.foo
8d259957-6166-4ca8-890b-2bc29f0ef8f4	s3.bucket.foo
6a45f9c5-acbd-4b5f-bc00-27e208544f58	s3.bucket.foo
1395e5d3-52dc-43c4-9ba3-057cd28c456c	s3.bucket.foo
da00e1eb-cd5c-4aef-87f0-20bbec60b572	s3.bucket.foo
45989f6d-09aa-4ec7-984d-bec4392eee6c	s3.bucket.foo
3ce3b63d-92b4-48d0-8260-162e78583ed5	s3.bucket.foo
82e45732-aa0c-4459-941a-a9ef95d56b4e	s3.bucket.foo
b6fdf388-922c-4dc3-a585-51c8c31f95bd	s3.bucket.foo
0e47a4bf-4f96-43c2-b60f-038484e9567e	s3.bucket.foo
45f3e8f7-f6dc-47b0-901a-f9baa979b836	s3.bucket.foo
113619a4-2b9a-424c-8c7a-d4e6b8511ed8	s3.bucket.foo
70a62a83-501a-462e-b44c-fe7e10eeef34	s3.bucket.foo
bfa2c25a-419e-4c38-8135-8ebbd523b368	s3.bucket.foo
5e7ea62c-94da-44d5-ba5e-060848124ab2	s3.bucket.foo
2f7f0be9-8930-4cb4-924f-e9de299121f9	s3.bucket.foo
83ac5d16-0395-41c4-bf7f-b5334c3b5dcc	s3.bucket.foo
c9546f9f-1d2a-45be-b006-7e334501bded	s3.bucket.foo
8f29fbaa-8380-49c6-8987-855c4fdd379a	s3.bucket.foo
ce150c2d-5fd4-4462-9f37-a934e2f886df	s3.bucket.foo
d349c3ad-86e3-4632-ad9c-9e03c96b7d0a	s3.bucket.foo
54ca647e-97b4-4b31-83de-9ea8c5477b4a	s3.bucket.foo
b6a6e630-4dbf-4fc9-92ee-ee71e88140ba	s3.bucket.foo
76bc6543-b052-4405-b073-6a5b66c9e3ba	s3.bucket.foo
0d4ceb0a-23a6-4025-b266-acfa2591eda9	s3.bucket.foo
c9f7af62-d0c3-4172-9f73-4536fffc7f6f	s3.bucket.foo
2795412e-2707-403c-86c1-38edc363ee0e	s3.bucket.foo
77b5274f-2e47-4c36-96c4-5d62d48f4a22	s3.bucket.foo
3935f60b-5a52-4823-a250-2dd38b717b90	s3.bucket.foo
61c0acd6-4abb-4223-8644-25cd47d3d652	s3.bucket.foo
fca304e2-c4b8-4329-8256-9f071371c48d	s3.bucket.foo
9c8bf962-8f19-44ef-8181-7800a0d9f3bc	s3.bucket.foo
b08d57c5-8232-47a1-8e64-6142bd0a09ca	s3.bucket.foo
1bb678a0-975a-49bf-99d9-1cdd08127920	s3.bucket.foo
3ce4ee3c-bc64-47b0-820c-ba8b96ff0d5c	s3.bucket.foo
9e3bc248-32d8-4d8b-bd0f-07070ae96551	s3.bucket.foo
91e4d8db-8c21-4fe8-8699-ac311ebda100	s3.bucket.foo
3b4f7496-2f53-48c3-97f6-a49e5a980f9b	s3.bucket.foo
c373e125-f53d-497a-b5eb-1c0924808f64	s3.bucket.foo
97c853ba-7cd9-4fe9-a44a-431bbc985545	s3.bucket.foo
8243458b-257c-4f0d-8a0f-ea046285951a	s3.bucket.foo
58ae8222-0ab6-4693-950a-b0bbb93b71af	s3.bucket.foo
62ed61e3-61b8-42fa-8bfd-63bd2a5224d6	s3.bucket.foo
877dc2ac-9d9d-4f5f-8210-91f359552377	s3.bucket.foo
ce57a6bd-328d-4961-a3fa-8cbef9a6cc6d	s3.bucket.foo
6e1236f0-257c-4a39-ae3e-dc02755f8247	s3.bucket.foo
5701254f-4332-42f1-a0fc-b0f71cc3ae48	s3.bucket.foo
ef59c07a-eb03-459a-96c8-3549c302a94b	s3.bucket.foo
3a4a77b2-2894-4125-9ac9-769ca894648d	s3.bucket.foo
92718156-4a54-4302-bbb7-16a926e43c38	s3.bucket.foo
cc908544-6bb3-4192-802d-7174a50f0510	s3.bucket.foo
6cbf6838-7d86-4ccb-8cea-06935fe58fdc	s3.bucket.foo
9e1c42f7-c131-4e7e-922d-a9420627bdf4	s3.bucket.foo
358ca380-833b-4f65-9e20-e613982fb8c6	s3.bucket.foo
d5e67c47-b91e-4b99-9ae5-4356b81a88a0	s3.bucket.foo
88b23878-6510-4790-b322-4c7c9236249c	s3.bucket.foo
c9e7bcba-bc01-4cb2-951c-f07fee65f74c	s3.bucket.foo
bc2931c0-cc9b-4fa6-a8fd-77b695a07e7a	s3.bucket.foo
fe58b03f-c7c9-45f8-b384-2e561c7d1a2d	s3.bucket.foo
07d4138d-9734-432a-83e4-7e00e1a9443c	s3.bucket.foo
8c7fd902-73d4-446c-b53a-9734ff8b8733	s3.bucket.foo
b717a90a-9faa-424c-810b-79e5cf0cb2cc	s3.bucket.foo
4dc839fb-8296-44d2-af90-a89f1d133d83	s3.bucket.foo
7ee43f54-e035-4023-a2a5-7f7d0accc4ea	s3.bucket.foo
6de96caf-5b24-4651-8517-11a1da0465fa	s3.bucket.foo
16d3c762-c7ea-4327-8be9-d5745298247b	s3.bucket.foo
6585b1cf-22dd-4f86-86a9-53469d965877	s3.bucket.foo
9e55c709-1e0c-45f3-8a7a-5ad2bc9c21df	s3.bucket.foo
eaefc0d8-95c4-472f-bb5c-2fe189d6b84a	s3.bucket.foo
9c3a33ec-c1ae-43de-8d7b-c36115e099bb	s3.bucket.foo
7dfa00b1-9193-43cd-8c6b-d757d8b574f5	s3.bucket.foo
606585ac-a243-4c82-be95-a8d4453cbf5b	s3.bucket.foo
140037ea-9d2c-45a3-a790-48894eb98f97	s3.bucket.foo
773bddd9-aed9-47e1-9c6e-bda4a410c1a1	s3.bucket.foo
6831f31f-0b67-4b86-9f2f-26b6c505d7a4	s3.bucket.foo
1c00d48d-bffb-4e42-bb5b-3dd82245432d	s3.bucket.foo
a3bc58db-ad1a-44c5-acb5-3bea3151eb08	s3.bucket.foo
47cf40dc-1ba5-4d58-9fac-3d9bdf2bb67e	s3.bucket.foo
783589ea-4b3b-4a0f-b7ae-a6baa09d0e92	s3.bucket.foo
48f839f5-34df-4f31-9fd8-3281b183298a	s3.bucket.foo
f09d4566-026a-4b5d-aebe-ad49c1e672ec	s3.bucket.foo
da0944db-0176-46ba-b6b3-9eabd627da5f	s3.bucket.foo
28e784d0-e549-4eac-950b-3e5471c735e7	s3.bucket.foo
c328c9d2-8c63-4527-ae66-69568f1a632b	s3.bucket.foo
157e437b-a142-4035-9451-2c89c6833a0f	s3.bucket.foo
b54a56b8-046b-401b-882c-c041b0676bf6	s3.bucket.foo
f0106bfa-d430-4731-9551-9ae58bf1e7b6	s3.bucket.foo
\.


--
-- TOC entry 3217 (class 0 OID 16538)
-- Dependencies: 226
-- Data for Name: temp_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.temp_users (id, data, name) FROM stdin;
b54a56b8-046b-401b-882c-c041b0676bf6	\N	brianc
f0106bfa-d430-4731-9551-9ae58bf1e7b6	\N	brianc
\.


--
-- TOC entry 3214 (class 0 OID 16509)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name) FROM stdin;
075862ed-ff6d-4cb3-8d3b-7396117b4a69	first
d991157d-b1e9-401b-99d7-c32c6cd25cba	guest 1
\.


--
-- TOC entry 3248 (class 0 OID 0)
-- Dependencies: 230
-- Name: columns_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.columns_id_seq', 938, true);


--
-- TOC entry 3249 (class 0 OID 0)
-- Dependencies: 245
-- Name: goods_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.goods_id_seq', 1, false);


--
-- TOC entry 3250 (class 0 OID 0)
-- Dependencies: 238
-- Name: query_executors_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.query_executors_id_seq', 39, true);


--
-- TOC entry 3251 (class 0 OID 0)
-- Dependencies: 234
-- Name: query_link_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.query_link_id_seq', 310, true);


--
-- TOC entry 3252 (class 0 OID 0)
-- Dependencies: 232
-- Name: query_sql_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.query_sql_id_seq', 148, true);


--
-- TOC entry 3253 (class 0 OID 0)
-- Dependencies: 228
-- Name: tables_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.tables_id_seq', 244, true);


--
-- TOC entry 3254 (class 0 OID 0)
-- Dependencies: 242
-- Name: test_child_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.test_child_id_seq', 11, true);


--
-- TOC entry 3255 (class 0 OID 0)
-- Dependencies: 240
-- Name: test_parent_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.test_parent_id_seq', 11, true);


--
-- TOC entry 3256 (class 0 OID 0)
-- Dependencies: 236
-- Name: tree_links_id_seq; Type: SEQUENCE SET; Schema: metadata; Owner: postgres
--

SELECT pg_catalog.setval('metadata.tree_links_id_seq', 66, true);


--
-- TOC entry 3257 (class 0 OID 0)
-- Dependencies: 224
-- Name: catalogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.catalogs_id_seq', 15, true);


--
-- TOC entry 3258 (class 0 OID 0)
-- Dependencies: 214
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_id_seq', 32, true);


--
-- TOC entry 3259 (class 0 OID 0)
-- Dependencies: 221
-- Name: objects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.objects_id_seq', 10, true);


--
-- TOC entry 3260 (class 0 OID 0)
-- Dependencies: 219
-- Name: public.students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."public.students_id_seq"', 1, false);


--
-- TOC entry 3261 (class 0 OID 0)
-- Dependencies: 216
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 6, true);


--
-- TOC entry 3262 (class 0 OID 0)
-- Dependencies: 218
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teachers_id_seq', 4, true);


--
-- TOC entry 3053 (class 2606 OID 17329)
-- Name: columns columns_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.columns
    ADD CONSTRAINT columns_pkey PRIMARY KEY (id);


--
-- TOC entry 3067 (class 2606 OID 44277)
-- Name: goods goods_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.goods
    ADD CONSTRAINT goods_pkey PRIMARY KEY (id);


--
-- TOC entry 3061 (class 2606 OID 25874)
-- Name: query_executors query_executors_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.query_executors
    ADD CONSTRAINT query_executors_pkey PRIMARY KEY (id);


--
-- TOC entry 3057 (class 2606 OID 25506)
-- Name: query_link query_link_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.query_link
    ADD CONSTRAINT query_link_pkey PRIMARY KEY (id);


--
-- TOC entry 3055 (class 2606 OID 25489)
-- Name: query_sql query_sql_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.query_sql
    ADD CONSTRAINT query_sql_pkey PRIMARY KEY (id);


--
-- TOC entry 3051 (class 2606 OID 17318)
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- TOC entry 3065 (class 2606 OID 35545)
-- Name: test_child test_child_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.test_child
    ADD CONSTRAINT test_child_pkey PRIMARY KEY (id);


--
-- TOC entry 3063 (class 2606 OID 35535)
-- Name: test_parent test_parent_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.test_parent
    ADD CONSTRAINT test_parent_pkey PRIMARY KEY (id);


--
-- TOC entry 3059 (class 2606 OID 25814)
-- Name: tree_links tree_links_pkey; Type: CONSTRAINT; Schema: metadata; Owner: postgres
--

ALTER TABLE ONLY metadata.tree_links
    ADD CONSTRAINT tree_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3047 (class 2606 OID 16523)
-- Name: catalogs catalogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT catalogs_pkey PRIMARY KEY (id);


--
-- TOC entry 3035 (class 2606 OID 16460)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- TOC entry 3043 (class 2606 OID 16499)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 3041 (class 2606 OID 16492)
-- Name: public.students public.students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."public.students"
    ADD CONSTRAINT "public.students_pkey" PRIMARY KEY (id);


--
-- TOC entry 3037 (class 2606 OID 16462)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- TOC entry 3039 (class 2606 OID 16464)
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- TOC entry 3049 (class 2606 OID 16546)
-- Name: temp_users temp_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.temp_users
    ADD CONSTRAINT temp_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3045 (class 2606 OID 16513)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3068 (class 2606 OID 16465)
-- Name: lesson_students lesson_students_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_students
    ADD CONSTRAINT lesson_students_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- TOC entry 3069 (class 2606 OID 16470)
-- Name: lesson_students lesson_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_students
    ADD CONSTRAINT lesson_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 3070 (class 2606 OID 16475)
-- Name: lesson_teachers lesson_teachers_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_teachers
    ADD CONSTRAINT lesson_teachers_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- TOC entry 3071 (class 2606 OID 16480)
-- Name: lesson_teachers lesson_teachers_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_teachers
    ADD CONSTRAINT lesson_teachers_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


-- Completed on 2022-09-14 16:03:27

--
-- PostgreSQL database dump complete
--

