import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { fetchAllPages } from "@/lib/api-client";

export interface FacultyOrCourse {
  id: string;
  name: string;
  acronym: string;
}

/**
 * All faculties and courses, for pickers and for resolving ids to names.
 * Shares its cache with the faculty and course admin pages.
 */
export function useFacultyCourseOptions() {
  const facultiesQuery = useQuery<FacultyOrCourse[]>({
    queryKey: ["admin-faculties-all"],
    queryFn: () => fetchAllPages<FacultyOrCourse>("/api/faculties"),
  });
  const coursesQuery = useQuery<FacultyOrCourse[]>({
    queryKey: ["admin-courses-all"],
    queryFn: () => fetchAllPages<FacultyOrCourse>("/api/courses"),
  });

  return React.useMemo(() => {
    const faculties = facultiesQuery.data ?? [];
    const courses = coursesQuery.data ?? [];
    const toMap = (items: FacultyOrCourse[]) =>
      new Map(items.map((item) => [String(item.id), item]));
    return {
      faculties,
      courses,
      facultiesById: toMap(faculties),
      coursesById: toMap(courses),
    };
  }, [facultiesQuery.data, coursesQuery.data]);
}
