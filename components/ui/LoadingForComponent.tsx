import { Spinner } from "@/components/ui/spinner"; //

const LoadingForComponent = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading data...
        </p>
      </div>
    </div>
  );
};

export default LoadingForComponent;
