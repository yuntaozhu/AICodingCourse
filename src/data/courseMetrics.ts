import { COURSE_LABS, COURSE_MODULES, COURSE_TRACKS } from "./courseCurriculum.ts";
import { COURSE_MODULE_RECORDS } from "./courseUnitsModel.ts";

export interface PublicCourseMetrics {
  moduleCount: number;
  labCount: number;
  trackCount: number;
  unitCount: number;
  slideCount: number;
  quizQuestionCount: number;
}

export function getPublicCourseMetrics(): PublicCourseMetrics {
  const unitCount = COURSE_MODULE_RECORDS.reduce((sum, mod) => sum + mod.units.length, 0);
  const slideCount = COURSE_MODULES.reduce((sum, mod) => sum + mod.slideCount, 0);
  const quizQuestionCount = COURSE_MODULES.reduce((sum, mod) => sum + mod.quizIds.length, 0);

  return {
    moduleCount: COURSE_MODULES.length,
    labCount: COURSE_LABS.length,
    trackCount: COURSE_TRACKS.length,
    unitCount,
    slideCount,
    quizQuestionCount,
  };
}

export function getFreeTrialModulePreview() {
  const m1Meta = COURSE_MODULES.find((m) => m.id === "m1") ?? COURSE_MODULES[0];
  const m1Record = COURSE_MODULE_RECORDS.find((m) => m.id === "m1") ?? COURSE_MODULE_RECORDS[0];

  return {
    moduleMeta: m1Meta,
    units: m1Record.units.map((u) => ({
      id: u.id,
      title: u.title,
      type: u.type,
      estimatedMinutes: u.estimatedMinutes,
      learningObjective: u.learningObjective,
      artifactTitle: u.learnerArtifact?.title,
      artifactFilename: u.learnerArtifact?.filename,
    })),
  };
}
