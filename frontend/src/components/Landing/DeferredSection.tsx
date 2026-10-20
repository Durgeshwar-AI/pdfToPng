import { useEffect, useRef, useState, type ComponentType } from "react";

type DeferredSectionProps = {
  load: () => Promise<{ default: ComponentType }>;
  placeholderClassName?: string;
};

const DeferredSection = ({
  load,
  placeholderClassName = "min-h-32",
}: DeferredSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStartedLoading = useRef(false);
  const [Section, setSection] = useState<ComponentType | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedLoading.current) {
          hasStartedLoading.current = true;
          observer.disconnect();
          load()
            .then((module) => setSection(() => module.default))
            .catch((error: unknown) => {
              setLoadError(
                error instanceof Error
                  ? error
                  : new Error("Failed to load deferred landing page section"),
              );
            });
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [load]);

  if (loadError) throw loadError;

  return (
    <div
      ref={containerRef}
      className={`deferred-section ${!Section ? placeholderClassName : ""}`}
    >
      {Section ? <Section /> : null}
    </div>
  );
};

export default DeferredSection;
