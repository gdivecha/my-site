import {
  CloudIcon,
  CodeBracketsIcon,
  DatabaseIcon,
  FilmStripIcon,
  FlaskIcon,
  GlobeIcon,
  PaintbrushIcon,
  ShareNetworkIcon,
  SlidersIcon,
  SparkleIcon,
  WrenchIcon,
} from "@/components/icons";

export const categoryIcons: Record<string, typeof CodeBracketsIcon> = {
  languages: CodeBracketsIcon,
  backend: SlidersIcon,
  frontend: GlobeIcon,
  database: DatabaseIcon,
  cloud: CloudIcon,
  "ai-ml": SparkleIcon,
  testing: FlaskIcon,
  "other-tools": WrenchIcon,
  "video-editing": FilmStripIcon,
  "graphic-design": PaintbrushIcon,
  "social-media": ShareNetworkIcon,
};
