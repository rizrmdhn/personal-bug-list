"use client";

import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Copy, Info, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { createApplicationSchema } from "@/schema/application.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { api } from "@/trpc/react";
import { globalErrorToast, globalSuccessToast } from "@/lib/toast";
import { useState } from "react";
import { type SelectApplication } from "@/types/applications.types";
import { Label } from "./ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export default function CreateApplicationForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [data, setData] = useState<SelectApplication | undefined>(undefined);

  const utils = api.useUtils();

  const createApplicationMutation = api.applications.create.useMutation({
    onSuccess: (data) => {
      globalSuccessToast("Application created successfully");

      utils.applications.paginate.invalidate();
      setIsSubmitted(true);
      setData(data);
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  const form = useForm<z.infer<typeof createApplicationSchema>>({
    disabled: createApplicationMutation.isPending || isSubmitted,
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof createApplicationSchema>) {
    if (createApplicationMutation.isPending || isSubmitted) return;
    createApplicationMutation.mutate(values);
  }

  return (
    <ScrollArea className="flex w-full flex-col items-center justify-center overflow-y-auto">
      <div className="flex flex-col items-center justify-center p-0 pb-4 pt-4 lg:p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please enter the application name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {data && (
              <>
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    Please save these credentials. You won&apos;t be able to see
                    them again.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="appKey">App Key</Label>
                  <div className="relative">
                    <Input
                      id="appKey"
                      placeholder="Your App Key"
                      defaultValue={data.key}
                      disabled
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                      onClick={() => {
                        navigator.clipboard.writeText(data.key);
                        globalSuccessToast("Copied to clipboard!");
                      }}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="appSecret">App Secret</Label>
                  <div className="relative">
                    <Input
                      id="appSecret"
                      placeholder="Your App Secret"
                      defaultValue={data.secret}
                      disabled
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                      onClick={() => {
                        navigator.clipboard.writeText(data.secret);
                        globalSuccessToast("Copied to clipboard!");
                      }}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            <Button
              type="submit"
              className="mt-4"
              disabled={createApplicationMutation.isPending || isSubmitted}
            >
              {createApplicationMutation.isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create
            </Button>
          </form>
        </Form>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
