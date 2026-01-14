import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton={true}
      richColors={false}
      expand={true}
      toastOptions={{
        duration: 5000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          closeButton: "group-[.toast]:bg-muted/80 group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:hover:bg-muted group-[.toast]:transition-colors",
          success: "group-[.toaster]:bg-background group-[.toaster]:border-green-500/30 group-[.toaster]:text-foreground",
          error: "group-[.toaster]:bg-background group-[.toaster]:border-destructive/30 group-[.toaster]:text-foreground",
          info: "group-[.toaster]:bg-background group-[.toaster]:border-primary/30 group-[.toaster]:text-foreground",
          warning: "group-[.toaster]:bg-background group-[.toaster]:border-amber-500/30 group-[.toaster]:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
