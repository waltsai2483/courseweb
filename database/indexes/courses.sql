create index courses_name_zh ON courses USING pgroonga(name_zh);
create index courses_teacher_zh ON courses USING pgroonga(teacher_zh);
create index courses_name_en ON courses USING pgroonga(name_en);
create index courses_teacher_en ON courses USING pgroonga(teacher_en);
create index courses_department ON courses USING pgroonga(department);
create index courses_course ON courses USING pgroonga(course);
create index courses_raw_id ON courses USING pgroonga(raw_id);
create index courses_keywords ON course_syllabus USING pgroonga(keywords);

CREATE OR REPLACE FUNCTION search_courses(keyword text)
RETURNS SETOF courses AS
$func$
BEGIN
  IF trim(keyword) = '' THEN
    -- Keyword is blank, return all courses
    RETURN QUERY SELECT * FROM courses;
  ELSE
    -- Keyword is not blank, perform the search
    RETURN QUERY SELECT * FROM courses
      WHERE name_zh &@~ keyword
         OR teacher_zh &@~ keyword
         OR name_en &@~ keyword
         OR teacher_en &@~ keyword
         OR raw_id &@ keyword;
  END IF;
END
$func$
LANGUAGE plpgsql;

DROP FUNCTION search_courses_with_syllabus;

CREATE OR REPLACE FUNCTION search_courses_with_syllabus(keyword text)
RETURNS SETOF courses_with_syllabus AS
$func$
BEGIN
  IF trim(keyword) = '' THEN
    -- Keyword is blank, return all courses
    RETURN QUERY SELECT * FROM courses_with_syllabus;
  ELSE
    -- Keyword is not blank, perform the search
    RETURN QUERY SELECT * FROM courses_with_syllabus
      WHERE name_zh &@~ keyword
         OR teacher_zh &@~ keyword
         OR name_en &@~ keyword
         OR teacher_en &@~ keyword
         OR raw_id &@ keyword;
  END IF;
END
$func$
LANGUAGE plpgsql;