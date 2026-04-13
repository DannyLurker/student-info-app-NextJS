import { Spinner } from "@/components/ui/spinner";

const LoadingForComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Spinner className="h-10 w-10 text-primary animate-spin" />
      <p className="text-sm font-medium text-muted-foreground">
        Loading data...
      </p>
    </div>
  );
};

export default LoadingForComponent;
