"use client";

/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { api } from "@/trpc/react";
import { useParams, useSearchParams } from "next/navigation";

export default function BugImagesCarousel() {
  const { bugId } = useParams<{ bugId: string }>();
  const searchParams = useSearchParams();

  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const [images] = api.bugImages.get.useSuspenseQuery({ bugId });

  React.useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  React.useEffect(() => {
    // get current image index based on query params in currentImage id
    const currentImage = searchParams.get("currentImage");

    if (currentImage) {
      const index = images.findIndex((image) => image.id === currentImage);
      if (index !== -1) {
        carouselApi?.scrollTo(index);
      }
    }
  }, [carouselApi, images, searchParams]);

  return (
    <div className="mx-auto max-w-3xl">
      <Carousel setApi={setCarouselApi} className="w-full max-w-xl">
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <img
                    src={image.url}
                    alt={image.file}
                    className="object-contain"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="py-2 text-center text-sm text-muted-foreground">
        Slide {current} of {count}
      </div>
    </div>
  );
}
