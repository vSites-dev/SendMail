"use client";

import * as React from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useControllableState } from "@/lib/hooks/use-controllable-state";
import { Controller, useController, Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

interface ImageUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  control: Control<TFieldValues>;
  apiEndpoint?: string;
  label?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  onUploadComplete?: (url: string) => void;
}

export function ImageUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  apiEndpoint = "http://localhost:8080/images/upload",
  label = "Kép feltöltése",
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
  className,
  onUploadComplete,
}: ImageUploadProps<TFieldValues, TName>) {
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const { field } = useController({ name, control });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          setProgress(percentage);
        }
      });

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            const imageUrl = response.data.url;

            field.onChange(imageUrl);

            if (onUploadComplete) {
              onUploadComplete(imageUrl);
            }

            toast.success("A kép sikeresen feltöltve");
          } else {
            toast.error("Nem sikerült feltölteni a képet");
          }
          setIsUploading(false);
        }
      };

      xhr.open("POST", apiEndpoint, true);
      xhr.send(formData);
    } catch (error) {
      console.error("Hiba a kép feltöltése során:", error);
      toast.error("Hiba a kép feltöltése során");
      setIsUploading(false);
    }
  };

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file && file.size > maxSize) {
          toast.error(`A fájl túl nagy. A maximális méret ${Math.round(maxSize / 1024 / 1024)}MB.`);
          return;
        }
        if (file) handleImageUpload(file);
      }
    },
    [maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": []
    },
    maxFiles: 1,
    maxSize,
    disabled: isUploading || disabled
  });

  const handleRemoveImage = () => {
    field.onChange("");
  };

  return (
    <div className="space-y-4">
      {!field.value ? (
        <div
          {...getRootProps()}
          className={cn(
            "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition bg-white hover:bg-muted/50",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragActive && "border-muted-foreground/50",
            (isUploading || disabled) && "pointer-events-none opacity-60",
            className
          )}
        >
          <Input
            {...getInputProps()}
            id="image-upload"
            accept="image/*"
            type="file"
            className="hidden"
            disabled={isUploading || disabled}
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <Progress value={progress} className="w-[60%] h-2" />
              <p className="text-sm font-medium text-muted-foreground">
                Kép feltöltése... {progress}%
              </p>
            </div>
          ) : (
            <>
              {isDragActive ? (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  <div className="rounded-full border border-dashed p-3">
                    <Upload
                      className="size-7 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    Húzd ide a képet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  <div className="rounded-full border border-dashed p-3">
                    <Upload
                      className="size-7 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-col gap-px">
                    <p className="font-medium text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground/70">
                      Kattints vagy húzd ide a képet a feltöltéshez <br />(Max. {Math.round(maxSize / 1024 / 1024)}MB)
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border">
          <div className="aspect-video relative">
            <Image
              src={field.value}
              alt="Feltöltött kép"
              fill
              className="object-contain bg-gradient-to-br from-neutral-50 to-neutral-100"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2"
            >
              <X className="size-4 mr-2" aria-hidden="true" />
              Kép eltávolítása
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Űrlap-specifikus wrapper komponens
export function FormImageUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  ...props
}: Omit<ImageUploadProps<TFieldValues, TName>, "field">) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <ImageUpload name={name} control={control} {...props} />
      )}
    />
  );
}
