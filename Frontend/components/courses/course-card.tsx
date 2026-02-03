import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import type { CourseStatus } from "@/types";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  code: string;
  name: string;
  teacherName: string;
  status: CourseStatus;
  progress?: number;
  enrollmentCount?: number;
  maxStudents?: number | null;
  href: string;
  className?: string;
  coverImage?: string | null;
}

const statusColors: Record<CourseStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-muted text-muted-foreground",
};



const DEFAULT_COVER_IMAGE = 'https://osccdn.medcom.id/images/content/2022/12/30/3b2b09e5b381b3b59e900bc346f63892.jpg'

function getImageForCourse(id: string): string {
  // Utiliser l'image par défaut
  return DEFAULT_COVER_IMAGE
}

export function CourseCard({
  id,
  code,
  name,
  teacherName,
  status,
  progress,
  enrollmentCount,
  maxStudents,
  href,
  className,
  coverImage,
}: CourseCardProps) {
  const defaultImage = getImageForCourse(id);
  const imageUrl = coverImage || defaultImage;

  return (
    <Link href={href} className="block group">
      <Card
        className={cn(
          "h-full transition-all duration-200 hover:shadow-md hover:border-primary/20 overflow-hidden",
          className,
        )}
      >
        {/* Background image */}
        <div className="h-24 w-full relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-background/80" />
        </div>

        <CardHeader className="pb-2 -mt-12 relative z-10">
          {" "}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-md group-hover:bg-primary/10 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {code}
                </p>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", statusColors[status])}
                >
                  {COURSE_STATUS_LABELS[status]}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            {teacherName}
          </p>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="w-full space-y-2">
            {progress !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            {enrollmentCount !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {enrollmentCount} {maxStudents ? `/ ${maxStudents}` : ""}{" "}
                  étudiant{enrollmentCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
