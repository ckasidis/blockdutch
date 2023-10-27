export function PageHeading({
  primaryAction,
  secondaryAction,
  children,
}: {
  children: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-foreground text-2xl font-bold leading-7 sm:truncate sm:text-3xl sm:tracking-tight">
          {children}
        </h2>
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="mt-4 flex flex-shrink-0 gap-2 md:ml-4 md:mt-0">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
}
